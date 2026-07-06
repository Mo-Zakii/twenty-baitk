# BAITK CRM — start here

This is the **canonical** BAITK fork of Twenty. Use this folder, not `twenty-main`.

- **GitHub:** https://github.com/Mo-Zakii/twenty-baitk
- **Workspace:** BAITK AI CRM (`baitk-ai-crm.localhost:3001`)
- **Login:** `mo.zakieg@gmail.com` / `BAITK@012`

## First-time setup

```bash
bash packages/twenty-utils/setup-dev-env.sh
yarn start
```

In another terminal:

```bash
cd packages/twenty-apps/baitk-crm
yarn setup
```

## What's included

- Google Sheets integration (`INTEGRATION.md`)
- Auto lead distribution (round-robin)
- Roles (owner, manager, sales, marketing, operations, team-leader)
- Custom Reports, Teams, Users panels

## Docs

- `packages/twenty-apps/baitk-crm/CLIENT_TRIAL.md` — demo checklist
- `packages/twenty-apps/baitk-crm/INTEGRATION.md` — Google Sheets setup
- `packages/twenty-apps/baitk-crm/UPSTREAM.md` — version / fork notes
