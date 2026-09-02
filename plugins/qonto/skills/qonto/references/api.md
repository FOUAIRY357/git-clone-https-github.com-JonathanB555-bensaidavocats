# API Business Qonto v2 — référence détaillée

Cette fiche résume ce que le plugin utilise. Source de vérité : https://docs.qonto.com
(API Business v2). Paramètres vérifiés sur le code du serveur MCP officiel de Qonto
(github.com/qonto/qonto-mcp-server) en septembre 2026.

## Authentification (voie REST)

- Base : `https://thirdparty.qonto.com/v2`
- En-tête : `Authorization: <organization_id>:<clé_secrète>` — concaténation simple
  avec deux-points, **sans** Base64, **sans** `Bearer`.
- Identifiants : Qonto (web) → Réglages → Intégrations (section `/settings/integrations`),
  rôle Titulaire ou Admin. L'« identifiant d'organisation » est un slug du type
  `bensaid-avocats-1234` ; la clé secrète se régénère au besoin (l'ancienne est
  aussitôt invalidée).
- Test : `GET /organization` → `200` = identifiants valides ; `401` = en-tête invalide.
- Le script `scripts/qonto-api.sh` construit l'en-tête depuis `QONTO_ORGANIZATION_ID`
  et `QONTO_API_KEY` sans jamais l'exposer (ni argv, ni journaux).

## Pagination

Paramètres `current_page` et `per_page` (max 100 ; certains endpoints acceptent
aussi `page`). Réponse :

```json
"meta": { "current_page": 1, "next_page": 2, "prev_page": null,
          "total_pages": 4, "total_count": 372, "per_page": 100 }
```

Boucler tant que `next_page` n'est pas `null`. Demander une page au-delà de
`total_pages` renvoie `422`, pas une liste vide.

## Endpoints

### GET /organization

Organisation et comptes. Champs utiles de `organization.bank_accounts[]` :
`id` (UUID — le `bank_account_id` des autres appels), `slug`, `name`, `iban`, `bic`,
`currency`, `balance`, `balance_cents`, `authorized_balance` (solde disponible),
`status`, `main` (compte principal).

### GET /transactions

`bank_account_id` (ou `iban`) **requis**.

| Paramètre | Valeurs |
|---|---|
| `status[]` | `pending`, `completed`, `declined` |
| `side` | `debit`, `credit` |
| `operation_type[]` | `transfer`, `card`, `direct_debit`, `income`, `qonto_fee`, `cheque`, `recall`… |
| `settled_at_from` / `settled_at_to` | ISO 8601, ex. `2026-08-01T00:00:00.000Z` |
| `emitted_at_from` / `emitted_at_to` | idem |
| `updated_at_from` / `updated_at_to` | idem |
| `sort_by` | `settled_at:desc` (aussi `updated_at`, `emitted_at` ; `:asc` / `:desc`) |
| `includes[]` | `vat_details`, `labels`, `attachments` |
| `current_page`, `per_page` | pagination (max 100) |

Champs principaux d'une transaction (non exhaustif) : `id` (UUID),
`transaction_id` (référence lisible), `amount` / `amount_cents`, `currency`,
`local_amount` / `local_currency`, `side`, `operation_type`, `status`,
`label` (contrepartie), `reference` (motif), `note`, `settled_at`, `emitted_at`,
`vat_amount`, `vat_rate`, `initiator_id` (membre à l'origine), `card_last_digits`,
`attachment_ids[]`, `label_ids[]`, `category`.

### GET /transactions/{id} · GET /transactions/{id}/attachments · GET /attachments/{id}

Détail d'une transaction (`includes[]` comme ci-dessus) ; justificatifs d'une
transaction (`page`, `per_page`) ; un justificatif expose nom de fichier, taille et
`url` de téléchargement **présignée à durée courte** — télécharger immédiatement.

### GET /statements · GET /statements/{id}/download

Relevés bancaires. Liste : `current_page`, `per_page`, `created_at_from`,
`created_at_to` (filtres par compte : voir docs). `download` fournit le PDF
(URL de téléchargement à durée courte).

### Facturation

- `GET /client_invoices` — `status` (notamment `draft`, `unpaid`, `paid`, `canceled`),
  `updated_at_from` / `updated_at_to`, pagination. Champs usuels : `number`, `status`,
  `issue_date`, `due_date`, `total_amount`, `paid_at`, `client`, `invoice_url`.
- `GET /supplier_invoices` — mêmes paramètres de liste (statuts propres aux factures
  fournisseurs : voir docs).
- `GET /credit_notes` — avoirs (mêmes paramètres de liste).
- `GET /clients` · `GET /clients/{id}` — clients de facturation.
- Des POST existent (création de clients, de factures…) : **écriture** — uniquement
  sur demande explicite puis confirmation, conformément aux règles du skill.

### Virements et bénéficiaires (consultation uniquement)

- `GET /beneficiaries` — `trusted`, `updated_at_from` / `updated_at_to`, `sort_by`,
  `page`, `per_page` ; `GET /beneficiaries/{id}`.
- `GET /external_transfers` — `scheduled_date_from` / `scheduled_date_to`,
  `updated_at_from` / `updated_at_to`, `beneficiary_ids[]`, `sort_by`, `page`,
  `per_page` ; `GET /external_transfers/{id}`.
- `GET /requests` — demandes en attente (`status`, `current_page`, `per_page`).
- **Politique du cabinet : ce plugin n'émet aucun virement.** L'initiation se fait
  dans l'application Qonto (authentification forte).

### GET /labels · GET /memberships

Étiquettes analytiques (résolution des `label_ids`) ; membres de l'organisation
(résolution de `initiator_id` → qui a réglé). Pagination `page`, `per_page`.

## Erreurs

| Code | Cause | Réaction |
|---|---|---|
| 401 | identifiants invalides | vérifier `QONTO_ORGANIZATION_ID` et `QONTO_API_KEY` |
| 403 | droit insuffisant (rôle Qonto) | le signaler, ne pas insister |
| 404 | identifiant inconnu | vérifier l'UUID |
| 422 | paramètre manquant ou invalide, page au-delà de la fin | corriger le paramètre |
| 429 | limite de débit | attendre 60 s, espacer les appels |

## Bac à sable

Qonto propose un environnement de test (voir docs.qonto.com). Le script suit
`QONTO_API_HOST` si la variable est définie ; défaut : `https://thirdparty.qonto.com`.
