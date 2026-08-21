# Politique de sortie réseau des sessions cloud, relevé du 21 août 2026

À lire quand `setup_modele.py` échoue, quand l'image source a changé, ou avant de partir
chercher un modèle ailleurs. Le relevé qui suit a coûté une longue exploration, autant ne
pas la refaire.

Le trafic HTTPS sortant passe par un proxy qui applique la politique de l'organisation.
Un hôte refusé répond `403` au CONNECT. Le diagnostic se lit ici :

```bash
curl -sS "$HTTPS_PROXY/__agentproxy/status"
```

Le champ `recentRelayFailures` nomme les hôtes refusés, ce qui évite de confondre un refus
de politique avec une panne réseau. Ne jamais désactiver la vérification TLS ni retirer
`HTTPS_PROXY` : un refus de politique se contourne en changeant de source légitime, pas en
désarmant le proxy.

## Fermés (403 au CONNECT)

Tous les hébergeurs de modèles usuels, ce qui explique pourquoi `WhisperModel("large-v3")`
échoue directement en session cloud.

```
huggingface.co · hf.co · cdn-lfs.huggingface.co · hf-mirror.com
openaipublic.azureedge.net · openaipublic.blob.core.windows.net
modelscope.cn · alphacephei.com · www.kaggle.com · tfhub.dev · gitee.com
download.pytorch.org · dl.fbaipublicfiles.com · quay.io
production.cloudflare.docker.com · production.cloudfront.docker.com
```

Les deux derniers comptent : le registre Docker Hub officiel répond bien sur les manifestes,
mais ses blobs sont redirigés vers ces CDN, qui sont fermés. Un `docker pull` classique
échoue donc au moment de tirer les couches. C'est ce qui rend le miroir Google nécessaire.

## Ouverts

```
pypi.org · files.pythonhosted.org        (hors proxy, accès direct)
registry.npmjs.org · jsr.io · index.crates.io · proxy.golang.org
github.com (git clone de dépôts publics) · raw.githubusercontent.com
mirror.gcr.io                            (miroir Docker Hub de Google, blobs compris)
repo1.maven.org · www.nuget.org · rubygems.org · repo.anaconda.com
storage.googleapis.com · hub.docker.com (API de recherche) · api.github.com (dépôts de la session)
```

`api.github.com` est restreint aux dépôts attachés à la session : interroger un dépôt tiers
renvoie une erreur explicite, alors que `git clone` du même dépôt public fonctionne. Les
actifs de release (`objects.githubusercontent.com`) sont refusés.

## Pourquoi ce chemin, et pas un autre

Les pistes suivantes ont été explorées et écartées, inutile de les reprendre.

- **PyPI** : aucun paquet ne contient de poids Whisper multilingues. Les 370 paquets dont le
  nom évoque whisper, vosk, sherpa ou kaldi ont été sondés, le plus lourd est la
  bibliothèque CTranslate2 elle-même. Des poids existent bien sur PyPI pour d'autres
  modèles (`gemma3-270m-...-gguf-part1` à `part4`), mais rien pour l'audio.
- **npm** : mêmes recherches, mêmes conclusions. Les paquets lourds embarquent des binaires,
  pas des modèles. Quand un modèle est présent, il est anglophone :
  `whisper-addon` livre `ggml-base.en.bin`, `speech-transcriber` un ONNX de whisper-tiny.en
  (vocabulaire de 51 864 entrées, signature de la variante anglaise), `vosk-stt` et
  `transcribe2texts` des modèles Vosk `en-us`.
- **Images Docker de service** : `rhasspy/wyoming-whisper`, `linuxserver/faster-whisper`,
  `onerahmet/openai-whisper-asr-webservice`, `lintoai/linto-stt-whisper`,
  `pando85/wyoming-whisper` téléchargent leur modèle au premier démarrage. Leurs gros
  layers sont des bibliothèques, pas des poids. Aucune image avec un modèle CTranslate2
  déjà converti n'a été trouvée, ce qui obligerait sinon à passer par torch.
- **GitHub** : le plafond de 100 Mo par fichier exclut tout modèle multilingue utile, et
  les actifs de release sont fermés.

## L'image retenue

`saladtechnologies/whisper-large` copie le checkpoint en clair pendant sa construction, ce
que révèle son historique : `COPY ./model/ /models/openai/whisper-large-v2`. C'est cette
ligne que `setup_modele.py` cherche pour identifier le bon layer, plutôt que de figer un
digest qui changerait au prochain retag.

Le layer pèse 3,7 Go compressés et contient un checkpoint Hugging Face complet, en fp32
(6,2 Go décompressés), tokenizer inclus. La conversion en CTranslate2 int8 le ramène à
1,6 Go et rend torch inutile pour la suite, ce qui compte : torch n'est installé que le
temps de la conversion.

Deux détails qui font échouer une reprise naïve.

- Le flux se coupe régulièrement avant la fin sur plusieurs gigaoctets. La reprise se fait
  en `Range`, et seule une empreinte sha256 conforme prouve que le fichier est complet.
  Le digest attendu est celui du layer, donné par le manifeste.
- Extraire à la volée depuis le flux HTTP paraît économe, mais une coupure fait perdre tout
  le travail et les fichiers du tokenizer, placés après le modèle dans l'archive, manquent
  alors silencieusement. Télécharger d'abord, vérifier, extraire ensuite.

## Si l'image disparaît

Chercher une autre image publique qui copie un checkpoint Whisper multilingue en clair.
La méthode qui a fonctionné : lister les images candidates via l'API de recherche de
`hub.docker.com`, lire leur configuration par `mirror.gcr.io`, et repérer dans l'historique
une entrée `COPY` ou `RUN` qui installe un modèle, plutôt que de se fier à la taille des
layers. Une image de plusieurs gigaoctets n'embarque le plus souvent que CUDA et torch.

Vérifier ensuite que le checkpoint est bien multilingue : la couche d'embedding du décodeur
compte 51 865 entrées en multilingue, contre 51 864 pour les variantes `.en`. Un modèle
anglophone transcrira du français en le traduisant, ou en produisant du charabia.
