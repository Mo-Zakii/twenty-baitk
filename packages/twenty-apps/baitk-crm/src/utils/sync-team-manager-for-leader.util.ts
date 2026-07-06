import { postCoreGraphql } from 'src/utils/baitk-graphql.util';
import { syncLeadScopesForTeam } from 'src/utils/sync-lead-scope.util';
import { CoreApiClient } from 'twenty-client-sdk/core';

type TeamLeaderAssignmentRow = {
  id: string;
  name: string;
  leaderId: string | null;
  managerId: string | null;
};

const loadTeamsLedByMemberGraphql = async (
  leaderId: string,
): Promise<TeamLeaderAssignmentRow[]> => {
  const result = await postCoreGraphql<{
    baitkTeams: { edges: { node: TeamLeaderAssignmentRow }[] };
  }>(
    `query TeamsLedByMember($leaderId: UUID!) {
      baitkTeams(filter: { leaderId: { eq: $leaderId } }, first: 100) {
        edges {
          node {
            id
            name
            leaderId
            managerId
          }
        }
      }
    }`,
    { leaderId },
  );

  return result.baitkTeams.edges.map((edge) => edge.node);
};

export const findManagerIdForTeamLeader = async (
  leaderId: string,
): Promise<string | null> => {
  const teams = await loadTeamsLedByMemberGraphql(leaderId);

  for (const team of teams) {
    if (team.managerId) {
      return team.managerId;
    }
  }

  return null;
};

export const propagateManagerForTeamLeader = async ({
  leaderId,
  managerId,
}: {
  leaderId: string | null;
  managerId: string | null;
}): Promise<{ updatedTeamCount: number; syncedLeadCount: number }> => {
  if (!leaderId) {
    return { updatedTeamCount: 0, syncedLeadCount: 0 };
  }

  const client = new CoreApiClient();
  const teams = await loadTeamsLedByMemberGraphql(leaderId);
  let updatedTeamCount = 0;
  let syncedLeadCount = 0;

  for (const team of teams) {
    if (team.managerId !== managerId) {
      await postCoreGraphql(
        `mutation UpdateTeamManager($id: UUID!, $managerId: UUID) {
          updateBaitkTeam(id: $id, data: { managerId: $managerId }) {
            id
          }
        }`,
        { id: team.id, managerId },
      );
      updatedTeamCount += 1;
    }

    const scopeResult = await syncLeadScopesForTeam({
      client,
      teamId: team.id,
      leaderId,
      managerId,
    });
    syncedLeadCount += scopeResult.syncedLeadCount;
  }

  return { updatedTeamCount, syncedLeadCount };
};

export const resolveManagerIdForTeamLeader = async ({
  leaderId,
  managerId,
}: {
  leaderId: string | null;
  managerId: string | null;
}): Promise<string | null> => {
  if (managerId) {
    return managerId;
  }

  if (!leaderId) {
    return null;
  }

  return findManagerIdForTeamLeader(leaderId);
};
