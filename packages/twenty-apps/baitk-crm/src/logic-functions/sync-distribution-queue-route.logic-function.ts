import { defineLogicFunction } from 'twenty-sdk/define';
import { SYNC_DISTRIBUTION_QUEUE_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import { syncDistributionQueueForSalesMembers } from 'src/utils/distribution-queue-sync.util';

const handler = async () => {
  const result = await syncDistributionQueueForSalesMembers();

  return {
    success: true,
    ...result,
    message: `Queue synced — ${result.salesMemberCount} salesperson(s), removed ${result.removedCount}, added ${result.addedCount}`,
  };
};

export default defineLogicFunction({
  universalIdentifier: SYNC_DISTRIBUTION_QUEUE_LOGIC_FUNCTION_ID,
  name: 'baitk-sync-distribution-queue',
  description:
    'Syncs round-robin queue so only Sales role members are included',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/distribution/sync-queue',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
