# Mise en ligne sur Cloudflare Pages

Tout est gratuit. Étape 1 = le site en ligne (5 minutes). Les étapes 2 et 3
peuvent attendre.

## Étape 1 — Mettre le site en ligne (préversion)

1. Créer un compte sur https://dash.cloudflare.com (gratuit).
2. Menu **Workers & Pages** → **Create** → onglet **Pages** →
   **Connect to Git** → autoriser GitHub → choisir le dépôt
   `FOUAIRY357/git-clone-https-github.com-JonathanB555-bensaidavocats`.
3. Renseigner les réglages de build :
   - **Production branch** : `claude/taxesalaire-redesign-wqwxfm`
   - **Root directory** : `site`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - Variable d'environnement : `NODE_VERSION` = `20`
4. **Save and Deploy**. Deux minutes plus tard, le site est en ligne sur une
   URL du type `https://taxesalaire.pages.dev` — testable sur téléphone et
   partageable au cabinet.

À partir de là, **chaque commit sur la branche déclenche un déploiement
automatique** : publier = committer.

## Étape 2 — Le domaine taxesalaire.com (le jour de la bascule)

Dans le projet Pages → **Custom domains** → ajouter `taxesalaire.com` et
suivre les instructions DNS. L'ancien site WordPress reste intact tant que le
DNS n'est pas modifié ; la bascule est réversible.

## Étape 3 — Activer l'admin de publication (/admin)

L'interface type WordPress (Decap CMS) est déjà installée sur
`/admin/`. Pour que le bouton « Login with GitHub » fonctionne, il faut un
petit relais OAuth (gratuit, une seule fois) :

1. Sur GitHub : **Settings → Developer settings → OAuth Apps → New OAuth
   App** — Homepage : `https://taxesalaire.pages.dev` ; Authorization
   callback URL : `https://VOTRE-WORKER.workers.dev/callback` (l'URL du
   worker créé au point 2). Noter le Client ID et le Client Secret.
2. Déployer un relais OAuth pour Decap sur Cloudflare Workers (gratuit) :
   par exemple le modèle open source `sterlingwes/decap-proxy` (bouton
   « Deploy to Cloudflare » du README) en renseignant le Client ID/Secret.
3. Dans `site/public/admin/config.yml`, décommenter `base_url:` et y mettre
   l'URL du worker, puis committer.

En attendant cette étape, deux façons simples de publier :
- demander la publication à Claude (rédaction + mise en ligne en une fois) ;
- éditer les fichiers `.mdx` directement sur github.com (bouton crayon),
  le déploiement suit automatiquement.

## Ce qui est déjà prêt côté dépôt

- `site/public/_headers` : cache long pour polices, images et assets.
- `site/public/admin/` : interface Decap CMS configurée sur les trois
  collections (actualités, secteurs/articles, doctrine).
- `robots.txt` + sitemap générés au build.
