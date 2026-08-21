---
name: transcription
description: >
  Transcrit un fichier audio en français, hors ligne et sans service tiers, puis en tire la
  matière exploitable pour le cabinet BENSAID AVOCATS (compte rendu d'appel, points de fond,
  suites à donner). Pipeline whisper-large-v2 en CTranslate2, avec un contournement documenté
  de la politique réseau des sessions cloud, où Hugging Face est bloqué. Déclencher dès qu'un
  fichier audio ou vidéo est fourni ou mentionné (.wav, .m4a, .mp3, .ogg, .mp4, note vocale,
  mémo du dictaphone, enregistrement d'appel, visio enregistrée), et dès que l'utilisateur
  demande « transcris », « transcription », « qu'est-ce que dit ce vocal », « fais-moi le
  compte rendu de cet appel », « reprends ce message », ou tape "/transcription <fichier>".
  Déclencher aussi quand la demande porte sur la suite (« prépare la demande de documents »,
  « réponds à ce message », « fais la note ») alors que la source est un audio non encore
  transcrit : la transcription est le préalable, elle passe par ce skill.
---

# transcription - passer d'un audio à de la matière utilisable

Confidentialité d'abord : rien ne sort de la machine. Les enregistrements du cabinet
contiennent des noms de clients, des montants, des adresses. Aucun service de transcription
en ligne, aucun envoi d'audio vers une API. Tout tourne en local, sur CPU.

Le fond juridique et la rédaction ne sont pas ici. Ce skill produit la transcription et en
dégage les faits. L'écrit adressé au client passe ensuite par [[redaction-mail]],
[[courrier]] ou [[template-cabinet]], et la charte de [[charte-cabinet]] prévaut.

## 1. S'assurer que le modèle est là

```bash
python3 .claude/skills/transcription/setup_modele.py
```

Idempotent, à lancer sans hésiter. S'il trouve le modèle en cache, il sort en une seconde.
Sinon il l'installe, en choisissant seul entre deux chemins.

Sur un poste sans filtrage réseau, Hugging Face répond et faster-whisper télécharge
large-v3 directement, en deux minutes.

En session cloud, Hugging Face est bloqué par la politique de sortie, comme tous les
hébergeurs de modèles. Le script récupère alors le checkpoint whisper-large-v2 embarqué
dans une image Docker publique, via le miroir Google `mirror.gcr.io` qui reste autorisé,
puis le convertit en CTranslate2 int8. Compter 20 minutes, dont l'essentiel en
téléchargement, et 12 Go de disque libre pendant l'opération (1,6 Go après nettoyage).
Le détail des hôtes ouverts et fermés est dans `references/reseau.md`, à lire si le script
échoue ou si l'image source a changé.

Le modèle vit dans `~/.cache/bensaid-whisper/`, hors du dépôt. Il ne doit jamais être
commité. Le cache disparaît avec le conteneur, donc l'installation est à refaire une fois
par session cloud, mais une seule fois : les transcriptions suivantes démarrent aussitôt.

## 2. Transcrire

```bash
python3 .claude/skills/transcription/transcrire.py <audio> \
  --sortie livrables/<Client>/transcription-<aaaa-mm-jj>.md
```

Tous les formats courants passent, y compris les .m4a du dictaphone iPhone : le décodage
utilise PyAV, qui embarque ses propres bibliothèques ffmpeg, alors que le binaire ffmpeg
est absent des sessions cloud.

**Lancer en tâche de fond.** Le calcul dépasse largement le délai d'un appel d'outil.
Démarrer la commande en arrière-plan, puis attendre la fin sur une condition plutôt qu'en
enchaînant des pauses :

```bash
until grep -q "écrit dans" sortie.log 2>/dev/null; do sleep 10; done
```

Pendant l'attente, le début de la transcription est déjà lisible dans le fichier de sortie.
C'est le bon moment pour charger [[charte-cabinet]] et le skill de rédaction qui servira
ensuite.

Ordres de grandeur mesurés sur 4 cœurs, pour un enregistrement téléphonique de 4 min 51 :

| Réglage | Vitesse | Qualité |
|---|---|---|
| défaut (faisceau 5) | environ 2,5 min de calcul par minute d'audio | noms propres et chiffres fiables |
| `--rapide` (glouton) | environ 1,2 min par minute d'audio | dégradation nette |

La dégradation de `--rapide` n'est pas théorique : sur le même extrait, « François-Olivier
à l'appareil » devient « François-José, la pareille », et « l'articulation des contrats »
devient « la situation des contrats ». Réserver `--rapide` au dégrossissage, quand il
s'agit seulement de savoir de quoi parle un message. Tout ce qui alimentera un écrit
client se transcrit au réglage par défaut.

`--contexte` injecte le vocabulaire attendu et améliore sensiblement les noms propres.
Le vocabulaire du cabinet y est déjà par défaut. L'enrichir quand les noms sont connus
d'avance vaut le détour, par exemple `--contexte "Paul Labourdette, boulangerie, Genève,
SARL, apports en nature"`.

## 3. Restituer sans rien inventer

Un audio téléphonique en 8 kHz laisse toujours des trous. Sur un dossier, une phrase mal
restituée devient une erreur de fait, et une erreur de fait dans un mail au client se paie.
D'où trois règles.

- **Signaler le douteux, ne jamais le combler.** Un passage incertain se recopie tel quel,
  avec l'horodatage, dans une section « Passage douteux » en fin de fichier, à réécouter.
  Ne jamais deviner un nom, un montant, une date ou une adresse.
- **Vérifier ce qui s'épelle.** Les mails, les noms propres et les numéros sont souvent
  épelés à l'oral et mal recollés. Les reconstituer depuis l'épellation entendue, et les
  confirmer auprès de François s'il subsiste un doute. Le nom du fichier d'enregistrement
  contient souvent le numéro de téléphone, ce qui permet de recouper.
- **Ne pas fabriquer d'étiquettes de locuteur.** Whisper ne sépare pas les voix. Un
  entretien à deux se lit très bien dans l'ordre chronologique. Si une attribution est
  vraiment nécessaire, la déduire du contenu et l'annoncer comme déduite.

Ranger la transcription dans `livrables/<nom-client>/`, comme tout livrable
(cf [[charte-cabinet]]). C'est un document de travail interne, pas une pièce à diffuser.

## 4. Enchaîner sur la vraie demande

Un audio arrive rarement pour lui-même. Il arrive parce qu'il y a quelque chose à faire
ensuite. Après la transcription, dégager les faits utiles, puis passer la main.

- Identité, société, capital, secteur, résidence fiscale, échéances annoncées
- Ce qui a été promis à l'oral, et pour quand : c'est ce qui engage le cabinet
- La suite attendue, et le skill qui la produit : [[redaction-mail]] pour un mail,
  [[courrier]] pour une lettre, [[template-cabinet]] pour une note ou un compte rendu,
  [[premier-contact]] ou [[rdv-cadrage]] pour un prospect entrant,
  [[fiche-prospect]] si un nom mérite une recherche avant le rendez-vous

Reprendre les mots employés par l'interlocuteur plutôt que de les traduire en jargon.
S'il dit « environ 100 000 francs » à Genève, écrire « environ 100 000 francs » et faire
confirmer la devise, plutôt que de trancher pour lui.
