import { CoreApiClient } from 'twenty-client-sdk/core';

type TeamScopeIds = {
  leaderId: string | null;
  managerId: string | null;
};

const loadTeamScopeIds = async (
  client: CoreApiClient,
  teamId: string,
): Promise<TeamScopeIds | null> => {
  const teamResult = (await client.query({
    baitkTeams: {
      __args: {
        filter: { id: { eq: teamId } },
        first: 1,
      },
      edges: {
        node: {
          leaderId: true,
          managerId: true,
        },
      },
    },
  } as never)) as {
    baitkTeams: {
      edges: {
        node: TeamScopeIds;
      }[];
    };
  };

  return teamResult.baitkTeams.edges[0]?.node ?? null;
};

export const syncLeadScopeForLead = async ({
  client,
  leadId,
  teamId,
}: {
  client: CoreApiClient;
  leadId: string;
  teamId: string | null | undefined;
}): Promise<{ synced: boolean; leadId: string }> => {
  if (!teamId) {
    await client.mutation({
      updateLead: {
        __args: {
          id: leadId,
          data: {
            teamLeaderScopeId: null,
            teamManagerScopeId: null,
          },
        },
        id: true,
      },
    } as never);

    return { synced: true, leadId };
  }

  const team = await loadTeamScopeIds(client, teamId);

  if (!team) {
    return { synced: false, leadId };
  }

  await client.mutation({
    updateLead: {
      __args: {
        id: leadId,
        data: {
          teamLeaderScopeId: team.leaderId,
          teamManagerScopeId: team.managerId,
        },
      },
      id: true,
    },
  } as never);

  return { synced: true, leadId };
};

export const syncLeadScopesForTeam = async ({
  client,
  teamId,
  leaderId,
  managerId,
}: {
  client: CoreApiClient;
  teamId: string;
  leaderId?: string | null;
  managerId?: string | null;
}): Promise<{ syncedLeadCount: number }> => {
  const scopeIds =
    leaderId !== undefined && managerId !== undefined
      ? { leaderId: leaderId ?? null, managerId: managerId ?? null }
      : await loadTeamScopeIds(client, teamId);

  if (!scopeIds) {
    return { syncedLeadCount: 0 };
  }

  let syncedLeadCount = 0;
  let after: string | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pagingArgs = after
      ? { first: 100, after }
      : { first: 100 };

    const leadsResult = (await client.query({
      leads: {
        __args: {
          filter: { teamId: { eq: teamId } },
          ...pagingArgs,
        },
        edges: {
          node: { id: true },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    } as never)) as {
      leads: {
        edges: { node: { id: string } }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };

    for (const edge of leadsResult.leads.edges) {
      await client.mutation({
        updateLead: {
          __args: {
            id: edge.node.id,
            data: {
              teamLeaderScopeId: scopeIds.leaderId,
              teamManagerScopeId: scopeIds.managerId,
            },
          },
          id: true,
        },
      } as never);
      syncedLeadCount += 1;
    }

    if (!leadsResult.leads.pageInfo.hasNextPage) {
      break;
    }

    after = leadsResult.leads.pageInfo.endCursor;
  }

  return { syncedLeadCount };
};

export const syncAllLeadScopes = async (
  client: CoreApiClient,
): Promise<{ syncedLeadCount: number }> => {
  let syncedLeadCount = 0;
  let after: string | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pagingArgs = after
      ? { first: 100, after }
      : { first: 100 };

    const leadsResult = (await client.query({
      leads: {
        __args: {
          filter: { teamId: { is: 'NOT_NULL' } },
          ...pagingArgs,
        },
        edges: {
          node: { id: true, teamId: true },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    } as never)) as {
      leads: {
        edges: { node: { id: string; teamId: string | null } }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };

    for (const edge of leadsResult.leads.edges) {
      const result = await syncLeadScopeForLead({
        client,
        leadId: edge.node.id,
        teamId: edge.node.teamId,
      });

      if (result.synced) {
        syncedLeadCount += 1;
      }
    }

    if (!leadsResult.leads.pageInfo.hasNextPage) {
      break;
    }

    after = leadsResult.leads.pageInfo.endCursor;
  }

  return { syncedLeadCount };
};
