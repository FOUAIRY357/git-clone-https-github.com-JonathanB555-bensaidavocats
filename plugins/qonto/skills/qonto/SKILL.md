---
name: qonto
description: >
  Accès au compte bancaire professionnel Qonto du cabinet BENSAID AVOCATS :
  soldes des comptes, transactions, justificatifs manquants, relevés bancaires,
  factures clients et fournisseurs, avoirs, bénéficiaires, virements (consultation).
  Déclencher pour toute question de banque, de trésorerie ou de rapprochement
  comptable : « solde du compte », « transactions du mois », « qui nous a payé »,
  « dépenses sans justificatif », « factures impayées », « relevé bancaire »,
  « Qonto », ou les commandes /qonto:solde, /qonto:transactions,
  /qonto:justificatifs, /qonto:factures. Lecture seule par défaut : toute
  écriture (virement, facture) exige une demande explicite puis une confirmation.
---

# Qonto — banque du cabinet

Ce skill donne accès au compte Qonto du cabinet. Deux voies, à tester dans cet ordre.

## 1. Choisir la voie d'accès

1. **Serveur MCP officiel Qonto** (recommandé) : des outils `mcp__qonto__*` sont
   présents dans la session. Les utiliser en priorité — authentification OAuth
   personnelle, droits identiques à ceux de l'utilisateur dans Qonto.
   Si les appels échouent en « unauthorized » : demander à l'utilisateur de lancer
   `/mcp`, choisir `qonto`, puis **Authenticate** (connexion Qonto dans le navigateur).
2. **API REST v2 directe** (secours, exports en masse, automatisation) : si les
   variables d'environnement `QONTO_ORGANIZATION_ID` et `QONTO_API_KEY` sont définies,
   utiliser le script du plugin. Ce fichier SKILL.md est dans `<plugin>/skills/qonto/` ;
   le script est donc à `../../scripts/qonto-api.sh` par rapport à lui.
3. **Aucune des deux** : ne rien inventer. Renvoyer l'utilisateur au README du plugin
   (installation et connexion en une minute, deux options).

## 2. Règles impératives

- **Lecture seule par défaut.** Aucun POST/PUT/PATCH/DELETE (REST) ni outil MCP
  d'écriture (virement, création ou finalisation de facture, bénéficiaire, carte…)
  sans demande explicite de l'utilisateur dans la conversation. Avant d'exécuter une
  écriture demandée : récapituler l'opération (nature, montant, contrepartie, date)
  et attendre un accord clair.
- **Jamais de virement.** Ce plugin n'initie pas de virements, même sur demande :
  l'émission se fait dans l'application Qonto (authentification forte). Consultation
  des virements émis et des bénéficiaires uniquement.
- **Secret.** Ne jamais afficher, logguer, committer ni recopier `QONTO_API_KEY`
  (ni un en-tête `Authorization`). Le script la lit seul depuis l'environnement.
- **Confidentialité bancaire.** Les données Qonto ne sortent pas : aucun envoi vers
  un service web externe, aucun commit de données bancaires dans le dépôt. Les
  exports (CSV, PDF) vont dans `livrables/` ou le dossier indiqué par l'utilisateur.
- **Présentation.** Montants au format français (`12 345,67 €`), dates `JJ/MM/AAAA`,
  IBAN masqués (`FR76 … 1234`) sauf demande contraire, débits en négatif.
- En cas de doute sur le compte ou la période, poser la question plutôt que supposer.

## 3. Voie MCP officielle (OAuth)

Serveur hébergé par Qonto, déclaré par le plugin (`.mcp.json`) :
`https://mcp.qonto.com/mcp`. Domaines couverts : organisation et comptes,
transactions et relevés, factures clients et fournisseurs, devis, avoirs, clients,
cartes, liens de paiement. Les noms et paramètres exacts des outils sont fournis
par le serveur dans la session : les découvrir et les utiliser tels quels, en
respectant les règles du § 2. Disponible pour les rôles Titulaire, Admin et
Comptable, sur tous les forfaits Qonto.

## 4. Voie REST v2 (clé API)

