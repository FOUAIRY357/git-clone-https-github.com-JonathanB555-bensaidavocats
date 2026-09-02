---
description: Solde des comptes bancaires Qonto du cabinet, avec total de trésorerie
---

Affiche la trésorerie du cabinet sur Qonto.

Étapes :

1. Applique le skill `qonto` du plugin (voies d'accès et règles impératives).
   En bref : outils MCP `mcp__qonto__*` si connectés, sinon le script
   `scripts/qonto-api.sh` du plugin avec `GET /organization`.
2. Récupère l'organisation et tous les comptes (`bank_accounts`).
3. Présente un tableau : Compte | IBAN (masqué, 4 derniers chiffres) | Solde |
   Solde disponible. Montants au format français, compte principal en premier.
4. Termine par le **total de trésorerie** en gras, avec la date et l'heure de
   consultation.
5. Lecture seule : aucune écriture.

Si aucune voie d'accès n'est disponible, ne rien inventer : renvoyer vers le
README du plugin (`/mcp` → `qonto` → Authenticate, ou variables
`QONTO_ORGANIZATION_ID` / `QONTO_API_KEY`).
