// Idempotent. Run after `yarn twenty app:publish --private`.
// Permanently deletes default Twenty CRM and demo objects from the workspace.
//
// Usage:
//   yarn workspace:configure

import { config } from 'dotenv';

config({ path: process.env.ENV_FILE ?? '.env.local' });

import { configureBaitkWorkspace } from 'src/utils/configure-baitk-workspace.util';

async function main(): Promise<void> {
  const apiUrl = process.env.TWENTY_API_URL?.replace(/\/$/, '') ?? 'unknown';

  console.log(
    `[workspace:configure] configuring BAITK workspace via metadata API (${apiUrl})`,
  );

  await configureBaitkWorkspace();

  console.log(
    '[workspace:configure] done — refresh the app; only BAITK CRM objects should remain',
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
