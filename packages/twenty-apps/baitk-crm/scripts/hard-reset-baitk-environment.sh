#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BAITK_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Resetting database (Apple workspace only, no YC/Empty fixtures)..."
cd "${REPO_ROOT}"
npx nx database:reset twenty-server --configuration=no-seed
npx nx command-no-deps twenty-server -- workspace:seed:dev --light

echo "==> Applying BAITK hard reset (single user + BAITK AI CRM workspace)..."
node "${BAITK_DIR}/scripts/hard-reset-baitk-environment.mjs"

echo "==> Generating workspace API key..."
API_KEY="$(
  cd "${REPO_ROOT}/packages/twenty-server" &&
    node dist/command/command.js workspace:generate-api-key \
      -w 20202020-1c25-4d02-bf25-6aeccf7ea419 2>&1 |
    grep 'TOKEN:' |
    sed 's/.*TOKEN://'
)"

if [[ -z "${API_KEY}" ]]; then
  echo "Could not auto-generate API key. After restarting the server, run:"
  echo "  cd packages/twenty-server && node dist/command/command.js workspace:generate-api-key -w 20202020-1c25-4d02-bf25-6aeccf7ea419"
  echo "Then set TWENTY_API_KEY in packages/twenty-apps/baitk-crm/.env.local and run: yarn setup"
  exit 0
fi

ENV_LOCAL="${BAITK_DIR}/.env.local"
if [[ ! -f "${ENV_LOCAL}" ]]; then
  cp "${BAITK_DIR}/.env.example" "${ENV_LOCAL}"
fi

if grep -q '^TWENTY_API_KEY=' "${ENV_LOCAL}"; then
  sed -i.bak "s|^TWENTY_API_KEY=.*|TWENTY_API_KEY=${API_KEY}|" "${ENV_LOCAL}"
  rm -f "${ENV_LOCAL}.bak"
else
  echo "TWENTY_API_KEY=${API_KEY}" >> "${ENV_LOCAL}"
fi

echo "==> Installing BAITK CRM into BAITK AI CRM workspace..."
cd "${BAITK_DIR}"
yarn setup

echo ""
echo "Done."
echo "Login: mo.zakieg@gmail.com / BAITK@012"
echo "Workspace: BAITK AI CRM"
echo "Restart yarn start if it was running, then open if needed."
