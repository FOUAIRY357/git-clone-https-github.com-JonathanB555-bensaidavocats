---
name: template-cabinet
description: >
  Coule une NOTE JURIDIQUE, une consultation, un compte rendu ou un rapport du cabinet BENSAID
  AVOCATS dans son gabarit officiel (confidentiel, objet, sommaire, parties numerotees, conclusion,
  mention finale, signature). Conserve l'en-tete a logo et le pied de page (coordonnees
  Paris/Geneve) et applique la charte-cabinet. A declencher des qu'on veut mettre un ecrit "au
  propre", "dans notre template", "faire une note juridique", produire un compte rendu / rapport
  presentable a un client. Gere aussi l'insertion de photos. Pour une LETTRE adressee a un
  destinataire, utiliser le skill courrier ; pour un mail, redaction-mail.
---

# template-cabinet - mettre un ecrit au format du cabinet

## Quand l'utiliser
Tout document destine a un client ou un confrere qui doit "faire avocat" : note juridique,
consultation, compte rendu de reunion ou de session, rapport. On part du **contenu** (que l'on
redige en vraies phrases d'avocat) et on le **coule** dans le gabarit officiel.

**Une LETTRE adressee a un destinataire ne passe pas par ici : utiliser le skill [[courrier]]**
(moteur de lettre unique du cabinet). Pour un e-mail, utiliser [[redaction-mail]].

Gabarit, dans `templates/` :
- `note_juridique.docx` - pour les notes, consultations, comptes rendus, rapports.

Il porte deja l'**en-tete a logo** et le **pied de page** (SELARL Paris / SA Geneve, adresses,
RCS...). Le script ne touche pas a l'en-tete ni au pied : il ne reconstruit que le corps.

## Charte (respectee par le script, ne pas y deroger)
Respecter la **[[charte-cabinet]]** (accents obligatoires, pas de tiret cadratin, pas de marqueur
IA, guillemets francais). Specificites du gabarit, deja portees par le modele :
- Police **Helvetica Neue** partout.
- Titres et intitules en **111111** (quasi-noir) ; accents/labels en **808088** (gris).
- **Aucune autre couleur** que ces deux tons.
- **Accents obligatoires** dans tout le contenu du spec JSON : ne jamais produire de version sans
  accents, meme si un fichier source est sans accents.

## Methode
1. Rediger le contenu en **vraies phrases**, ton avocat (sujet-verbe-complement, mais des phrases
   completes et liees, pas du telegraphique). Pour une note : une introduction qui pose le contexte,
   des parties numerotees, une conclusion avec recommandations.
2. Construire un **spec JSON** (voir le modele commente en tete de `render.py` et l'exemple
   `exemples/cr_session_comite.json`).
3. Lancer, depuis la racine du depot :
   ```bash
   python3 .claude/skills/template-cabinet/render.py /chemin/spec.json /chemin/sortie.docx
   ```
4. Livrer le `.docx` a l'utilisateur (il est envoye dans l'app) pour relecture. Pas de `open` (macOS,
   indisponible en cloud).

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
