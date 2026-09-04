# Portrait 2026 — François Ouairy

Portraits professionnels générés avec Nano Banana Pro (`gemini-3-pro-image`) via le MCP du cabinet.

## Cahier des charges

- Costume bleu nuit uni, chemise blanche, cravate jaune à motifs (celle des photos de référence).
- Fond de studio gris clair, uni.
- Cadrage serré au buste, épaules de trois quarts, mains hors champ.
- Visage barbu, barbe courte et nette.

## Photos de référence

1. Portrait studio publié sur le site du cabinet — identité, morphologie, qualité d'éclairage.
2. `reference/ouairy-reference-visage.jpg` — barbe et cravate jaune.

## Série retenue

| Fichier | Contenu |
| --- | --- |
| `portrait-v5.jpg` | **Portrait principal** : buste, trois quarts, regard objectif, fond uni. |
| `pose-bras-croises-fond.jpg` | Plan taille, bras croisés — page « L'équipe », présentations. |
| `pose-trois-quarts-inverse-fond.jpg` | Buste, épaules pivotées vers la droite — pour les mises en page où la photo est à gauche du texte. |
| `pose-regard-hors-champ.jpg` | Buste, regard porté hors champ — variante éditoriale, pages d'articles. |
| `francois-ouairy-site.jpg` | v5 en 900 px de large, format 4:5, pour le site. |
| `francois-ouairy-linkedin.jpg` | v5 recadrée en carré 800 × 800, pour LinkedIn. |
| `planche-poses.jpg` | Planche de contact des quatre poses. |
| `comparaison-visages.jpg` | Photo réelle / v3 / v4, visages à échelle égale. |

## Itérations

| Fichier | Contenu |
| --- | --- |
| `portrait-v1.jpg` | Deux vraies photos en référence. Pose correcte, peau lissée, visage aminci. |
| `portrait-v2.jpg` | Grain de peau corrigé, épaules revenues de face. |
| `portrait-v3.jpg` | Pose de la v1 sur le rendu de la v2 — mais générée à partir des seules images générées : la dérive du visage s'est accumulée. |
| `portrait-v4.jpg` | Retour aux deux vraies photos, consignes anti-embellissement explicites. Ressemblance nettement meilleure. Fond parasité par une arête de mur. |
| `portrait-v5.jpg` | v4 avec fond uni et cadrage resserré, visage inchangé. |
| `pose-bras-croises.jpg`, `pose-trois-quarts-inverse.jpg` | Versions avant reprise du fond. |

Enseignement : ne jamais enchaîner une génération sur une génération. Chaque passe doit
repartir des photos réelles, sans quoi le modèle amincit et rajeunit le visage un peu plus
à chaque tour.

## Rapatriement des fichiers

L'environnement Claude Code n'atteint pas le domaine d'hébergement temporaire des images
générées. Le workflow `.github/workflows/rapatrier-images.yml` lit le manifeste
`a-rapatrier.txt` (lignes « nom<TAB>url »), télécharge chaque image depuis un runner GitHub
et la committe sur la branche ciblée par le dispatch. Les URL Nano Banana expirent au bout
de sept jours.
