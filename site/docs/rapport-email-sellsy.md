# Rapport de scan par e-mail et intégration Sellsy

État au 1er septembre 2026. Ce document décrit ce qui est en production et ce
qui reste à brancher pour la chaîne complète « scan → contact → Sellsy →
lettre du cabinet ».

## Déjà en production

- Bloc « Recevoir ce rapport » dans le rapport de scan (RapportScan.tsx) :
  e-mail + consentement obligatoire + case optionnelle « lettre du cabinet ».
- Fonction `functions/api/rapport.js` : anti-spam (pot de miel, délai minimal),
  validation, envoi de la synthèse du rapport (opérations, coefficients,
  montants) dans Slack via `SLACK_WEBHOOK_URL`.
- Envoi de la copie e-mail au prospect : le code est prêt, il s'active dès que
  la variable `BREVO_API_KEY` existe dans le projet Pages (voir ci-dessous).
  Sans elle, le cabinet reçoit la demande dans Slack et répond lui-même : la
  chaîne fonctionne en mode manuel.

## Étape 1 : e-mail automatique au prospect (Brevo)

1. Créer un compte Brevo (offre gratuite : 300 e-mails par jour), authentifier
   le domaine `taxesalaire.com` (2 enregistrements DNS fournis par Brevo, à
   poser dans Cloudflare : DKIM + code Brevo).
2. Créer une clé API (SMTP & API → clés API).
3. Dans Cloudflare Pages → taxesalaire → Settings → Variables and Secrets :
   ajouter `BREVO_API_KEY` (secret) et, si l'adresse d'expédition diffère,
   `EMAIL_EXPEDITEUR` (texte, ex. `contact@taxesalaire.com`).
4. Redéployer. La fonction envoie alors automatiquement la synthèse au
   prospect (expéditeur par défaut : contact@taxesalaire.com).

Améliorations prévues côté gabarit : rendu HTML complet du rapport (tableau
des opérations, jauges), lien de re-scan, signature du cabinet.

## Étape 2 : création du contact dans Sellsy

Chaque demande devient un prospect Sellsy avec le rapport en note.

- API Sellsy v2, OAuth 2 client credentials : créer les identifiants dans
  Sellsy (Paramètres → API), stocker `SELLSY_CLIENT_ID` et
  `SELLSY_CLIENT_SECRET` dans le projet Pages.
- Flux dans `functions/api/rapport.js` (à ajouter) :
  1. `POST https://login.sellsy.com/oauth2/access-tokens` (client credentials) ;
  2. `POST /v2/contacts` avec e-mail (dédoublonner via
     `GET /v2/contacts?email=` avant création) ;
  3. `POST /v2/comments` (ou champ note) avec la synthèse du rapport ;
  4. taguer la source `taxesalaire.com` pour le suivi.
- Cas d'erreur : ne jamais bloquer la réponse au visiteur ; consigner l'échec
  dans le message Slack (« Sellsy KO »).

## Étape 3 : lettre du cabinet (newsletter)

- La case « lettre du cabinet » est déjà collectée (`lettre=oui`).
- À brancher : liste Brevo dédiée + double opt-in (modèle Brevo), mention de
  désinscription dans chaque envoi.
- RGPD : consentements distincts déjà séparés dans le formulaire (recontact
  d'une part, lettre d'autre part) ; registre des consentements tenu par
  Brevo ; durée de conservation à fixer avec le cabinet (recommandation :
  3 ans après le dernier contact).

## Variables d'environnement récapitulées

| Variable | Rôle | Statut |
| --- | --- | --- |
| `SLACK_WEBHOOK_URL` | Leads et rapports vers Slack | à poser (guide donné) |
| `BREVO_API_KEY` | E-mail transactionnel au prospect | étape 1 |
| `EMAIL_EXPEDITEUR` | Adresse d'expédition | étape 1 (optionnel) |
| `SELLSY_CLIENT_ID` / `SELLSY_CLIENT_SECRET` | Création des contacts | étape 2 |
