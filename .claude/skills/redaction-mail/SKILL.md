---
name: redaction-mail
description: >
  Skill unique de redaction des mails du cabinet BENSAID AVOCATS (client, prospect, confrere,
  administration), et reference de style mail pour les autres skills. Charte maison : ouverture
  « Cher Monsieur, », phrases courtes et precises d'avocat, deux-points rares, listes en tirets,
  titres de section en gras et numerotes si le mail est long, cloture « Salutations devouees, »
  sans signature nominale (la signature Outlook s'en charge), prix en HT. Livre a chaque fois,
  directement dans le chat, un bloc de code copiable par element (DESTINATAIRE, COPIE si besoin,
  OBJET, CORPS), sans rien a telecharger ; un .html en police Aptos avec titres en gras n'est
  fourni que sur demande. Verifie toute reference d'article via le MCP Legifrance avant de la
  citer, et pose des questions quand le fond n'est pas certain. Declencher des que l'utilisateur
  veut « repondre par mail », « preparer / rediger / reformater un mail », repondre a un compte
  rendu ou a un message, ou tape "/redaction-mail <destinataire ou sujet>".
---

# redaction-mail - le mail du cabinet BENSAID AVOCATS

Skill **unique** pour tout mail du cabinet, et **reference de style** citee par d'autres skills
(ex. [[post-linkedin]]). Objectif : produire un mail que Francois n'a plus qu'a coller dans
Outlook et envoyer. On prepare le texte, on ne l'envoie jamais soi-meme (cf [[envoi-mails-clients]]).

Ce skill vit dans le depot git (`.claude/skills/redaction-mail/`), donc disponible dans toutes
les sessions cloud qui clonent ce depot. C'est la source unique. On ne travaille plus en local.

## Format de sortie (a chaque fois, dans le chat)
Un **bloc de code par element**, pour un copier-coller en un clic. Toujours cet ordre :

**DESTINATAIRE** (bloc) → **COPIE** (bloc, uniquement s'il y a une copie) → **OBJET** (bloc) →
**CORPS** (bloc, de la salutation a « Salutations devouees, »).

Le corps est un **bloc de code** : rien a telecharger. Un bloc de code est du texte brut, donc
les titres n'y apparaissent pas en gras (inherent au copier-coller texte) ; le gras se remet dans
Outlook, ou via le `.html` ci-dessous. Ne jamais livrer uniquement en piece jointe. Apres les
blocs, on peut rappeler en clair les hypotheses retenues (civilite, montant, copie), mais rien de
tout cela n'entre dans les blocs.

Le `.html` (police **Aptos**, titres en gras) n'est genere et fourni **que si Francois demande**
un collage deja mis en forme.

## Regles de redaction (charte, non negociables)

### Salutation
- Par defaut « Cher Monsieur, » ou « Chere Madame, ». Jamais « Bonjour », jamais « Madame, Monsieur, ».
- Si le prenom est connu et la relation etablie, « Cher Antoine, » est admis.
- Virgule apres la salutation, pas de point. En cas de doute sur la civilite, poser la question.

### Cloture
- Une phrase de disponibilite (« Je reste a votre disposition pour toute question. »), puis
  **« Salutations devouees, »** et rien d'autre.
- **Aucune signature** : ni nom, ni fonction, ni coordonnees. La signature Outlook s'en charge.
  Le renderer ajoute ces deux lignes automatiquement.

### Style
- Langage d'avocat : precis, sobre, sans familiarite. On affirme, on ne delaye pas.
- Phrases courtes, une idee par phrase. Paragraphes courts et aeres.
- **Pas d'antithese en miroir** (« Ce n'est pas X. C'est Y. », « Nous ne faisons jamais X. Nous
  faisons Y. ») : on enonce directement ce qui est. Regle detaillee dans [[charte-cabinet]], le
  renderer avertit.
- Pas de formule commerciale (« n'hesitez pas a », « au plaisir de », « je me permets de »).
- **Deux-points rares** : preferer deux phrases. Le renderer avertit s'il y en a trop.
- **Listes en tirets « - »** (jamais de puce ronde) ; numerotation admise pour une sequence ordonnee.
- **Titres de section en gras**, courts, numerotes (1., 2., ...) si plusieurs sujets. Jamais en
  majuscules seules, jamais soulignes.
- **Honoraires en HT uniquement** (pas de TTC, sauf demande expresse de Francois).

### Typographie
- **Accents obligatoires** (é, è, ê, à, â, î, ô, û, ç, œ). Jamais de version sans accents
  (cf [[feedback-accents-requis]]).
- **Pas de tiret cadratin (—) ni demi-cadratin (–)** : tiret simple, virgule, parenthese, point.
  Le renderer refuse de generer si un cadratin subsiste (cf [[no-ai-style-markers]]).
- Guillemets francais « » si necessaire.

## Verifier les articles avant de les citer
Ne jamais citer un article de memoire. Avant d'ecrire « article 167 bis du CGI », le verifier via
le MCP `Bensaid_MCP` : `legifrance_get_article_by_num`, a defaut `legifrance_search`
(fond `CODE_DATE`), ou `judilibre_search` pour une decision. Si l'API renvoie une erreur (403 =
abonnement PISTE inactif) ou ne confirme pas le texte, retirer la citation et formuler en langage
courant, ou la signaler « a confirmer » et poser la question. Ne jamais publier une reference non
verifiee comme certaine. Pour le fond, charger le skill Paperasse adapte (`paperasse_skill`).

## Poser des questions quand le fond n'est pas certain
Des qu'une hesitation porte sur le fond (fait manquant, position juridique incertaine, montant,
civilite, presence d'une copie, ton attendu), utiliser `AskUserQuestion` plutot que deviner.
Regrouper les questions, proposer des options claires. On ne redige le mail definitif qu'une fois
le fond arrete.

## Methode
1. Rassembler la matiere : contexte, destinataire, copie eventuelle, objectif, elements de fond.
   Extraire les faits d'un compte rendu ou d'un fil de mail s'il est fourni.
2. Verifier les articles cites. Charger le skill metier si besoin.
3. Lever les hesitations de fond via `AskUserQuestion`.
4. Rediger le corps en vraies phrases, style avocat, dans un **spec JSON** (modele en tete de
   `render_mail.py`). Objet sans deux-points. Titres en gras seulement si le mail est long.
5. Lancer le renderer, depuis la racine du depot (chemin absolu du dossier du skill indique au
   chargement sous « Base directory for this skill ») :
   ```bash
   python3 .claude/skills/redaction-mail/render_mail.py /chemin/spec.json /chemin/mail.html
   ```
   Corriger si le script signale un cadratin (fatal) ou une densite de « : » excessive.
6. **Afficher les blocs copier-coller dans le chat** (DESTINATAIRE, COPIE si besoin, OBJET, CORPS).
   Ne fournir le `.html` que si Francois demande un collage deja mis en forme.
7. Facultatif : ranger le spec et le `.html` dans `livrables/<nom-client>/` du depot. Le livrable
   principal reste les blocs dans le chat.

## Blocs de corps disponibles
`{"titre": "..."}` titre de section en gras ; `{"p": "..."}` paragraphe ;
`{"b": "..."}` element de liste, rendu avec un tiret « - » (jamais de puce ronde) ;
`{"em": "..."}` incise en gris italique (usage rare, ex. mention « sous reserve »).

## Rappels
- On **prepare**, on n'envoie pas. Francois relit et envoie depuis Outlook.
- Le corps ne contient ni nom, ni fonction, ni coordonnees (signature Outlook).
- Confidentialite : ne rien affirmer sur le dossier qui n'ait ete valide par Francois.
- Version .docx sur gabarit a en-tete/pied : passer par [[template-cabinet]] une fois le texte
  valide. Ce skill produit le TEXTE du mail.
