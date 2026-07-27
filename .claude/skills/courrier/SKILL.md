---
name: courrier
description: >
  Rédige un courrier au nom de BENSAID AVOCATS et le coule dans le modèle officiel
  du cabinet (Modele_Courrier_BENSAID_AVOCATS), avec en-tête à logo et pied de page
  multi-sites (Paris, Genève, Marseille, Cannes, Lisbonne) déjà en place. Produit un
  .docx propre : date, destinataire, N/Réf., objet, corps rédigé en vraies phrases
  d'avocat, formule de politesse, signature et P.J. Déclencher dès qu'on veut « faire
  un courrier », « une lettre », « un courrier à un client / confrère / une
  administration », « mettre ce courrier au propre » ou « dans notre modèle de courrier ».
---

# courrier - lettre au format officiel BENSAID AVOCATS

## Quand l'utiliser
Toute lettre adressée à un destinataire nommé (client, confrère, administration,
partie adverse) qui doit sortir dans le modèle du cabinet. On part du **contenu**,
rédigé en vraies phrases d'avocat, et on le coule dans le gabarit
`assets/modele_courrier.docx`, qui porte déjà l'**en-tête à logo** et le **pied de
page** (SELARL Paris / SA Genève + Marseille, Cannes, Lisbonne, RCS, capital...).
Le script ne reconstruit que le corps : il ne touche ni à l'en-tête ni au pied de page.

Pour une note juridique, une consultation ou un compte rendu, utiliser plutôt
[[template-cabinet]]. Pour un e-mail, utiliser [[redaction-mail]].

## Charte du modèle (respectée par le script, ne pas y déroger)
- Police **Helvetica Neue**, couleur du texte **1E1E22** (déjà portées par le gabarit).
- **Date** alignée à droite ; **nom du destinataire** et **objet** en gras.
- **N/Réf.** et **P.J.** en 9 pt ; **signature** alignée à droite (nom puis qualité).
- **Aucune couleur signature** ni marqueur IA (cf mémoire [[no-ai-style-markers]]).
- **Aucun tiret cadratin ni demi-cadratin** : tiret simple, virgule, deux-points,
  parenthèses. Accents obligatoires. cf [[charte-cabinet]].

## Méthode
1. **Rédiger le contenu** en vraies phrases, ton avocat : phrases complètes et liées,
   pas de télégraphique. Une accroche qui rappelle le contexte, le développement, une
   phrase de disponibilité, puis la formule de politesse.
2. **Construire le spec JSON** (modèle commenté en tête de `render.py`, exemple dans
   `exemples/exemple.json`). Champs : `ville`, `date`, `destinataire` (liste de lignes,
   1re ligne en gras), `ref` (optionnel), `objet`, `salutation`, `corps` (liste de
   blocs), `politesse`, `signataire`, `qualite` (optionnel), `pj` (optionnel).
3. **Lancer** :
   ```bash
   python3 .claude/skills/courrier/render.py /chemin/spec.json /chemin/sortie.docx
   ```
4. **Livrer** le `.docx` à l'utilisateur (il est envoyé dans l'app) pour relecture. Pas de `open` (macOS, indisponible en cloud).

## Blocs de corps disponibles
Dans `corps` (liste), chaque élément est :
- une **chaîne** ou `{"p": "..."}` : paragraphe justifié ;
- `{"sub": "..."}` : sous-titre en gras ;
- `{"b": "..."}` : puce ;
- `{"em": "..."}` : note en italique gris (808088).

## Rappels métier
- **Ne jamais envoyer** le courrier : on **prépare** seulement, François relit et
  diffuse lui-même (cf mémoire [[envoi-mails-clients]]).
- Vérifier avant remise : la **date**, le **destinataire**, la **N/Réf. dossier**,
  l'**objet** et la **formule de politesse** (accord avec la salutation).
- Par défaut `ville` = Paris et `signataire` = François OUAIRY, qualité « Avocat
  associé », sauf indication contraire.
