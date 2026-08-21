#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
transcrire.py - transcrit un fichier audio en français, hors ligne.

Usage :
    python3 .claude/skills/transcription/transcrire.py AUDIO [options]

Options utiles :
    --sortie FICHIER   écrit un .md horodaté (sinon, stdout seulement)
    --rapide           décodage glouton, environ deux fois plus vite, un peu
                       moins fidèle sur les noms propres et les chiffres
    --modele CHEMIN    modèle CTranslate2 à utiliser (défaut : cache du skill)
    --contexte "..."   vocabulaire attendu, pour guider les noms propres
    --langue fr        forcer une autre langue si besoin

Le décodage audio passe par PyAV, qui embarque ses propres bibliothèques
ffmpeg. C'est volontaire : le binaire ffmpeg est absent des sessions cloud,
alors que PyAV arrive avec faster-whisper. Tous les formats courants passent
donc sans dépendance externe (wav, m4a des dictaphones iPhone, mp3, ogg, mp4).
"""
import argparse
import os
import sys
import time

import numpy as np

CACHE_DEFAUT = os.path.expanduser("~/.cache/bensaid-whisper/ct2-large-v2")
TAUX = 16000  # Whisper travaille en 16 kHz, quelle que soit la source

# Amorce de vocabulaire. Whisper s'appuie dessus pour trancher entre deux
# graphies plausibles, ce qui compte surtout sur les termes du cabinet et les
# formes sociales. À garder court : une amorce trop longue déforme le début.
CONTEXTE_CABINET = (
    "Cabinet BENSAID AVOCATS, Paris et Genève. Fiscalité internationale, TVA, "
    "établissement stable, prix de transfert, résidence fiscale, SARL, SA, SAS, "
    "holding, pacte d'associés, convention d'honoraires, rendez-vous de cadrage."
)


def decoder(chemin):
    """Renvoie un mono float32 à 16 kHz, quel que soit le format d'entrée."""
    import av

    with av.open(chemin) as conteneur:
        if not conteneur.streams.audio:
            raise SystemExit(f"Aucune piste audio dans {chemin}")
        piste = conteneur.streams.audio[0]
        src_taux = piste.codec_context.sample_rate
        src_canaux = piste.codec_context.channels
        duree = float(conteneur.duration or 0) / 1_000_000

        reechantillonneur = av.AudioResampler(format="s16", layout="mono", rate=TAUX)
        morceaux = []
        for trame in conteneur.decode(piste):
            for sortie in reechantillonneur.resample(trame):
                morceaux.append(sortie.to_ndarray().reshape(-1))
        for sortie in reechantillonneur.resample(None):  # vidange du tampon
            morceaux.append(sortie.to_ndarray().reshape(-1))

    if not morceaux:
        raise SystemExit(f"Décodage vide pour {chemin}")
    signal = np.concatenate(morceaux).astype(np.float32) / 32768.0
    print(f"source {src_taux} Hz, {src_canaux} canal(aux), "
          f"{duree or len(signal)/TAUX:.1f} s", file=sys.stderr, flush=True)
    return signal


def horodater(secondes):
    return f"[{int(secondes)//60:02d}:{int(secondes) % 60:02d}]"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--sortie")
    ap.add_argument("--modele", default=CACHE_DEFAUT)
    ap.add_argument("--langue", default="fr")
    ap.add_argument("--rapide", action="store_true")
    ap.add_argument("--contexte", default=CONTEXTE_CABINET)
    ap.add_argument("--titre", default=None)
    args = ap.parse_args()

    if not os.path.exists(args.audio):
        raise SystemExit(f"Fichier introuvable : {args.audio}")
    if args.modele != "large-v3" and not os.path.isdir(args.modele):
        raise SystemExit(
            f"Modèle absent de {args.modele}.\n"
            f"Lancer d'abord : python3 .claude/skills/transcription/setup_modele.py"
        )

    signal = decoder(args.audio)

    from faster_whisper import WhisperModel
    modele = WhisperModel(args.modele, device="cpu", compute_type="int8",
                          cpu_threads=os.cpu_count() or 4)

    debut = time.time()
    segments, info = modele.transcribe(
        signal,
        language=args.langue,
        task="transcribe",
        beam_size=1 if args.rapide else 5,
        initial_prompt=args.contexte or None,
        # Le filtre de voix évite que Whisper « meuble » les silences, travers
        # classique sur les enregistrements téléphoniques.
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=400),
        condition_on_previous_text=True,
        temperature=[0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
        no_speech_threshold=0.6,
    )
    print(f"langue {info.language} (p={info.language_probability:.2f})",
          file=sys.stderr, flush=True)

    lignes = []
    for s in segments:
        ligne = f"{horodater(s.start)} {s.text.strip()}"
        print(ligne, flush=True)
        lignes.append(ligne)

    ecoule = time.time() - debut
    print(f"\n{len(lignes)} segments, {ecoule/60:.1f} min de calcul",
          file=sys.stderr)

    if args.sortie:
        os.makedirs(os.path.dirname(os.path.abspath(args.sortie)), exist_ok=True)
        titre = args.titre or f"Transcription de {os.path.basename(args.audio)}"
        entete = [
            f"# {titre}",
            "",
            f"Durée {len(signal)/TAUX/60:.0f} min {len(signal)/TAUX % 60:02.0f} s. "
            f"Transcription automatique, langue détectée {info.language} "
            f"avec une probabilité de {info.language_probability:.2f}.",
            "Horodatage au format [mm:ss]. Relire les passages signalés douteux "
            "avant tout usage dans un écrit adressé au client.",
            "",
        ]
        with open(args.sortie, "w") as f:
            f.write("\n".join(entete + lignes) + "\n")
        print(f"écrit dans {args.sortie}", file=sys.stderr)


if __name__ == "__main__":
    main()
