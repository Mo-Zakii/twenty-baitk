# BAITK CRM

This Twenty workspace is customized for **BAITK CRM** — a real estate brokerage CRM built as a Twenty app (not a separate server).

The app lives at `packages/twenty-apps/baitk-crm/`. See its [README](packages/twenty-apps/baitk-crm/README.md).

## Start

```bash
bash packages/twenty-utils/setup-dev-env.sh
yarn start

cd packages/twenty-apps/baitk-crm
yarn install
cp .env.example .env.local   # dev seed key is pre-filled for localhost:3000
yarn setup
```

Open http://localhost:3001 — standard Twenty UI with a **BAITK CRM** folder (Leads, Dashboard, etc.).

Based on [Twenty](https://github.com/twentyhq/twenty) — NestJS, TypeORM, PostgreSQL, GraphQL, React.
