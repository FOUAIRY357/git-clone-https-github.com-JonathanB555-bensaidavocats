#!/usr/bin/env python3
"""Transcription d'un enregistrement d'appel, 100 % en local.

Moteur : sherpa-onnx (Whisper ONNX + Silero VAD + diarisation pyannote/3D-Speaker).
Aucun envoi de l'audio vers un service tiers : le secret professionnel est préservé.

    python3 transcribe.py --audio appel.wav --diarize --speakers 2

Sortie : <nom>.txt (lisible) et <nom>.json (segments horodatés) à côté de l'audio,
ou dans --out-dir.
"""

import argparse
import json
import os
import re
import sys
import time

import numpy as np

MODELS_DIR = os.environ.get("BENSAID_ASR_MODELS", os.path.expanduser("~/.cache/bensaid-asr"))
SAMPLE_RATE = 16000
MAX_CHUNK_S = 28.0          # Whisper ne traite que 30 s par passe
BATCH = 4

MODELS = {
    "small": "sherpa-onnx-whisper-small",
    "medium": "sherpa-onnx-whisper-medium",
    "large-v3": "sherpa-onnx-whisper-large-v3",
}


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", file=sys.stderr, flush=True)


def load_audio(path):
    """Décode n'importe quel format vers du mono 16 kHz float32."""
    import av

    with av.open(path) as container:
        stream = container.streams.audio[0]
        resampler = av.audio.resampler.AudioResampler(format="s16", layout="mono", rate=SAMPLE_RATE)
        blocks = []
        for frame in container.decode(stream):
            for out in resampler.resample(frame):
                blocks.append(out.to_ndarray().reshape(-1))
        for out in resampler.resample(None):
            blocks.append(out.to_ndarray().reshape(-1))

    if not blocks:
        raise SystemExit(f"Aucune piste audio exploitable dans {path}")
    return np.concatenate(blocks).astype(np.float32) / 32768.0


def model_paths(name, quant):
    root = os.path.join(MODELS_DIR, MODELS[name])
    if not os.path.isdir(root):
        raise SystemExit(
            f"Modèle absent : {root}\nLancez d'abord : bash setup.sh {name}"
        )
    order = [".int8", ""] if quant else ["", ".int8"]

    def pick(kind):
        for suffix in order:
            path = os.path.join(root, f"{name}-{kind}{suffix}.onnx")
            if os.path.exists(path):
                return path
        raise SystemExit(f"Fichier de modèle manquant : {root}/{name}-{kind}*.onnx")

    tokens = os.path.join(root, f"{name}-tokens.txt")
    if not os.path.exists(tokens):
        raise SystemExit(f"Fichier de modèle manquant : {tokens}")
    return pick("encoder"), pick("decoder"), tokens


def build_recognizer(name, quant, language, threads):
    import sherpa_onnx

    encoder, decoder, tokens = model_paths(name, quant)
    log(f"chargement du modèle {name}{' int8' if quant else ''} ({language})")
    return sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=encoder,
        decoder=decoder,
        tokens=tokens,
        language=language,
        task="transcribe",
        num_threads=threads,
        decoding_method="greedy_search",
    )


def vad_segments(samples, threads, max_speech=MAX_CHUNK_S):
    """Découpe l'audio en zones de parole (Silero VAD)."""
    import sherpa_onnx

    vad_model = os.path.join(MODELS_DIR, "silero_vad.onnx")
    if not os.path.exists(vad_model):
        raise SystemExit(f"Modèle VAD absent : {vad_model}\nLancez : bash setup.sh")

    config = sherpa_onnx.VadModelConfig(
        silero_vad=sherpa_onnx.SileroVadModelConfig(
            model=vad_model,
            threshold=0.5,
            min_silence_duration=0.35,
            min_speech_duration=0.2,
            max_speech_duration=max_speech,
        ),
        sample_rate=SAMPLE_RATE,
        num_threads=threads,
    )
    vad = sherpa_onnx.VoiceActivityDetector(config, buffer_size_in_seconds=180)

    window = 512
    segments = []
    for start in range(0, len(samples), window):
        vad.accept_waveform(samples[start:start + window])
        while not vad.empty():
            seg = vad.front
            offset = seg.start / SAMPLE_RATE
            segments.append((offset, offset + len(seg.samples) / SAMPLE_RATE, None))
            vad.pop()
    vad.flush()
    while not vad.empty():
        seg = vad.front
        offset = seg.start / SAMPLE_RATE
        segments.append((offset, offset + len(seg.samples) / SAMPLE_RATE, None))
        vad.pop()
    return segments


