# taxesalaire.com — refonte

Squelette du nouveau site **Taxe sur les Salaires & TVA** (cabinet BENSAID AVOCATS).
Stack : [Astro](https://astro.build) + React (scanners) + Tailwind CSS 4. Site 100 % statique,
déployable sur n'importe quel hébergeur (Vercel, Netlify, Cloudflare Pages, OVH…).

## Commandes

```bash
cd site
npm install
npm run dev       # serveur local http://localhost:4321
npm run build     # build de production dans dist/
npm run preview   # prévisualisation du build
```

## Architecture

| Rubrique | URL | Source |
|---|---|---|
| Accueil | `/` | `src/pages/index.astro` |
| Scan TVA | `/scan-tva/` | arbre : `src/data/scan/tva.ts` |
| Scan Taxe sur les salaires | `/scan-taxe-salaires/` | arbre : `src/data/scan/taxeSalaires.ts` |
| Secteurs (index) | `/secteurs/` | `src/pages/secteurs/index.astro` |
| Page sectorielle | `/<slug>/` | `src/content/secteurs/<slug>.mdx` |
| Doctrine transversale | `/doctrine/<slug>/` | `src/content/doctrine/<slug>.mdx` |
| Actualités | `/actualites/` et `/actualites/<slug>/` | `src/content/actualites/<slug>.mdx` |
| L'expert | `/expert/` | `src/pages/expert.astro` |

Les slugs des pages sectorielles reprennent les slugs historiques de taxesalaire.com
(ex. `holdings-tva`, `tva-immobiliere`) pour préserver le référencement lors de la bascule.

## Les scanners

Le moteur (`src/components/scan/ScanEngine.tsx`) est **entièrement piloté par la donnée** :
les questions, réponses, renvois doctrine et écrans de résultat vivent dans
`src/data/scan/*.ts`. Pour enrichir un arbre, on ajoute des nœuds dans ces fichiers —
aucune modification de code n'est nécessaire. Une vérification de cohérence
(`verifierArbre`) casse le build si un renvoi pointe vers un nœud inexistant.

Chaque question propose systématiquement :

- **« Je ne sais pas »** → renvoie vers la page doctrine correspondante (`/doctrine/…`) ;
- **« Consulter un expert »** → renvoie vers `/expert/`.

Les réponses restent dans le navigateur : rien n'est transmis ni stocké côté serveur.

## Contenus à valider par le cabinet (avant mise en ligne)

- [ ] **Arbres de décision** `src/data/scan/tva.ts` et `taxeSalaires.ts` : chaque nœud
      (questions, qualifications, conséquences, références) est une version de travail.
- [ ] **Pages sectorielles et doctrine** : squelettes en attente de la doctrine détaillée
      (migration depuis l'ancien site + apports du cabinet).
- [ ] **Page expert** (`/expert/`) : biographie, photographie, e-mail de contact affiché.
- [ ] **Mentions légales** : éditeur, directeur de la publication, hébergeur, RGPD.
- [ ] **Redirections 301** depuis les URLs de l'ancien site non reprises à l'identique
      (à établir une fois le site actuel intégralement crawlé).

## Feuille de route

1. ~~Squelette : design system, layout, 5 rubriques, moteur de scan~~ (fait)
2. Effet « waou » du Scan TVA : cartographie animée des opérations (les nœuds s'allument
   au fil des réponses), rapport de scan détaillé, export PDF.
3. Enrichissement des arbres (sous-arbres par nature d'opération, coefficients, prorata)
   avec validation du cabinet.
4. Migration de la doctrine sectorielle + redirections 301.
5. SEO/GEO : schema.org par gabarit, flux RSS, llms.txt, sitemap enrichi.
