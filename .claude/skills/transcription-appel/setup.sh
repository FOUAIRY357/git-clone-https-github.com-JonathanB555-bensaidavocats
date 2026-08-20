#!/usr/bin/env bash
# Installe le moteur de transcription local (sherpa-onnx + modèles Whisper).
# Idempotent : relancer ne retélécharge que ce qui manque.
#
#   bash setup.sh            # modèle medium (défaut) + VAD + diarisation
#   bash setup.sh small      # modèle rapide
#   bash setup.sh large-v3   # qualité maximale, lent
#   bash setup.sh --selftest # vérifie l'installation
set -euo pipefail

MODEL="${1:-medium}"
DIR="${BENSAID_ASR_MODELS:-$HOME/.cache/bensaid-asr}"
REL="https://github.com/k2-fsa/sherpa-onnx/releases/download"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$DIR"

if [ "$MODEL" = "--selftest" ]; then
  for m in small medium large-v3; do
    if [ -d "$DIR/sherpa-onnx-whisper-$m" ]; then
      wav="$DIR/sherpa-onnx-whisper-$m/test_wavs/0.wav"
      echo "== autotest sur $m"
      python3 "$SKILL_DIR/transcribe.py" --audio "$wav" --model "$m" --language en \
        --out-dir "$(mktemp -d)" --no-lexique >/dev/null && echo "   OK"
      exit 0
    fi
  done
  echo "Aucun modèle installé. Lancez : bash setup.sh" >&2
  exit 1
fi

echo "== dépendances Python"
python3 -c "import sherpa_onnx, av, soundfile, numpy" 2>/dev/null \
  || pip3 install --quiet --break-system-packages sherpa-onnx av soundfile numpy

fetch() {  # fetch <url> <fichier-local>
  [ -e "$DIR/$2" ] && { echo "   $2 déjà présent"; return; }
  echo "   téléchargement $2"
  curl -sSL --retry 3 --max-time 1800 -o "$DIR/$2" "$1"
}

fetch_tar() {  # fetch_tar <url> <dossier-attendu>
  [ -d "$DIR/$2" ] && { echo "   $2 déjà présent"; return; }
  echo "   téléchargement $2"
  curl -sSL --retry 3 --max-time 1800 -o "$DIR/_tmp.tar.bz2" "$1"
  tar xf "$DIR/_tmp.tar.bz2" -C "$DIR"
  rm -f "$DIR/_tmp.tar.bz2"
}

echo "== détection de la parole (Silero VAD)"
fetch "$REL/asr-models/silero_vad.onnx" "silero_vad.onnx"

echo "== modèle Whisper : $MODEL"
case "$MODEL" in
  small|medium|large-v3) ;;
  *) echo "Modèle inconnu : $MODEL (small | medium | large-v3)" >&2; exit 1 ;;
esac
fetch_tar "$REL/asr-models/sherpa-onnx-whisper-$MODEL.tar.bz2" "sherpa-onnx-whisper-$MODEL"
# les poids fp32 doublent la place disque sans gain utile ici
rm -f "$DIR/sherpa-onnx-whisper-$MODEL/$MODEL-encoder.onnx" \
      "$DIR/sherpa-onnx-whisper-$MODEL/$MODEL-decoder.onnx"

echo "== séparation des locuteurs"
fetch_tar "$REL/speaker-segmentation-models/sherpa-onnx-pyannote-segmentation-3-0.tar.bz2" \
          "sherpa-onnx-pyannote-segmentation-3-0"
fetch "$REL/speaker-recongition-models/3dspeaker_speech_campplus_sv_zh_en_16k-common_advanced.onnx" \
      "3dspeaker_speech_campplus_sv_zh_en_16k-common_advanced.onnx"

echo
echo "Installation terminée dans $DIR"
du -sh "$DIR"
