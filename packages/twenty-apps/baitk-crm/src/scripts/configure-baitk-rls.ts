// Idempotent. Re-run after every BAITK app install/reinstall.
// Configures row-level permission predicates for scoped roles:
//   Sales       → lead.assignee IS current workspace member
//   Team Leader → lead.teamLeaderScope IS current workspace member
//   Manager     → lead.teamManagerScope IS current workspace member
//
// Usage:
//   yarn rls:configure

import { config } from 'dotenv';

config({ path: process.env.ENV_FILE ?? '.env.local' });

import { configureBaitkRowLevelSecurity } from 'src/utils/configure-baitk-rls.util';

async function main() {
  console.log('[rls:configure] configuring scoped lead access...');
  await configureBaitkRowLevelSecurity();
  console.log('\n[rls:configure] Done — scoped roles configured on lead object.');
}

main().catch((error: unknown) => {
  console.error('[rls:configure] Failed:', error);
  process.exit(1);
});
