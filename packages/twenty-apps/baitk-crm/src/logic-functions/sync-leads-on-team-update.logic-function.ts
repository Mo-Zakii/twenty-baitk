import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  DatabaseEventPayload,
  defineLogicFunction,
} from 'twenty-sdk/define';
import { SYNC_LEADS_ON_TEAM_UPDATE_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import { syncLeadScopesForTeam } from 'src/utils/sync-lead-scope.util';
import { propagateManagerForTeamLeader } from 'src/utils/sync-team-manager-for-leader.util';

const handler = async (payload: DatabaseEventPayload) => {
  const properties = payload.properties as {
    after?: {
      id: string;
      leaderId?: string | null;
      managerId?: string | null;
    };
    updatedFields?: string[];
  };

  const teamId = properties.after?.id;

  if (!teamId) {
    return {};
  }

  const leaderChanged = properties.updatedFields?.includes('leaderId') ?? false;
  const managerChanged =
    properties.updatedFields?.includes('managerId') ?? false;

  if (!leaderChanged && !managerChanged) {
    return {};
  }

  const client = new CoreApiClient();
  const result = await syncLeadScopesForTeam({
    client,
    teamId,
    leaderId: properties.after?.leaderId,
    managerId: properties.after?.managerId,
  });

  const leaderId = properties.after?.leaderId ?? null;
  const managerId = properties.after?.managerId ?? null;

  const propagationResult =
    leaderId && (leaderChanged || managerChanged)
      ? await propagateManagerForTeamLeader({
          leaderId,
          managerId,
        })
      : { updatedTeamCount: 0, syncedLeadCount: 0 };

  return {
    teamId,
    ...result,
    ...propagationResult,
  };
};

export default defineLogicFunction({
  universalIdentifier: SYNC_LEADS_ON_TEAM_UPDATE_LOGIC_FUNCTION_ID,
  name: 'baitk-sync-leads-on-team-update',
  description:
    'Re-syncs lead scope fields when a team leader or manager is changed',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'baitkTeam.updated',
    updatedFields: ['leaderId', 'managerId'],
  },
});
