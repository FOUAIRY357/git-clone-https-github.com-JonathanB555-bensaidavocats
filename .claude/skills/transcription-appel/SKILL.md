---
name: transcription-appel
description: >
  Transcrit un enregistrement d'appel (3CX, dictaphone, visio) en texte horodaté, avec
  séparation des locuteurs, entièrement en local : l'audio ne quitte jamais la machine, le
  secret professionnel est préservé. Produit la transcription brute puis, à la demande, le
  compte rendu d'entretien et la demande de pièces qui en découle. Déclencher quand
  l'utilisateur dit « fais la transcription », « transcris cet appel », « voici
  l'enregistrement », « qu'est-ce qui s'est dit au téléphone », dépose un fichier .wav /
  .mp3 / .m4a, ou tape "/transcription-appel <fichier>". En amont de [[template-cabinet]]
  (compte rendu) et [[redaction-mail]] (demande de pièces).
---

# Transcription d'un appel

Moteur local : sherpa-onnx (Whisper ONNX, Silero VAD, diarisation pyannote + 3D-Speaker).
Aucun audio n'est envoyé à un service tiers. C'est la seule façon acceptable de traiter un
échange couvert par le secret professionnel.

## 1. Récupérer l'audio dans la session

C'est le vrai point de blocage : **la session tourne dans un conteneur distant, pas sur le
Mac.** Un chemin `/Users/bensaidavocats/Downloads/...` n'existe pas ici.

Trois voies, par ordre de fiabilité :

1. **Joindre le fichier au message** (trombone de l'app). Il arrive dans le conteneur, on
   travaille directement dessus. C'est la voie sûre.
2. **Déposer le fichier sur Google Drive ou SharePoint**, puis le récupérer par le MCP
   correspondant (`Google_Drive` / `Microsoft_365`) et l'écrire sur disque.
3. **Lien 3CX reçu par mail** : inutilisable ici. `bensaid-avocats.my3cx.fr:5001` est un
   port HTTPS non standard, que le proxy de sortie ne relaie pas. Ne pas insister, demander
   le fichier.

Si l'audio n'est pas accessible, le dire tout de suite et demander la pièce jointe. Ne
jamais inventer un contenu d'appel.

## 2. Installer le moteur

Le conteneur est éphémère : à chaque nouvelle session, réinstaller (environ 2 minutes).

```bash
bash .claude/skills/transcription-appel/setup.sh          # medium, le bon compromis
bash .claude/skills/transcription-appel/setup.sh small    # rapide, pour un premier jet
bash .claude/skills/transcription-appel/setup.sh large-v3 # qualité maximale
bash .claude/skills/transcription-appel/setup.sh --selftest
```

Le script est idempotent : il ne retélécharge que ce qui manque. Les modèles vont dans
`~/.cache/bensaid-asr` (surchargeable par `BENSAID_ASR_MODELS`).

**Contrainte réseau à connaître.** Hugging Face est bloqué par la politique de sortie
(403). Tous les modèles viennent donc des *releases* GitHub de sherpa-onnx, qui sont
autorisées. Ne pas tenter de contourner : si un téléchargement renvoie 403, le signaler.

## 3. Transcrire

```bash
python3 .claude/skills/transcription-appel/transcribe.py \
  --audio livrables/sivam/appel.wav \
  --model medium --language fr \
  --diarize --speakers 2 \
  --labels "Me OUAIRY,Mme SIVAM" \
  --out-dir livrables/sivam
```

Sortie : `appel.txt` (lisible, horodaté `[mm:ss]` par locuteur) et `appel.json` (segments
structurés, pour retrouver un passage précis).

Un appel long se lance **en tâche de fond** : ne pas bloquer la session dessus.

### Choix du modèle (mesuré sur ce conteneur, 4 cœurs)

| Modèle     | Vitesse        | Appel de 5 min | Usage |
| ---------- | -------------- | -------------- | ----- |
| `small`    | ~1,0x le réel  | ~5 min         | premier jet, savoir de quoi parle l'appel |
| `medium`   | ~3,5x le réel  | ~18 min        | défaut, transcription de travail |
| `large-v3` | ~7,5x le réel  | ~38 min        | appel décisif, chiffres et noms critiques |

### Options utiles

- `--speakers 2` : un appel téléphonique a deux locuteurs. Le préciser améliore nettement
  la séparation. `0` laisse le nombre libre (réunion, conférence à trois).
- `--labels "A,B"` : les noms suivent l'ordre des groupes détectés, **pas** l'ordre de
  parole. Toujours vérifier sur les premières répliques et relancer le rendu si c'est
  inversé (le `.json` conserve les indices).
- `--lexique dossier.json` : corrections propres au dossier (nom du client, de sa société,
  d'une commune). Même format que `lexique.json`.
- `--language en` / `de` / `it` : appel en langue étrangère.
- `--pad 0.5` : élargit les segments si des fins de phrase sont coupées.

Le fichier `lexique.json` du skill corrige d'office ce que Whisper écorche à chaque fois :
BENSAID, OUAIRY, BOFiP, non-résident, plus-value. **L'enrichir dès qu'une erreur revient**
plutôt que de la corriger à la main à chaque appel.

## 4. Relire avant d'exploiter

La machine se trompe. Trois contrôles systématiques :

- **Les chiffres** : montants, taux, dates, numéros de formulaire. Whisper transforme
  volontiers « 3916 » en « 31916 ». Réécouter le passage en cas de doute.
- **Les noms propres** : personnes, sociétés, communes, juridictions.
- **Les négations et les conditionnels** : c'est là que le sens du dossier bascule.

Signaler à François les passages incertains plutôt que de les lisser. Une transcription
propre mais fausse est pire qu'une transcription qui affiche son doute : marquer
`[inaudible]` ou `[à vérifier]`.

## 5. Ce qu'on en fait ensuite

La transcription est une matière première, jamais un livrable client.

1. **Compte rendu d'entretien** : passer par [[template-cabinet]]. Structure : les faits
   exposés, la question posée, ce qui a été dit en séance, les suites. On rédige en phrases
   d'avocat, on ne recopie pas le verbatim.
2. **Demande de pièces** : passer par [[redaction-mail]]. On ne demande que ce qui sert
   l'analyse annoncée, chaque pièce reliée à ce qu'elle permet d'établir. Une liste de
   trente pièces fait fuir le client.
3. **Premier contact** si l'appel vient d'un prospect : [[premier-contact]], puis
   [[rdv-cadrage]] pour le rendez-vous de cadrage.

Ranger les fichiers dans `livrables/<nom-client>/`, conformément à [[charte-cabinet]].

## 6. Si ça casse

- `Modèle absent` : relancer `setup.sh`.
- `Aucune parole détectée` : vérifier que le fichier contient bien de l'audio
  (`python3 -c "import av; c=av.open('f.wav'); print(c.streams.audio)"`).
- Transcription vide ou en anglais sur un appel français : `--language fr` a été oublié.
- Deux locuteurs fusionnés en un seul : forcer `--speakers 2`.
- Lenteur : le modèle `medium` sature les 4 cœurs. Ne pas lancer deux transcriptions en
  parallèle, elles se ralentissent mutuellement.
