// Marks BAITK CRM as pre-installed and backfills all workspaces.
//
// Usage:
//   yarn preinstall:mark

import { config } from 'dotenv';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { APPLICATION_ID } from 'src/constants/uuids';

const require = createRequire(import.meta.url);
const repoRoot = resolve(__dirname, '../../../../..');
const pg = require(resolve(repoRoot, 'node_modules/pg')) as typeof import('pg');

config({ path: resolve(repoRoot, 'packages/twenty-server/.env') });

const databaseUrl =
  process.env.PG_DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5432/default';

async function main(): Promise<void> {
  const client = new pg.Client({ connectionString: databaseUrl });

  await client.connect();

  const result = await client.query<{ id: string }>(
    `UPDATE core."applicationRegistration"
     SET "isPreInstalled" = true
     WHERE "universalIdentifier" = $1
     RETURNING id`,
    [APPLICATION_ID],
  );

  await client.end();

  if (result.rowCount === 0) {
    console.warn(
      `[preinstall:mark] no registration found for ${APPLICATION_ID} — publish the app first`,
    );
  } else {
    console.log(
      `[preinstall:mark] marked BAITK CRM as pre-installed (${result.rows[0]?.id})`,
    );
  }

  const serverRoot = resolve(repoRoot, 'packages/twenty-server');
  execSync('node dist/command/command.js install-pre-installed-apps', {
    cwd: serverRoot,
    stdio: 'inherit',
  });

  console.log('[preinstall:mark] done — new workspaces will auto-install BAITK CRM');
}

main().catch((error: unknown) => {
  console.error('[preinstall:mark] failed:', error);
  process.exit(1);
});
