# piste-mcp

Serveur **MCP** (Model Context Protocol) pour interroger les APIs juridiques françaises via la plateforme **PISTE** :

- **Légifrance** — codes, lois, décrets, JORF, jurisprudence administrative et constitutionnelle
- **Judilibre** — décisions de la **Cour de cassation** et du **Conseil d'État** (et CA / TJ)

Une fois enregistré dans Claude Code, vous pouvez demander à Claude « lis l'article 1240 du Code civil » ou « cherche les arrêts de la 1re chambre civile sur la responsabilité du fait des produits défectueux depuis 2020 » et il appellera directement les APIs.

---

## 1. Installation

```bash
cd "/Users/bensaidavocats/Desktop/CLAUDE CODE/.claude/worktrees/happy-gauss-c30ded"
npm install
npm run typecheck
```

## 2. Configuration

Les identifiants PISTE sont déjà dans `.env` (fichier **gitignoré**, ne pas commit).

Variables :

| Variable | Rôle |
|---|---|
| `PISTE_ENV` | `production` (par défaut) ou `sandbox` |
| `PISTE_CLIENT_ID` | Client ID OAuth2 |
| `PISTE_CLIENT_SECRET` | Client Secret OAuth2 |
| `PISTE_API_KEY` | API Key (non utilisée par défaut, OAuth2 suffit) |
| `PISTE_API_SECRET` | API Secret (non utilisée par défaut) |
| `XAI_API_KEY` | Clé API xAI, requise par l'outil `grok_search` |
| `XAI_MODEL` | Modèle Grok (défaut `grok-4-latest`) — ex: `grok-4`, `grok-4-fast`, `grok-4.5` |

⚠️ **Pré-requis côté PISTE** : votre application doit être abonnée aux APIs **DILA — Légifrance** et **Cour de cassation — Judilibre** sur https://piste.gouv.fr (Mes applications → Souscriptions). Sans abonnement actif, l'OAuth marche mais les appels renvoient `403`.

## 3. Enregistrer dans Claude Code

Depuis n'importe quel répertoire :

```bash
claude mcp add piste \
  --command "npx" \
  --args "tsx" \
  --args "/Users/bensaidavocats/Desktop/CLAUDE CODE/.claude/worktrees/happy-gauss-c30ded/src/index.ts" \
  --scope user
```

Puis redémarrez Claude Code. Vérifiez avec `/mcp` que `piste` apparaît avec un statut **connected**.

## 4. Outils exposés

| Outil | Usage |
|---|---|
| `legifrance_search` | Recherche plein texte sur Légifrance (fonds CODE, LODA, JURI, JORF, CETAT, CONSTIT…) |
| `legifrance_get_article` | Texte intégral d'un article par identifiant `LEGIARTI…` |
| `legifrance_get_article_by_num` | Article d'un code par numéro (ex: Code civil art. 1240) |
| `legifrance_list_codes` | Liste des codes en vigueur avec leurs `LEGITEXT…` |
| `judilibre_search` | Recherche dans la jurisprudence Cassation / Conseil d'État |
| `judilibre_get_decision` | Texte intégral d'une décision par son `id` Judilibre |
| `judilibre_get_decision_files` | Liste les fichiers attachés à une décision (PDFs), avec leur `rawUrl` S3 |
| `judilibre_download_pdf` | Télécharge un PDF attaché (résout le `rawUrl` S3, renvoie du base64) |
| `grok_search` | Recherche temps réel via Grok (web / X / actualité) — xAI Responses API |

## 5. Test rapide en CLI

```bash
# OAuth + un appel de test
npm start
# le serveur attend sur stdio — utilisez Claude Code pour l'appeler
```

Pour tester l'authentification seule sans MCP :

```bash
node --import tsx -e "import('./src/auth.ts').then(m => m.getAccessToken()).then(t => console.log('OK token len=', t.length))"
```

## 6. Sécurité

- `.env` est gitignoré, **ne jamais committer**
- Les secrets partagés en chat doivent être considérés comme compromis : régénérez-les sur PISTE puis remplacez les valeurs dans `.env`
- Les tokens OAuth sont mis en cache en mémoire (durée de vie ~1h), pas écrits sur disque

## 7. Dépannage

- `401 invalid_client` → vérifier `PISTE_CLIENT_ID` / `PISTE_CLIENT_SECRET`
- `403 Forbidden` sur un appel API → l'application n'est pas souscrite à cette API sur PISTE
- `Unknown scope` → certaines APIs PISTE exigent un scope spécifique (`openid` par défaut convient pour Légifrance et Judilibre)