Base `https://thirdparty.qonto.com/v2` — en-tête `Authorization: <organization_id>:<clé>`
(concaténation simple, sans Base64). Le script s'occupe de tout :

```bash
# Organisation + tous les comptes (soldes)
<plugin>/scripts/qonto-api.sh /organization

# Transactions d'un compte (le bank_account_id vient de /organization)
<plugin>/scripts/qonto-api.sh '/transactions?bank_account_id=<uuid>&per_page=100&sort_by=settled_at:desc'

# Détail d'une transaction avec TVA, labels et justificatifs
<plugin>/scripts/qonto-api.sh '/transactions/<id>?includes[]=vat_details&includes[]=labels&includes[]=attachments'
```

### Endpoints principaux

| Endpoint | Usage |
|---|---|
| `GET /organization` | Organisation et comptes (`bank_accounts[]` : `id`, `iban`, `balance`, `authorized_balance`, `main`) |
| `GET /transactions` | Transactions d'un compte (`bank_account_id` ou `iban` **requis**) |
| `GET /transactions/{id}` | Détail (`includes[]` : `vat_details`, `labels`, `attachments`) |
| `GET /transactions/{id}/attachments` | Justificatifs d'une transaction |
| `GET /attachments/{id}` | URL de téléchargement présignée (expire vite) |
| `GET /statements` · `GET /statements/{id}/download` | Relevés bancaires, PDF |
| `GET /client_invoices` | Factures clients (`status` : `unpaid`, `paid`…) |
| `GET /supplier_invoices` · `GET /credit_notes` | Factures fournisseurs, avoirs |
| `GET /clients` | Clients de facturation |
| `GET /beneficiaries` · `GET /external_transfers` | Bénéficiaires, virements émis (consultation) |
| `GET /requests` | Demandes en attente (virements à valider…) |
| `GET /labels` · `GET /memberships` | Étiquettes analytiques, membres |

### Pagination, filtres, erreurs

- `current_page` et `per_page` (max 100) ; la réponse contient
  `meta: { current_page, next_page, prev_page, total_pages, total_count, per_page }`.
  Boucler tant que `meta.next_page` n'est pas `null`. Une page au-delà de la
  dernière renvoie `422`, pas une liste vide.
- Filtres transactions courants : `status[]` (`pending`, `completed`, `declined`),
  `side` (`debit`/`credit`), `settled_at_from`/`settled_at_to`,
  `emitted_at_from`/`emitted_at_to`, `updated_at_from`/`updated_at_to` (ISO 8601),
  `operation_type[]`, `sort_by` (ex. `settled_at:desc`).
- Erreurs : `401` identifiants invalides (vérifier les deux variables) ; `422`
  paramètre manquant ou invalide (souvent `bank_account_id` absent) ; `429` limite
  de débit — attendre 60 s et espacer les appels.

Référence détaillée (paramètres et champs de réponse) : [references/api.md](references/api.md).
Source de vérité : https://docs.qonto.com.

## 5. Recettes courantes

- **Solde du cabinet** — `/organization` ; présenter chaque compte (nom, IBAN masqué,
  solde, solde disponible), le compte principal en premier, puis le **total** en gras.
- **Transactions d'une période** — `bank_account_id` via `/organization` (compte
  `main: true` par défaut), puis `/transactions` avec `settled_at_from/to` ; tableau
  Date / Libellé / Type / Montant signé / Justificatif (✓/✗), puis totaux crédits,
  débits, net.
- **Dépenses sans justificatif** — transactions `side=debit` de la période dont
  `attachment_ids` est vide (filtre côté client : fiable partout). Écarter les frais
  Qonto (`operation_type=qonto_fee`), qui n'appellent pas de pièce.
- **Factures clients impayées** — `/client_invoices?status=unpaid`, trier par
  échéance, signaler les retards (échéance < aujourd'hui).
- **Relevé mensuel** — `/statements` (filtrer sur la période), puis
  `/statements/{id}/download` ; télécharger immédiatement (URL à durée courte)
  vers `livrables/`.
- **Export CSV** — écrire dans `livrables/` ; colonnes : date de règlement, libellé,
  référence, montant signé, TVA, catégorie, justificatif oui/non.
