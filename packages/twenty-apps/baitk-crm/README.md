# BAITK CRM on Twenty

Real estate brokerage CRM built as a **[Twenty](https://github.com/twentyhq/twenty) app** — same stack (NestJS, TypeORM, PostgreSQL, GraphQL, React, Nx).

## Quick start

```bash
# 1. Dev environment (Postgres, Redis, .env)
bash packages/twenty-utils/setup-dev-env.sh

# 2. Start Twenty (frontend + backend + worker)
yarn start

# 3. Install BAITK app into your workspace
cd packages/twenty-apps/baitk-crm
yarn install
cp .env.example .env.local   # dev seed key is pre-filled for localhost:3000
yarn setup                   # publish app + hide default CRM + configure RLS
```

Then open http://localhost:3001, sign in, and use the **BAITK CRM** folder in the sidebar.

**Client trial / demo:** see [CLIENT_TRIAL.md](./CLIENT_TRIAL.md) for the full smoke-test checklist.

## What's included

| Feature | Implementation |
|---------|----------------|
| **6 roles** (Owner → Sales) | `src/roles/*.role.ts` |
| **Lead pipeline** (7 stages) | `src/objects/lead.object.ts` + Kanban view |
| **Unassigned leads view** | `src/views/unassigned-leads.view.ts` |
| **Round-robin distribution** | `distributionQueueEntry` + logic functions |
| **Google Sheets webhook** | POST `/baitk/leads/webhook` |
| **CSV import/export** | Twenty built-in (Leads object) |
| **Stage change activity log** | `leadActivity` + DB trigger |
| **Notifications** | `baitkNotification` + dashboard panel |
| **Dashboard** | Charts + notifications widget |
| **Reports** | Standalone page + front component |
| **Distribution settings** | Page layout + front component |
| **Lead record page** | Info / Comments / Activity tabs |
| **Team org chart data** | `baitkTeam` with manager + leader |
| **Scoped access (RLS)** | `yarn rls:configure` post-install script |
| **Standard Twenty UI** | No custom theme — uses default Twenty styling |

## Webhook (Google Sheets)

See **[INTEGRATION.md](./INTEGRATION.md)** for the full step-by-step guide (mapping, Google Sheets script, Zapier, troubleshooting).

```
POST http://localhost:3000/baitk/leads/webhook
Content-Type: application/json

{
  "name": "Mohamed Ali",
  "phone": "+201000000001",
  "email": "mohamed@example.com",
  "source": "Facebook",
  "budget": "3M EGP",
  "compound": "New Cairo"
}
```

Leads are deduplicated by phone, auto-assigned via round-robin, or flagged unassigned if the queue is empty.

## Roles (assign in Settings → Roles)

| Role | Access |
|------|--------|
| Owner | Full access |
| Operations | All leads, users, distribution, delete |
| Marketing | All reports, add leads, CSV, stage-only edits |
| Manager | Team-scoped via `teamManagerScope` RLS |
| Team Leader | Team-scoped via `teamLeaderScope` RLS |
| Sales | Own assigned leads via `assignee` RLS |

After publishing the app, run `yarn rls:configure` to apply Sales / Manager / Team Leader predicates.

## Teams & scope fields

1. Create **Teams** with Manager and Team Leader members assigned
2. Assign a **Team** on each lead (or set during import)
3. The `sync-lead-scope` logic function copies team manager/leader onto the lead for RLS

## Auto-distribute

Use the **Distribution** sidebar page, or:

```bash
POST /baitk/distribution/auto-distribute
```

## Development

```bash
cd packages/twenty-apps/baitk-crm
yarn twenty app:dev
yarn lint
yarn test
yarn rls:configure
```

## Architecture

This extends Twenty via objects, logic functions, front components, page layouts, and roles — not a separate CRM server.

See [Twenty app docs](https://docs.twenty.com/developers/extend/apps/getting-started).
