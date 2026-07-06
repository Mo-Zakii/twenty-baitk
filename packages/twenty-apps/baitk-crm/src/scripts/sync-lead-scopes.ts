// Backfills teamLeaderScope / teamManagerScope on all leads that have a team.
//
// Usage:
//   yarn scopes:sync

import { config } from 'dotenv';

config({ path: process.env.ENV_FILE ?? '.env.local' });

import { CoreApiClient } from 'twenty-client-sdk/core';
import { syncAllLeadScopes } from 'src/utils/sync-lead-scope.util';

async function main() {
  const client = new CoreApiClient();
  console.log('[scopes:sync] syncing lead scope fields from team assignments...');
  const result = await syncAllLeadScopes(client);
  console.log(
    `[scopes:sync] Done — updated ${result.syncedLeadCount} lead(s).`,
  );
}

main().catch((error: unknown) => {
  console.error('[scopes:sync] Failed:', error);
  process.exit(1);
});
