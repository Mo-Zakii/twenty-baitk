# BAITK CRM — Upstream Twenty relationship

This fork is based on [twentyhq/twenty](https://github.com/twentyhq/twenty) `main` (v0.2.1).

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
