import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  DatabaseEventPayload,
  defineLogicFunction,
} from 'twenty-sdk/define';
import { SYNC_LEAD_SCOPE_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import { syncLeadScopeForLead } from 'src/utils/sync-lead-scope.util';

const handler = async (payload: DatabaseEventPayload) => {
  const properties = payload.properties as {
    after?: {
      id: string;
      teamId?: string | null;
    };
    updatedFields?: string[];
  };

  const leadId = properties.after?.id;

  if (!leadId) {
    return {};
  }

  const teamIdChanged = properties.updatedFields?.includes('teamId') ?? false;

  if (!teamIdChanged) {
    return {};
  }

  const client = new CoreApiClient();
  const result = await syncLeadScopeForLead({
    client,
    leadId,
    teamId: properties.after?.teamId,
  });

  return { ...result, teamId: properties.after?.teamId };
};

export default defineLogicFunction({
  universalIdentifier: SYNC_LEAD_SCOPE_LOGIC_FUNCTION_ID,
  name: 'baitk-sync-lead-scope',
  description:
    'Keeps team leader/manager scope fields in sync when a lead team changes',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'lead.updated',
    updatedFields: ['teamId'],
  },
});
