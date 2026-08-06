#!/usr/bin/env python3
"""Transcription locale d'un enregistrement d'appel (francais).

Usage :
    pip install faster-whisper numpy
    python3 transcribe.py <fichier.wav> [modele]

  modele : tiny | base | small | medium | large-v3   (defaut : medium)
  sortie : <fichier>.transcript.txt   (horodatee mm:ss)

Notes :
- Le modele se telecharge depuis huggingface.co au premier lancement (bloque
  dans la session cloud, libre en local : c'est la raison du transfert).
- Fichier attendu : WAV PCM 16 bits (mono ou stereo). Pour un autre format
  (m4a, mp3), installer 'av' (pip install av) ou convertir d'abord en WAV
  16 kHz avec ffmpeg :  ffmpeg -i entree.m4a -ar 16000 -ac 1 sortie.wav
- CPU par defaut (compute_type int8). Sur Apple Silicon, whisper.cpp (Metal)
  est une alternative plus rapide.
"""
import sys, os, wave
import numpy as np


def load_wav_16k(path):
    w = wave.open(path, "rb")
    sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
    raw = w.readframes(n)
    w.close()
    if sw != 2:
        raise SystemExit(f"WAV non 16 bits (sampwidth={sw}). Convertir en PCM 16 bits d'abord.")
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    if sr != 16000:
        idx = np.linspace(0, len(x) - 1, int(round(len(x) * 16000 / sr)))
        x = np.interp(idx, np.arange(len(x)), x).astype(np.float32)
    return x


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage : python3 transcribe.py <fichier.wav> [modele]")
    src = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else "medium"
    out = os.path.splitext(src)[0] + ".transcript.txt"

    from faster_whisper import WhisperModel

    audio = load_wav_16k(src)
    print(f"audio : {len(audio)/16000:.0f}s | modele : {model_name}", flush=True)
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        audio, language="fr", beam_size=5,
        vad_filter=True, condition_on_previous_text=False,
    )
    with open(out, "w") as f:
        for s in segments:
            mm, ss = divmod(int(s.start), 60)
            line = f"[{mm:02d}:{ss:02d}] {s.text.strip()}"
            f.write(line + "\n")
            f.flush()
            print(line, flush=True)
    print(f"\nOK -> {out}", flush=True)


if __name__ == "__main__":
    main()
