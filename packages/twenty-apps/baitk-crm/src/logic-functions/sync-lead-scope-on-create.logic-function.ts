import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  DatabaseEventPayload,
  defineLogicFunction,
} from 'twenty-sdk/define';
import { SYNC_LEAD_SCOPE_ON_CREATE_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import { syncLeadScopeForLead } from 'src/utils/sync-lead-scope.util';

const handler = async (payload: DatabaseEventPayload) => {
  const properties = payload.properties as {
    after?: {
      id: string;
      teamId?: string | null;
    };
  };

  const leadId = properties.after?.id;
  const teamId = properties.after?.teamId;

  if (!leadId || !teamId) {
    return {};
  }

  const client = new CoreApiClient();
  const result = await syncLeadScopeForLead({ client, leadId, teamId });

  return result;
};

export default defineLogicFunction({
  universalIdentifier: SYNC_LEAD_SCOPE_ON_CREATE_LOGIC_FUNCTION_ID,
  name: 'baitk-sync-lead-scope-on-create',
  description:
    'Sets team leader/manager scope on new leads that already have a team',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'lead.created',
  },
});
