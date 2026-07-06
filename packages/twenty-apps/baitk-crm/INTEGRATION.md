# BAITK CRM — Lead Integration Guide

## Recommended: Connect Google Sheet (Phase 2)

Clients connect Google once, pick their spreadsheet in BAITK, map columns, and leads sync automatically every minute. **No Apps Script.**

```text
Meta Lead Ads  →  Google Sheet
                        ↓
              BAITK polls sheet (every 1 min)
                        ↓
              Leads in BAITK CRM
```

### Operator setup (once per SaaS deployment)

1. Create a **Google Cloud OAuth** app (Web application).
2. Enable **Google Sheets API** and **Google Drive API**.
3. In Twenty: **Settings → Applications → BAITK CRM → Variables**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Add the OAuth redirect URL shown in **BAITK CRM → Connections** to Google Cloud.

Republish after code changes:

```bash
cd packages/twenty-apps/baitk-crm
yarn twenty app:publish --private && yarn twenty app:install
```

### Client setup (per workspace)

1. **Settings → Applications → BAITK CRM → Connections → Add connection** (Google, workspace shared).
2. **BAITK → Integrations → Add integration**
   - Type: **Meta / Facebook Leads** (pre-filled columns) or **Google Sheets**
   - Map **Name** and **Phone** (required)
3. **Connect Google Sheet** section:
   - **Load my spreadsheets** → pick spreadsheet → pick tab
   - **Preview columns** (optional)
   - **Save changes**
   - **Import all rows now** (first time)
4. New Meta leads appear within ~1 minute automatically.

| Action | When |
|--------|------|
| **Import all rows now** | First time — imports every existing row |
| **Sync new rows** | Manual catch-up |
| Automatic cron | Every minute for active integrations with sheet + tab |

---

## Meta Lead Ads column preset

| Col | Header | BAITK field |
|-----|--------|-------------|
| L | platform | Source |
| M | company question | Compound |
| **N** | **full_name** | **Name** |
| **O** | **phone** | **Phone** |
| P | job_title | Extra → Job Title |

Use **Meta / Facebook Leads** type or click **Use Meta Lead Ads columns**.

---

## Legacy: Apps Script (fallback)

If Google OAuth is not configured, you can still use the Apps Script under **Advanced / developer options** in Integrations. Run **`setupBaitkIntegration`** once in the sheet.

---

## Webhook / Zapier

POST to `/s/baitk/leads/webhook`:

```json
{
  "integrationId": "YOUR_INTEGRATION_ID",
  "secret": "YOUR_SECRET",
  "fields": {
    "full_name": "Ahmed Hassan",
    "phone_number": "+201234567890"
  }
}
```

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| `Google is not connected` | Add Google connection in BAITK app settings |
| `Failed to read Google Sheet` | Re-connect Google; check sheet access |
| Duplicate phone | Lead already imported — safe to ignore |
| Phone `p:+2010…` | Stripped automatically by BAITK |
| No new leads | Confirm Meta adds rows; check **Last sync** on integration |

---

## Publish app updates

```bash
cd packages/twenty-apps/baitk-crm
yarn twenty app:publish --private
yarn twenty app:install
```

Hard-refresh the browser after installing.
