# Plugin Qonto — BENSAID Avocats

Accès au compte bancaire professionnel Qonto du cabinet depuis Claude Code :
soldes, transactions, justificatifs manquants, relevés, factures clients et
fournisseurs. **Lecture seule par défaut** : toute écriture exige une demande
explicite puis une confirmation dans la conversation ; le plugin n'émet jamais
de virements.

## Installation

Depuis Claude Code :

```
/plugin marketplace add JonathanB555/bensaidavocats
/plugin install qonto@bensaid-avocats
```

Puis redémarrer Claude Code.

## Connexion au compte

### Option A — Serveur MCP officiel Qonto (recommandée)

Le plugin déclare le serveur MCP hébergé par Qonto (`https://mcp.qonto.com/mcp`).

1. Dans Claude Code : `/mcp` → `qonto` → **Authenticate**.
2. Le navigateur s'ouvre sur une page Qonto : se connecter avec son compte habituel.
3. C'est tout. L'accès reprend exactement les droits Qonto de la personne connectée
   (rôles Titulaire, Admin ou Comptable ; disponible sur tous les forfaits).

Aucune clé à manipuler : authentification OAuth personnelle, révocable à tout
moment depuis l'espace Qonto.

### Option B — Clé API (REST v2 : exports en masse, automatisation)

1. Dans Qonto (web) : **Réglages → Intégrations** (section `/settings/integrations`),
   rôle Titulaire ou Admin. Copier l'**identifiant d'organisation**
   (ex. `bensaid-avocats-1234`) et générer la **clé secrète**.
2. Déclarer les variables d'environnement, par exemple dans `~/.claude/settings.json` :

```json
{
  "env": {
    "QONTO_ORGANIZATION_ID": "bensaid-avocats-1234",
    "QONTO_API_KEY": "xxxxxxxxxxxxxxxx"
  }
}
```

   (ou dans le profil shell : `export QONTO_ORGANIZATION_ID=…` et `export QONTO_API_KEY=…`)

3. Test rapide — demander à Claude « solde Qonto », ou directement :

```bash
<chemin du plugin>/scripts/qonto-api.sh /organization
```

## Commandes

| Commande | Ce qu'elle fait |
|---|---|
| `/qonto:solde` | Soldes de tous les comptes + total de trésorerie |
| `/qonto:transactions [filtre]` | Transactions (défaut : 30 derniers jours) |
| `/qonto:justificatifs [période]` | Débits sans justificatif joint (défaut : 90 jours) |
| `/qonto:factures [clients\|fournisseurs]` | Factures impayées, retards, encours |

Le skill `qonto` se déclenche aussi en langage naturel : « qui nous a payé cette
semaine ? », « sors-moi les dépenses de carte d'août », « le relevé de juillet ».

## Sécurité — à lire

- La clé API donne accès au compte bancaire : la traiter comme un mot de passe.
  Jamais dans un fichier du dépôt, un mail ou un chat. En cas de doute, la
  régénérer dans Qonto (l'ancienne est aussitôt invalidée).
- Le script ne fait jamais apparaître la clé dans la ligne de commande ni dans
  les journaux : il la lit uniquement dans l'environnement.
- Le skill impose la lecture seule par défaut ; l'émission de virements est
  exclue du plugin (elle se fait dans l'application Qonto, avec authentification
  forte).
- Les exports (CSV, PDF de relevés) vont dans `livrables/`, jamais dans le dépôt.
- Limite de débit de l'API : en cas de `429`, attendre une minute.

## Référence

- Documentation officielle : https://docs.qonto.com (API Business v2 et serveur MCP).
- Détail des endpoints utilisés : [skills/qonto/references/api.md](skills/qonto/references/api.md).
