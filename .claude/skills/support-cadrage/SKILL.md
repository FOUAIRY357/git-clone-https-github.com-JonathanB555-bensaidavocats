---
name: support-cadrage
description: >
  Produit le support de présentation (deck PowerPoint 16:9) d'un rendez-vous de cadrage
  stratégique du cabinet BENSAID AVOCATS, dans la charte maison : Arial, accent or B08A46,
  intercalaires sombres, KPI, colonnes pour/contre, tableaux comparatifs, clôture. Format
  type ~17 à 20 slides, structure « Le dossier → La stratégie → Notre mission ».
  Déclencher quand l'utilisateur veut « le support », « la présentation » ou « le deck »
  d'un RDV de cadrage, ou tape "/support-cadrage <nom du client>". S'utilise en aval du
  skill [[rdv-cadrage]] ; le fond juridique s'appuie sur les skills métier (fiscaliste, notaire…).
---

# Support de cadrage stratégique - deck client BENSAID AVOCATS

Objectif : générer un PowerPoint présentable au client pour le RDV de cadrage, dans la charte
du cabinet, en s'appuyant sur le moteur de rendu fourni en asset. On adapte le **contenu**, pas
le style.

## Outil de rendu
`assets/deck_template.py` : générateur python-pptx contenant la charte et tous les archétypes.
On ne réécrit pas le style : on copie ce fichier, on remplace la section `CONTENU`, on exécute.

Workflow :
1. Copier l'asset vers un script de travail (ex. `/tmp/deck_<client>.py`).
2. En tête, ajuster `RUNNING` (kicker, ex. "EXPATRIATION & EXIT TAX · 2026") et `FOOTER`
   (ex. "ANTOINE COMAR · RÉUNION DE CADRAGE").
3. Remplacer le bloc `CONTENU` par les appels d'archétypes du dossier (voir ci-dessous),
   et fixer `T` = nombre total de slides (sert à la pagination « NN / T »).
4. Exécuter : `python3 /tmp/deck_<client>.py "livrables/<Nom>/Support cadrage - <Client> (<date>).pptx"`.
5. Livrer le fichier à l'utilisateur (il est envoyé dans l'app) pour contrôle visuel, puis le
   ranger dans `livrables/<Nom>/`. Pas de `open` (macOS, indisponible en cloud).

## Charte (rappel, déjà codée dans l'asset)
- 16:9 (13,33 x 7,5"), police **Arial**.
- Accent **or B08A46** ; encre **111111** ; gris **6E6E6E / 9A9A9A** ; gris clair **D6D6D6**.
- **Vert 2E7D32** (favorable) / **rouge C0392B** (risque).
- Slides sombres (fond **000000**) pour couverture, intercalaires, KPI, accompagnement, clôture ;
  slides claires (fond blanc) pour le contenu.
- Bandeau : kicker or en haut à droite, pied gris en bas à gauche, pagination « NN / T » en bas à droite.
- Pas de tiret cadratin / demi-cadratin ni de couleur signature Claude. cf [[no-ai-style-markers]].

## Archétypes disponibles (fonctions de l'asset)
- `cover(n,T,title,subtitle,baseline)` - couverture.
- `divider(n,T,num,title,subtitle)` - intercalaire à grand numéro or.
- `kpi(n,T,kicker,title,[(grand,libellé) x4])` - 4 chiffres clés.
- `twocol(n,T,kicker,title, lh,lc,lb, rh,rc,rb)` - deux colonnes pour/contre (lc/rc = GREEN/RED).
- `content(n,T,kicker,title,intro,[paragraphes], title_size=28)` - contenu générique.
- `table(n,T,kicker,title,[entêtes],[lignes],note)` - tableau comparatif.
- `threecol(n,T,kicker,title,intro,[(num,titre,corps) x3])` - accompagnement (sombre).
- `numbered(n,T,kicker,title,[(num,titre,corps) x4],note)` - prochaines actions.
- `closing(n,T,kicker,title,date,signature,locations,disclaimer)` - clôture.

## Structure type (~17 à 20 slides)
1. Couverture (sujet + sous-titre + client / date du RDV).
2. Intercalaire 01 - LE DOSSIER.
3. KPI - les chiffres clés de la situation.
4. Pour/contre - l'enjeu central (le bon vs le mauvais scénario).
5. Intercalaire 02 - LA STRATÉGIE.
6 à 12. Le fond : règle applicable, mécanisme, comparatif (tableau), options, calendrier,
   points de vigilance. Adapter au dossier ; appuyer le fond sur le skill métier.
13. Intercalaire 03 - NOTRE MISSION.
14. Accompagnement (3 colonnes : concevoir / sécuriser / mettre en œuvre).
15. Proposition (cadrage 2 400 € HT puis forfait). cf [[rdv-cadrage]].
16. Et maintenant - premières actions + pièces utiles.
17. Clôture (date du RDV, visio ou cabinet, signature Me Ouairy, mention confidentielle).

## Règles
- **Toujours** une dernière slide « Document de travail confidentiel - références à confirmer ».
- Tarif et logistique cohérents avec [[rdv-cadrage]] (2 400 € HT ; cabinet 49 rue de Courcelles,
  code 2079 ; visio Google Meet).
- Longueur cible ~17 à 20 slides : dense mais lisible, une idée par slide.
- Le deck est un document de travail interne au dossier : le ranger dans le dossier perso du client,
  pas dans l'espace de dépôt partagé.
