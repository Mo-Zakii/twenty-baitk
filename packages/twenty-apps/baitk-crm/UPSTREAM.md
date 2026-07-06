# BAITK CRM — Upstream Twenty relationship

This fork tracks [twentyhq/twenty](https://github.com/twentyhq/twenty) `main`.

## Version numbers (important)

Twenty uses **two** version schemes:

| What you see | Meaning |
|--------------|---------|
| `twenty/v2.18.0` (GitHub release tag) | Product release version |
| `package.json` → `"version": "0.2.1"` | Monorepo workspace semver (not the product version) |
| `twenty-sdk` / `twenty-client-sdk` → `2.18.x` | **App SDK** — must match the platform release |

**BAITK CRM app** (`baitk-crm`) must pin `twenty-sdk` and `twenty-client-sdk` to the same minor as the platform (currently **2.18.0** on npm). Using `2.10.x` against a `2.18` server causes install/publish/API failures.

Fork base: `main` at July 2026 (~145 commits ahead of the `twenty/v2.18.0` tag).

## Intentional changes vs upstream

### BAITK CRM app (isolated)
- `packages/twenty-apps/baitk-crm/` — entire Twenty app (v0.2.0)

### Server (2 files)
- `packages/twenty-server/src/database/commands/baitk-remove-non-baitk-objects.command.ts` — new
- `packages/twenty-server/src/database/commands/database-command.module.ts` — registers BAITK command

### Frontend crash fixes (6 files)
Guard against deleted Person / Workflow objects when BAITK removes default CRM:

- `useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation.ts`
- `usePersonAvatarUpload.ts`
- `useWorkflowsWithCurrentVersions.ts`
- `useResolveDefaultEmailRecipient.ts`
- `TriggerWorkflowVersionEngineCommand.tsx`
- `ComposeEmailCommand.tsx`

### Branding
- `packages/twenty-front/index.html`, `public/manifest.json`
- `public/images/branding/baitk-crm-*`
- `src/constants/baitk-crm-branding.constants.ts`
- `src/modules/auth/components/BaitkCrmWordmark.tsx`
- `src/utils/title-utils.ts` and related auth UI

## Sync with upstream

```bash
git fetch upstream main
git diff upstream/main -- packages/twenty-apps/baitk-crm
git diff upstream/main -- packages/twenty-server/src/database/commands/baitk-remove-non-baitk-objects.command.ts
```

## Deploy

See [CLIENT_TRIAL.md](./CLIENT_TRIAL.md) and [README.md](./README.md).
