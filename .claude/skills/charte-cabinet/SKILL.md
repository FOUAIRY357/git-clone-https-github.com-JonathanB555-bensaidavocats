---
name: charte-cabinet
description: >
  Référence de style transverse du cabinet BENSAID AVOCATS : typographie, formules d'appel et de
  politesse, format de livraison, conventions cloud, règles anti-marqueurs IA. Source unique de
  vérité, à lire par les autres skills (redaction-mail, premier-contact, courrier, template-cabinet,
  lettre-mission, post-linkedin, rdv-cadrage, support-cadrage, page-expertise, fiche-sellsy) avant de produire un
  écrit, pour éviter toute dérive de style. Déclencher si on parle de « charte du cabinet »,
  « règles de style maison », « conventions de rédaction », ou "/charte-cabinet".
---

# Charte BENSAID AVOCATS - source unique de style

Les autres skills du cabinet doivent s'y conformer. **En cas de divergence entre un skill et la
présente charte, la charte prévaut.** Un skill ne redéclare pas ces règles, il y renvoie.

## 1. Typographie (tout écrit)
- **Accents obligatoires** (é, è, ê, à, â, î, ô, û, ç, œ). Jamais de version sans accents, même si
  un fichier source est sans accents.
- **Aucun tiret cadratin (—) ni demi-cadratin (–).** Tiret simple, virgule, deux-points,
  parenthèses. Dans le contenu web, ne jamais écrire « espace tiret espace » (conversion auto en
  tiret long).
- **Guillemets français « »** quand des guillemets sont nécessaires.
- **Aucun marqueur IA** : pas de couleur « signature » type Claude, pas d'emoji décoratif dans les
  écrits juridiques.
- **Aucune antithèse en miroir.** On n'écrit pas ce que la chose n'est pas pour dire ensuite ce
  qu'elle est. Sont bannies les tournures « Ce n'est pas X. C'est Y. », « Nous ne faisons jamais X.
  Nous faisons Y. », « Le point sensible n'est pas X, ce sont les Y », « non pas X mais Y »,
  « Y, et non X ». C'est le marqueur d'IA le plus reconnaissable de tous, et il sonne publicitaire
  sous la plume d'un avocat. On énonce directement ce qui est. Le contraste, quand il est utile,
  se porte par un fait, une date ou un chiffre, pas par une négation symétrique.
- **Aucune phrase-chapeau qui annonce la compréhension.** Bannies partout (mails, courriers, notes) :
  « Votre demande est claire », « Si je comprends bien », « Je comprends bien », « C'est bien noté »,
  « Nous avons bien compris votre demande ». On entre directement dans les faits : on reformule la
  situation dans nos mots. C'est la reprise concrète qui prouve qu'on a compris, pas une phrase qui
  l'annonce.

## 2. Formules
- **Appel** (mail et courrier) : « Cher Monsieur, » ou « Chère Madame, ». « Cher <Prénom>, » admis
  si la relation est établie. Jamais « Bonjour », jamais « Madame, Monsieur, ».
- **Remerciement d'ouverture** : un mail qui répond à un message reçu s'ouvre, après l'appel,
  sur une ligne de remerciement seule (« Je vous remercie pour ce message. », « Je vous remercie
  de votre message. »). Une ligne, pas deux, et rien d'autre dans le paragraphe.
- **Clôture mail** : « Salutations dévouées, ».
- **Clôture courrier / note formelle** : « Je vous prie d'agréer, <même civilité>, l'expression de
  mes salutations distinguées. »
- **Pas de signature nominale dans un mail** (la signature Outlook s'en charge). Le courrier et la
  note portent la signature (nom + qualité).
- Pas de formule commerciale (« n'hésitez pas », « au plaisir de », « je me permets de »). Seule
  tolérance : « Je reste à votre disposition. »

## 3. Style
- Langage d'avocat : phrases courtes, une idée par phrase, sujet-verbe-complément. On affirme, on
  ne délaye pas. Deux-points rares. Listes en tirets « - ».
- **Aucune injonction au destinataire.** Une demande se formule à l'interrogative
  (« Pourriez-vous nous l'indiquer ? »), jamais à l'impératif (« dites-le nous »,
  « envoyez-nous », « confirmez »). Vaut pour les clients, les prospects et les confrères.
- Prix en **HT** (la TVA est due en sus, selon le régime applicable au jour de la facturation).

## 4. Livraison (contexte cloud)
- On **prépare**, on n'envoie jamais : François ou Jonathan relit et diffuse lui-même
  (cf mémoire [[envoi-mails-clients]]).
- **Mail** : trois blocs copier-coller dans le chat (DESTINATAIRE, COPIE si besoin, OBJET, CORPS).
  Rien à télécharger. HTML (police Aptos) seulement sur demande.
- **Document** (.docx, .pptx, PDF) : livrer le fichier via l'app (il est envoyé à l'utilisateur),
  jamais via `open` (commande macOS indisponible en cloud).
- **Chemins** : relatifs au dépôt. Ranger les livrables dans `livrables/<nom-client>/`. Ne pas
  utiliser `~/Desktop/...` ni de chemin `~/.claude/...` en dur (spécifiques au Mac, absents en cloud).

## 5. Vérité juridique
- Vérifier toute référence (article, jurisprudence) via le MCP Bensaid (Legifrance / Judilibre)
  avant de la citer. Sinon, reformuler en langage courant ou signaler « à confirmer ».
- Charger le skill métier adapté (`paperasse_skill` : fiscaliste, notaire, comptable...) pour le fond.
- **Ne jamais s'engager sur le droit étranger.** Nos écrits, devis et missions portent sur le
  droit français. On ne promet ni consultation ni position « dans les deux pays » : on traite le
  volet français et on coordonne avec les conseils locaux. Proscrire toute formule qui étend
  implicitement le périmètre à une législation étrangère.
- Lister les points à faire valider par François avant diffusion.
