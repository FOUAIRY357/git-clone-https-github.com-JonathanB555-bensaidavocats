# Portrait 2026 — François Ouairy

Portrait professionnel généré avec Nano Banana Pro (`gemini-3-pro-image`) via le MCP du cabinet.

## Cahier des charges

- Costume bleu nuit uni, chemise blanche, cravate jaune à motifs (celle des photos de référence).
- Fond de studio gris clair, uni.
- Cadrage serré au buste, épaules de trois quarts, mains hors champ.
- Visage barbu, barbe courte et nette.

## Photos de référence

1. Portrait studio publié sur le site du cabinet — identité, morphologie, qualité d'éclairage.
2. `reference/ouairy-reference-visage.jpg` — barbe et cravate jaune.

## Versions

| Fichier | Contenu |
| --- | --- |
| `portrait-v1.jpg` | Première génération : pose de trois quarts correcte, peau un peu lissée. |
| `portrait-v2.jpg` | Grain de peau et morphologie du visage corrigés, mais épaules revenues de face. |
| `portrait-v3.jpg` | **Version retenue** : pose de trois quarts de la v1 + rendu de la v2. |
| `francois-ouairy-site.jpg` | v3 en 900 px de large, format 4:5, pour le site. |
| `francois-ouairy-linkedin.jpg` | v3 recadrée en carré 800 × 800, pour LinkedIn. |

## Rapatriement des fichiers

L'environnement Claude Code n'atteint pas le domaine d'hébergement temporaire des images
générées. Le workflow `.github/workflows/rapatrier-images.yml` lit le manifeste
`a-rapatrier.txt` (lignes « nom<TAB>url »), télécharge chaque image depuis un runner GitHub
et la committe sur la branche ciblée par le dispatch. Les URL Nano Banana expirent au bout
de sept jours.
