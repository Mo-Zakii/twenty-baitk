# BAITK CRM — Client trial checklist

Use this guide to prepare a clean workspace for a client demo or pilot.

## Prerequisites

- Twenty server, worker, and frontend running (`yarn start` locally, or your hosted stack)
- Workspace admin API key with metadata permissions
- BAITK CRM app published to that Twenty instance

## One-time setup (operator)

```bash
# 1. Dev services (local only)
bash packages/twenty-utils/setup-dev-env.sh
yarn start

# 2. Install and configure BAITK CRM
cd packages/twenty-apps/baitk-crm
cp .env.example .env.local
# Set TWENTY_API_KEY and BAITK_WORKSPACE_ID in .env.local
yarn setup
```

`yarn setup` does all of the following automatically:

1. Publishes BAITK CRM v0.2.0
2. Installs the app into the workspace
3. Removes default Twenty CRM objects (People, Companies, etc.)
4. Cleans orphaned workflow/demo commands
5. Activates BAITK objects
6. Configures row-level security (Sales / Manager / Team Leader)
7. Syncs lead scope fields from teams

## Client login smoke test

After setup, verify in the browser:

| Check | Expected |
|-------|----------|
| Sidebar | **BAITK CRM** folder with Dashboard, Leads, Distribution, Integrations, Reports, Custom Reports, Teams, Users |
| Leads page | Loads without “Sorry, something went wrong” |
| Lead record | Info + Comments tabs work |
| + New record | Creates a lead |
| Distribution | Settings page opens |
| Reports | Built-in metrics + custom reports list |

## Roles to assign

| Role | Who | Access |
|------|-----|--------|
| Owner | Agency principal | Full access |
| Operations | Ops manager | Users, distribution, all leads |
| Marketing | Marketing lead | Reports, add leads, no distribution |
| Manager | Sales manager | Team-scoped leads |
| Team Leader | Team lead | Team-scoped leads |
| Sales | Agent | Own assigned leads only |

Assign roles in **Settings → Roles**, then add users via **BAITK CRM → Users**.

## Google Sheets (optional)

1. Create Google OAuth credentials (Sheets + Drive read-only)
2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in **Settings → Applications → BAITK CRM → Variables**
3. Client connects Google in **BAITK CRM → Integrations**

See [INTEGRATION.md](./INTEGRATION.md) for full mapping and webhook details.

## Webhook for lead intake

```http
POST {TWENTY_API_URL}/s/baitk/leads/webhook
Content-Type: application/json

{
  "name": "Client Name",
  "phone": "+201000000001",
  "email": "client@example.com",
  "source": "Facebook",
  "budget": "3M EGP",
  "compound": "New Cairo"
}
```

## Re-configure after upgrade

```bash
cd packages/twenty-apps/baitk-crm
yarn twenty app:publish --private
yarn twenty app:install
yarn workspace:configure
yarn rls:configure
yarn scopes:sync
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “Sorry, something went wrong” on every page | Run `yarn workspace:cleanup` then hard refresh (`Cmd+Shift+R`) |
| Default People/Companies still visible | Run `yarn workspace:configure` |
| Sales users see all leads | Run `yarn rls:configure` |
| Team scope not applied on leads | Run `yarn scopes:sync` |
| Google Sheets connect fails | Check app Variables + OAuth redirect URIs |

## Production notes

- Set `BAITK_WORKSPACE_ID` explicitly for each deployment (do not rely on dev defaults)
- Use a workspace admin API key for `yarn setup` / `yarn workspace:configure`
- Post-install now runs **synchronously** on app install (removes default CRM before users see the UI)
- Object removal uses the **metadata API** first; CLI/database fallbacks are dev-only helpers
