#!/usr/bin/env bash
#
# qonto-api.sh — appel authentifié à l'API Business Qonto (v2).
#
# Usage :
#   qonto-api.sh <chemin[?query]> [options curl supplémentaires...]
#
# Exemples :
#   qonto-api.sh /organization
#   qonto-api.sh '/transactions?bank_account_id=<uuid>&per_page=100&current_page=1'
#   qonto-api.sh '/client_invoices?status=unpaid'
#   qonto-api.sh '/statements/<id>/download'
#
# Identifiants lus dans l'environnement (jamais passés en argument) :
#   QONTO_ORGANIZATION_ID  identifiant (slug) de l'organisation, ex. bensaid-avocats-1234
#   QONTO_API_KEY          clé secrète (Qonto > Réglages > Intégrations / section /settings/integrations)
#   QONTO_API_HOST         optionnel, défaut https://thirdparty.qonto.com
#
# Sortie : corps de la réponse sur stdout ; « HTTP <code> » sur stderr ;
# code retour 1 si le statut HTTP est >= 400.

set -euo pipefail

if [[ $# -lt 1 || "$1" == "-h" || "$1" == "--help" ]]; then
  sed -n '2,20p' "$0"
  exit 0
fi

: "${QONTO_ORGANIZATION_ID:?variable manquante — identifiant (slug) Qonto requis, ex. bensaid-avocats-1234}"
: "${QONTO_API_KEY:?variable manquante — clé API Qonto requise}"

host="${QONTO_API_HOST:-https://thirdparty.qonto.com}"

path="$1"; shift
path="/${path#/}"
path="${path#/v2}"
[[ "$path" == /* ]] || path="/$path"
url="${host}/v2${path}"

body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT

# La clé passe par un fichier de configuration curl lu sur stdin : elle
# n'apparaît ni dans la ligne de commande ni dans la liste des processus.
http_code="$(curl --silent --show-error --max-time 60 \
  --config - --output "$body_file" --write-out '%{http_code}' \
  "$@" "$url" <<EOF
header = "Authorization: ${QONTO_ORGANIZATION_ID}:${QONTO_API_KEY}"
header = "Accept: application/json"
EOF
)"

cat "$body_file"
echo >&2 "HTTP ${http_code}"
[[ "$http_code" -lt 400 ]]