def diarize_segments(samples, speakers, threads):
    """Attribue chaque zone de parole à un locuteur."""
    import sherpa_onnx

    seg_model = os.path.join(
        MODELS_DIR, "sherpa-onnx-pyannote-segmentation-3-0", "model.onnx"
    )
    emb_model = os.path.join(
        MODELS_DIR, "3dspeaker_speech_campplus_sv_zh_en_16k-common_advanced.onnx"
    )
    for p in (seg_model, emb_model):
        if not os.path.exists(p):
            raise SystemExit(f"Modèle de diarisation absent : {p}\nLancez : bash setup.sh --diarize")

    log(f"diarisation ({'auto' if speakers <= 0 else str(speakers) + ' locuteurs'})")
    config = sherpa_onnx.OfflineSpeakerDiarizationConfig(
        segmentation=sherpa_onnx.OfflineSpeakerSegmentationModelConfig(
            pyannote=sherpa_onnx.OfflineSpeakerSegmentationPyannoteModelConfig(model=seg_model),
            num_threads=threads,
        ),
        embedding=sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=emb_model, num_threads=threads),
        clustering=sherpa_onnx.FastClusteringConfig(
            num_clusters=speakers if speakers > 0 else -1,
            threshold=0.5,
        ),
        min_duration_on=0.3,
        min_duration_off=0.5,
    )
    sd = sherpa_onnx.OfflineSpeakerDiarization(config)
    if sd.sample_rate != SAMPLE_RATE:
        raise SystemExit(f"Diarisation attendue en {sd.sample_rate} Hz")
    result = sd.process(samples).sort_by_start_time()
    return [(s.start, s.end, s.speaker) for s in result]


def assign_speakers(vad_spans, diar_spans):
    """Frontières du VAD (fidèles à la parole) + identité issue de la diarisation."""
    out = []
    for start, end, _ in vad_spans:
        best_speaker, best_overlap = None, 0.0
        for d_start, d_end, speaker in diar_spans:
            overlap = min(end, d_end) - max(start, d_start)
            if overlap > best_overlap:
                best_speaker, best_overlap = speaker, overlap
        out.append((start, end, best_speaker))
    return out


def pad_segments(segments, duration, pad):
    """Élargit chaque zone : les frontières serrées coupent les fins de mot."""
    if pad <= 0:
        return segments
    return [
        (max(0.0, start - pad), min(duration, end + pad), speaker)
        for start, end, speaker in segments
    ]


def split_long(segments, max_len=MAX_CHUNK_S):
    """Whisper plafonne à 30 s : on redécoupe les zones trop longues."""
    out = []
    for start, end, speaker in segments:
        cursor = start
        while end - cursor > max_len:
            out.append((cursor, cursor + max_len, speaker))
            cursor += max_len
        if end - cursor > 0.15:
            out.append((cursor, end, speaker))
    return out


def transcribe(recognizer, samples, segments):
    texts = []
    total = len(segments)
    for i in range(0, total, BATCH):
        batch = segments[i:i + BATCH]
        streams = []
        for start, end, _ in batch:
            chunk = samples[int(start * SAMPLE_RATE):int(end * SAMPLE_RATE)]
            stream = recognizer.create_stream()
            stream.accept_waveform(SAMPLE_RATE, chunk)
            streams.append(stream)
        recognizer.decode_streams(streams)
        texts.extend(s.result.text.strip() for s in streams)
        log(f"  {min(i + BATCH, total)}/{total} segments")
    return texts


def load_lexicon(paths):
    """Charge les règles de correction (noms du cabinet, termes techniques)."""
    rules = []
    for path in paths:
        if not path or not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
        for pattern, replacement in data.get("corrections", {}).items():
            rules.append((re.compile(rf"\b(?:{pattern})\b", re.IGNORECASE), replacement))
    return rules


def apply_lexicon(texts, rules):
    """Corrige les textes et renvoie le compte des substitutions par règle."""
    if not rules:
        return texts, {}
    counts = {}
    fixed = []
    for text in texts:
        for regex, replacement in rules:
            text, n = regex.subn(replacement, text)
            if n:
                label = re.sub(r"\\\d", "", replacement)
                counts[label] = counts.get(label, 0) + n
        fixed.append(text)
    return fixed, counts


def mmss(seconds):
    return f"{int(seconds) // 60:02d}:{int(seconds) % 60:02d}"


