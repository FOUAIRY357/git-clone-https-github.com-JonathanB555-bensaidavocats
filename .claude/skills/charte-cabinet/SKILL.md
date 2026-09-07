---
name: charte-cabinet
description: >
  Référence de style transverse du cabinet BENSAID AVOCATS, valable pour TOUT écrit quel qu'en soit
  le canal ou le gabarit d'origine : mail, courrier, note, consultation, compte rendu, deck, copy du
  site. Typographie, formules d'appel et de politesse, format de livraison, conventions cloud,
  règles anti-marqueurs IA (tiret cadratin, antithèse en miroir, phrase-chapeau). Source unique de
  vérité : elle prévaut sur tout autre skill, du dépôt comme du MCP Bensaid (bensaid-voice inclus).
  À lire par les autres skills (redaction-mail, premier-contact, courrier, template-cabinet,
  lettre-mission, post-linkedin, rdv-cadrage, support-cadrage, page-expertise, fiche-sellsy) avant
  de produire un écrit. Porte aussi `charte_check.py`, le contrôle automatique appelé par les
  renderers et utilisable sur un document déjà produit. Déclencher si on parle de « charte du
  cabinet », « règles de style maison », « conventions de rédaction », d'un écrit à mettre en
  conformité, ou "/charte-cabinet".
---

# Charte BENSAID AVOCATS - source unique de style

## 0. Périmètre et hiérarchie
- **Elle s'applique à tout écrit du cabinet**, quel que soit le canal (mail, courrier, note,
  consultation, compte rendu, rapport, deck, copy du site, post) et **quel que soit le gabarit
  d'origine**, y compris un modèle venu de l'extérieur (modèle client, précédent d'un confrère).
  Un format importé fixe la structure du document, jamais notre style.
- Les règles ci-dessous **ne sont pas propres au mail**. `redaction-mail` ne gouverne que le
  *format* du mail (blocs DESTINATAIRE / OBJET / CORPS, clôture « Salutations dévouées, ») ; la
  typographie et le style de la présente charte valent pour tous les écrits, consultations
  comprises.
- **La charte prévaut sur tout autre skill**, du dépôt comme du MCP Bensaid. Un skill ne redéclare
  pas ces règles, il y renvoie.
- **Divergence tranchée avec `bensaid-voice` (MCP).** Ce skill prescrit le tiret cadratin pour les
  apartés et le point médian « · » pour les énumérations courtes. Ces deux règles décrivent la
  typographie éditoriale des sites `.fr` et `.ch`, et elles s'arrêtent là. **Aucun écrit du cabinet
  ne les suit** : mail, courrier, note, consultation, compte rendu, lettre de mission, deck, post
  LinkedIn appliquent la présente charte, qui traite le cadratin comme un marqueur d'IA. Sur la
  copy des sites, ne pas introduire de nouveau cadratin ; les gabarits déjà publiés qui en portent
  restent en place jusqu'à arbitrage de François.
- Avant de livrer, passer le contrôle automatique (§ 6). Il refuse la génération sur un cadratin.

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
- **Marqueur de liste** : on ne tape jamais de caractère de puce dans le contenu. Le tiret simple
  « - » est le marqueur du mail et de tout texte brut. Dans un `.docx`, le marqueur est posé par le
  renderer sur le gabarit ; le contenu du spec n'en porte aucun. Jamais de demi-cadratin « – » ni
  de puce ronde saisie à la main.
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

## 6. Contrôle automatique (`charte_check.py`)
Le contrôle des règles ci-dessus est outillé, dans ce même dossier, et il vaut pour tous les
écrits, pas seulement pour les mails.

- **Les renderers du cabinet l'appellent avant de générer** : `redaction-mail/render_mail.py`,
  `template-cabinet/render.py` (notes, consultations, comptes rendus) et `courrier/render.py`.
  Un tiret cadratin ou un demi-cadratin **bloque la génération**. Les antithèses en miroir, les
  phrases-chapeau, les puces rondes, une densité de deux-points excessive et les phrases de plus
  de 240 caractères sortent en avertissement.
- **Un avertissement se lit, il ne s'applique pas seul.** Le motif « négation puis *mais* » attrape
  aussi une concessive légitime (« nous ne conseillons pas sur le droit américain, mais l'échéance
  doit être tenue »). Son message le signale. La règle bannit la négation qui sert à définir par
  substitution, pas la concession.
- **Sur un document déjà produit**, y compris hors de nos renderers (modèle client, fichier reçu),
  lancer le contrôle depuis la racine du dépôt :
  ```bash
  python3 .claude/skills/charte-cabinet/charte_check.py <fichier>
  ```
  Le fichier peut être un `.docx`, un spec `.json` de renderer, ou un `.txt` / `.md`. Ajouter
  `--web` pour du contenu destiné au site (contrôle du « espace tiret espace »). Le script rend
  la liste des manquements et sort en code 1 s'il reste un cadratin. Aucune dépendance : il lit
  le `.docx` seul, et n'examine que le corps rédigé (ni en-tête, ni pied de page du gabarit).
- **Mettre un écrit en conformité** : lancer le contrôle, corriger, relancer jusqu'à
  « est conforme ». Le fond n'est pas touché, seuls la ponctuation, les puces et les tournures.
