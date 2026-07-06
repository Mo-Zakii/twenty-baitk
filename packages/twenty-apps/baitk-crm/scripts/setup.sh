#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
  echo "Created .env.local — add TWENTY_API_KEY, then re-run yarn setup"
  exit 1
fi

set -a
source .env.local
set +a

if [[ -z "${TWENTY_API_KEY:-}" ]]; then
  echo "TWENTY_API_KEY is empty in .env.local"
  echo "Generate one with:"
  echo "  cd packages/twenty-server && node dist/command/command.js workspace:generate-api-key -w 20202020-1c25-4d02-bf25-6aeccf7ea419"
  exit 1
fi

API_URL="${TWENTY_API_URL:-http://localhost:3000}"

echo "Configuring Twenty CLI remote at ${API_URL}..."
yarn twenty remote:add --url "${API_URL}" --as baitk-dev --api-key "${TWENTY_API_KEY}"

echo "Publishing BAITK app..."
yarn twenty app:publish --private

echo "Installing BAITK app into workspace..."
yarn twenty app:install

echo "Enabling auto-install on new workspaces..."
yarn preinstall:mark

echo "Removing default CRM objects (permanent delete)..."
yarn workspace:configure

echo "Configuring BAITK row-level security..."
yarn rls:configure

echo "Syncing lead scope fields from teams..."
yarn scopes:sync

echo "Done. Refresh http://localhost:3001 — you should see BAITK CRM with Leads."
