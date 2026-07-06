import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { AUTO_DISTRIBUTE_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import { assignLeadToNextInCycle } from 'src/utils/distribution.util';

const handler = async () => {
  const client = new CoreApiClient();

  const result = (await client.query({
    leads: {
      __args: {
        filter: { assigneeId: { is: 'NULL' } },
        first: 100,
        orderBy: [{ createdAt: 'AscNullsFirst' }],
      },
      edges: { node: { id: true, name: true } },
    },
  } as never)) as {
    leads: { edges: { node: { id: string; name: string } }[] };
  };

  const unassignedLeads = result.leads.edges.map((edge) => edge.node);
  let distributed = 0;

  for (const lead of unassignedLeads) {
    const { assigneeId } = await assignLeadToNextInCycle(client, lead.id);
    if (assigneeId) {
      distributed += 1;
    }
  }

  return {
    distributed,
    total: unassignedLeads.length,
    message: `Distributed ${distributed} of ${unassignedLeads.length} unassigned leads`,
  };
};

export default defineLogicFunction({
  universalIdentifier: AUTO_DISTRIBUTE_LOGIC_FUNCTION_ID,
  name: 'baitk-auto-distribute-leads',
  description: 'Assigns all unassigned leads using round-robin cycle order',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/distribution/auto-distribute',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
