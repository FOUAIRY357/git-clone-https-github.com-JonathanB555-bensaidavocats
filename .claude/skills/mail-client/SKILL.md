---
name: mail-client
description: >
  Redige un mail professionnel du cabinet BENSAID AVOCATS a un client, un prospect ou un
  confrere, dans le style maison : ouverture « Cher Monsieur, », phrases courtes et precises
  d'avocat, deux-points limites, titres en gras si le mail est long, cloture systematique sur
  « salutations devouees » sans signature nominale (la signature Outlook s'en charge). Livre
  trois modules copier-coller (adresse, objet, corps) plus un .html qui conserve le gras au
  collage dans Outlook. Verifie toute reference d'article via le MCP Legifrance avant de la
  citer, et pose des questions quand le fond n'est pas certain. Declencher quand l'utilisateur
  veut « repondre par mail », « preparer / rediger un mail » a un client, repondre a un compte
  rendu ou a un message client, ou tape "/mail-client <destinataire ou sujet>".
---

# Mail client - style BENSAID AVOCATS

Objectif : produire un mail que Francois n'a plus qu'a coller dans Outlook et envoyer. On
prepare le texte, on ne l'envoie jamais soi-meme (cf memoire [[envoi-mails-clients]]).

## Regles d'or (non negociables)
- **Ouverture** : « Cher Monsieur, » par defaut. Adapter (« Chere Madame, », « Cher Confrere, »,
  « Messieurs, ») selon le destinataire. En cas de doute sur la civilite, poser la question
  (voir plus bas). La formule de politesse reprend la meme civilite.
- **Cloture** : une phrase de disponibilite (« Je reste a votre disposition pour toute
  question. »), puis la signature courte **« Salutations devouees. »** et rien d'autre.
  **Ne jamais signer du nom de Francois** ni ajouter de bloc coordonnees. Sa signature Outlook
  s'en charge. Le renderer ajoute ces deux lignes automatiquement.
- **Style avocat** : phrases courtes, une idee par phrase, sujet-verbe-complement. On affirme,
  on ne delaye pas. Pas de formules molles (« je me permets de », « n'hesitez pas »).
- **Deux-points rares.** On limite fortement les « : ». Preferer deux phrases. Un « : » ne se
  justifie guere que pour introduire une liste a puces. Le renderer avertit s'il y en a trop.
- **Pas de tiret cadratin (—) ni demi-cadratin (–).** Tiret simple, virgule, parenthese, point.
  Le renderer refuse de generer si un cadratin subsiste (cf memoire [[no-ai-style-markers]]).
- **Structure** : mail court, on ecrit d'un trait. Mail long (plusieurs sujets), on structure
  avec des **titres en gras** courts, sans numerotation, un titre par sujet.
- **Chiffres et honoraires** : toujours en HT et TTC quand on donne un prix. Etre precis.

## Verifier les articles avant de les citer
Ne jamais citer un article de memoire. Avant d'ecrire « article 167 bis du CGI », le verifier
via le MCP `Bensaid_MCP` :
- `legifrance_get_article_by_num` (ex. code « Code general des impots », article « 167 bis ») ;
- a defaut `legifrance_search` (fond `CODE_DATE`), ou `judilibre_search` pour une decision.

Si l'API renvoie une erreur (403 = abonnement PISTE inactif, cf README du repo) ou ne confirme
pas le texte, **deux options** : retirer la citation et formuler en langage courant, ou la
signaler comme « a confirmer » et poser la question a Francois. Ne jamais publier une reference
non verifiee comme si elle etait certaine.

Pour le fond fiscal, comptable ou notarial, charger le skill Paperasse adapte
(`paperasse_skill` : fiscaliste, comptable, notaire, controleur-fiscal...) avant de rediger,
plutot que de repondre de memoire.

## Poser des questions quand le fond n'est pas certain
Des qu'une hesitation porte sur le fond (un fait manquant, une position juridique incertaine,
le montant d'honoraires, la civilite du destinataire, le ton attendu), utiliser le module de
questions (outil `AskUserQuestion`) plutot que de deviner. Regrouper les questions, proposer des
options claires. On ne redige le mail definitif qu'une fois le fond arrete.

## Methode
1. Rassembler la matiere : contexte, destinataire, objectif du mail, elements de fond. Si un
   compte rendu ou un fil de mail est fourni, en extraire les faits.
2. Verifier les articles cites (section ci-dessus). Charger le skill metier si besoin.
3. Lever les hesitations de fond via `AskUserQuestion`.
4. Rediger le corps en vraies phrases, style avocat, dans un **spec JSON** (modele en tete de
   `render_mail.py`). Objet sans deux-points. Titres en gras seulement si le mail est long.
5. Lancer le renderer :
   ```bash
   python3 ~/.claude/skills/mail-client/render_mail.py /chemin/spec.json /chemin/mail.html
   ```
   Corriger si le script signale un cadratin (fatal) ou une densite de « : » excessive.
6. **Afficher les trois modules directement dans le chat**, chacun dans son propre bloc de code
   copier-coller (ADRESSE, OBJET, CORPS) tel que le script les imprime. C'est le livrable par
   defaut : Francois copie depuis le chat. Le `.html` genere est un **complement facultatif**,
   utile seulement s'il veut conserver le gras des titres au collage dans Outlook (`open mail.html`).
   Ne pas livrer le mail uniquement en piece jointe.
7. Ranger le spec et le .html dans le dossier du client
   (`~/Desktop/Dossiers prospects/<Nom>/`), nom de fichier `Mail - <objet court> (<date>).html`.

## Blocs de corps disponibles
`{"titre": "..."}` titre de section en gras ; `{"p": "..."}` paragraphe ;
`{"b": "..."}` puce (les puces consecutives forment une liste) ;
`{"em": "..."}` incise en gris italique (usage rare, ex. mention « sous reserve »).

## Rappels
- On **prepare**, on n'envoie pas. Francois relit et envoie depuis Outlook.
- Le corps ne contient ni nom, ni fonction, ni coordonnees en pied (signature Outlook).
- Confidentialite : ne rien affirmer sur le dossier qui n'ait ete valide par Francois.
