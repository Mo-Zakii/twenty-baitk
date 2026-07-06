import { type InstallPayload } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { POST_INSTALL_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import { configureBaitkRowLevelSecurity } from 'src/utils/configure-baitk-rls.util';
import { configureBaitkWorkspace } from 'src/utils/configure-baitk-workspace.util';
import { syncDistributionQueueForSalesMembers } from 'src/utils/distribution-queue-sync.util';

const handler = async (_payload: InstallPayload) => {
  await configureBaitkWorkspace();
  console.log('BAITK CRM: removed default Twenty CRM objects from workspace');

  const queueResult = await syncDistributionQueueForSalesMembers();

  console.log(
    `BAITK CRM: distribution queue synced — ${queueResult.salesMemberCount} salesperson(s), removed ${queueResult.removedCount}, added ${queueResult.addedCount}`,
  );

  await configureBaitkRowLevelSecurity();
  console.log('BAITK CRM: configured row-level security for scoped roles');

  const { syncAllLeadScopes } = await import('src/utils/sync-lead-scope.util');
  const scopeClient = new CoreApiClient();
  const scopeResult = await syncAllLeadScopes(scopeClient);
  console.log(
    `BAITK CRM: synced lead scope fields on ${scopeResult.syncedLeadCount} lead(s)`,
  );

  return { queueSize: queueResult.salesMemberCount };
};

export default definePostInstallLogicFunction({
  universalIdentifier: POST_INSTALL_LOGIC_FUNCTION_ID,
  name: 'baitk-post-install',
  description:
    'Configures BAITK workspace, distribution queue, RLS, and lead scopes',
  timeoutSeconds: 300,
  shouldRunSynchronously: true,
  handler,
});
