---
name: template-cabinet
description: >
  Coule n'importe quel ecrit du cabinet BENSAID AVOCATS dans son gabarit officiel :
  soit une NOTE JURIDIQUE (confidentiel, objet, sommaire, parties numerotees, conclusion,
  mention finale, signature), soit un COURRIER (date, destinataire, objet, corps, formule
  de politesse, signature, P.J.). Conserve l'en-tete a logo et le pied de page (coordonnees
  Paris/Geneve), applique la charte (Helvetica Neue, titres 111111, accents 808088, aucune
  autre couleur). A declencher des qu'on veut mettre un ecrit "au propre", "dans notre
  template", "faire une note juridique", "faire un courrier", ou produire un compte rendu /
  rapport presentable a un client. Gere aussi l'insertion de photos.
---

# template-cabinet - mettre un ecrit au format du cabinet

## Quand l'utiliser
Tout document destine a un client ou un confrere qui doit "faire avocat" : note juridique,
consultation, compte rendu de reunion ou de session, courrier. On part du **contenu** (que l'on
redige en vraies phrases d'avocat) et on le **coule** dans l'un des deux gabarits officiels.

Deux gabarits, dans `templates/` :
- `note_juridique.docx` - pour les notes, consultations, comptes rendus, rapports.
- `courrier.docx` - pour les lettres adressees a un destinataire.

Les deux portent deja l'**en-tete a logo** et le **pied de page** (SELARL Paris / SA Geneve,
adresses, RCS...). Le script ne touche ni a l'un ni a l'autre : il ne reconstruit que le corps.

## Charte (respectee par le script, ne pas y deroger)
- Police **Helvetica Neue** partout.
- Titres et intitules en **111111** (quasi-noir) ; accents/labels en **808088** (gris).
- **Aucune autre couleur** (pas de couleur "signature", cf memoire [[no-ai-style-markers]]).
- **Pas de tiret cadratin ni demi-cadratin** : tiret simple, virgule, deux-points, parentheses.

## Methode
1. Rediger le contenu en **vraies phrases**, ton avocat (sujet-verbe-complement, mais des phrases
   completes et liees, pas du telegraphique). Pour une note : une introduction qui pose le contexte,
   des parties numerotees, une conclusion avec recommandations.
2. Construire un **spec JSON** (voir le modele commente en tete de `render.py` et l'exemple
   `exemples/cr_session_comite.json`).
3. Lancer :
   ```bash
   python3 ~/.claude/skills/template-cabinet/render.py /chemin/spec.json /chemin/sortie.docx
   ```
4. Ouvrir le `.docx` pour relecture (`open`).

## Blocs de contenu disponibles
`{"p": "..."}` paragraphe justifie ; `{"sub": "..."}` sous-titre gras ; `{"b": "..."}` puce ;
`{"em": "..."}` note italique grise ; `{"img": ["a.jpg"], "w": 7.3}` image(s) (1 = centree,
plusieurs = grille 2 colonnes) ; `{"tbl": [[...]], "entete": true}` tableau.

Note : Word n'integre pas le HEIC. Convertir au prealable les photos en JPEG et **redresser
l'orientation EXIF** (sips + PIL `ImageOps.exif_transpose`), sinon elles ressortent pivotees.

## Rappels metier
- Ne jamais envoyer le document : on **prepare** seulement, François relit et diffuse lui-meme
  (cf memoire [[envoi-mails-clients]]).
- Confidentialite : la note porte la mention CONFIDENTIEL et une mention finale de reserve.
- Verifier les references (N/Ref. dossier), la date, le destinataire avant remise.