def render(segments, texts, label_map):
    lines = []
    previous = None
    for (start, _end, speaker), text in zip(segments, texts):
        if not text:
            continue
        who = label_map.get(speaker, f"Locuteur {speaker + 1}") if speaker is not None else None
        if who != previous:
            lines.append("")
            lines.append(f"[{mmss(start)}] {who}" if who else f"[{mmss(start)}]")
            previous = who
        lines.append(text)
    return "\n".join(lines).strip() + "\n"


def main():
    parser = argparse.ArgumentParser(description="Transcription locale d'un appel")
    parser.add_argument("--audio", required=True, help="fichier audio (wav, mp3, m4a, opus...)")
    parser.add_argument("--model", default="small", choices=sorted(MODELS), help="modèle Whisper")
    parser.add_argument("--language", default="fr", help="code langue (fr, en, de...)")
    parser.add_argument("--diarize", action="store_true", help="séparer les locuteurs")
    parser.add_argument("--speakers", type=int, default=0, help="nombre de locuteurs (0 = auto)")
    parser.add_argument("--labels", default="", help="noms des locuteurs, ex: 'Me OUAIRY,Cliente'")
    parser.add_argument("--threads", type=int, default=os.cpu_count() or 4)
    parser.add_argument("--full-precision", action="store_true", help="fp32 au lieu de int8")
    parser.add_argument("--pad", type=float, default=0.3, help="marge ajoutée autour de chaque segment (s)")
    parser.add_argument("--lexique", default="", help="fichier JSON de corrections propre au dossier")
    parser.add_argument("--no-lexique", action="store_true", help="désactive le lexique du cabinet")
    parser.add_argument("--out-dir", default="", help="dossier de sortie")
    args = parser.parse_args()

    if not os.path.exists(args.audio):
        raise SystemExit(f"Fichier introuvable : {args.audio}")

    started = time.time()
    samples = load_audio(args.audio)
    duration = len(samples) / SAMPLE_RATE
    log(f"audio chargé : {mmss(duration)} ({duration:.1f} s)")

    segments = vad_segments(samples, args.threads)
    if args.diarize:
        diar = diarize_segments(samples, args.speakers, args.threads)
        if diar:
            segments = assign_speakers(segments, diar)
        else:
            log("diarisation sans résultat : transcription sans locuteurs")

    segments = split_long(pad_segments(segments, duration, args.pad))
    log(f"{len(segments)} segments à transcrire")
    if not segments:
        raise SystemExit("Aucune parole détectée dans l'enregistrement.")

    recognizer = build_recognizer(args.model, not args.full_precision, args.language, args.threads)
    texts = transcribe(recognizer, samples, segments)

    lexicon_files = [] if args.no_lexique else [os.path.join(os.path.dirname(os.path.abspath(__file__)), "lexique.json")]
    if args.lexique:
        lexicon_files.append(args.lexique)
    texts, corrections = apply_lexicon(texts, load_lexicon(lexicon_files))
    if corrections:
        log("corrections lexique : " + ", ".join(f"{k} x{v}" for k, v in sorted(corrections.items())))

    label_map = {}
    if args.labels:
        for index, name in enumerate(n.strip() for n in args.labels.split(",")):
            if name:
                label_map[index] = name

    out_dir = args.out_dir or os.path.dirname(os.path.abspath(args.audio))
    os.makedirs(out_dir, exist_ok=True)
    stem = os.path.splitext(os.path.basename(args.audio))[0]
    txt_path = os.path.join(out_dir, f"{stem}.txt")
    json_path = os.path.join(out_dir, f"{stem}.json")

    with open(txt_path, "w", encoding="utf-8") as fh:
        fh.write(render(segments, texts, label_map))

    payload = {
        "audio": os.path.abspath(args.audio),
        "duree_s": round(duration, 2),
        "modele": args.model,
        "langue": args.language,
        "diarisation": bool(args.diarize),
        "segments": [
            {
                "debut": round(start, 2),
                "fin": round(end, 2),
                "locuteur": label_map.get(speaker, f"Locuteur {speaker + 1}") if speaker is not None else None,
                "texte": text,
            }
            for (start, end, speaker), text in zip(segments, texts)
            if text
        ],
    }
    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)

    elapsed = time.time() - started
    log(f"terminé en {elapsed:.0f} s ({elapsed / max(duration, 1):.2f}x temps réel)")
    print(txt_path)
    print(json_path)


if __name__ == "__main__":
    main()
