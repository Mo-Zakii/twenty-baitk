// Keeps round-robin queue in sync: only Sales role members receive leads.
//
// Usage:
//   yarn queue:sync

import { config } from 'dotenv';

config({ path: process.env.ENV_FILE ?? '.env.local' });

import { syncDistributionQueueForSalesMembers } from 'src/utils/distribution-queue-sync.util';

async function main() {
  console.log(
    '[queue:sync] syncing distribution queue — Sales role members only...',
  );
  const result = await syncDistributionQueueForSalesMembers();
  console.log(
    `[queue:sync] Done — removed ${result.removedCount}, added ${result.addedCount}, ${result.salesMemberCount} salesperson(s) in queue.`,
  );
}

main().catch((error: unknown) => {
  console.error('[queue:sync] Failed:', error);
  process.exit(1);
});
