import { CoreApiClient } from 'twenty-client-sdk/core';
import { LeadStage } from 'src/objects/lead.object';
import { getSalesMemberIds } from 'src/utils/distribution-queue-sync.util';
import { normalizeInboundPhone } from 'src/utils/normalize-inbound-phone.util';

type QueueEntry = {
  id: string;
  queueOrder: number;
  lastAssignedAt: string | null;
  assigneeId: string | null;
};

export const getNextQueueEntry = async (
  client: CoreApiClient,
): Promise<QueueEntry | null> => {
  const salesMemberIds = await getSalesMemberIds();

  const result = (await client.query({
    distributionQueueEntries: {
      __args: {
        orderBy: [{ queueOrder: 'AscNullsFirst' }],
        first: 100,
      },
      edges: {
        node: {
          id: true,
          queueOrder: true,
          lastAssignedAt: true,
          assigneeId: true,
        },
      },
    },
  } as never)) as {
    distributionQueueEntries: {
      edges: { node: QueueEntry }[];
    };
  };

  const entries = result.distributionQueueEntries.edges
    .map((edge) => edge.node)
    .filter(
      (entry) =>
        entry.assigneeId !== null && salesMemberIds.has(entry.assigneeId),
    );

  if (entries.length === 0) {
    return null;
  }

  return [...entries].sort((first, second) => {
    if (!first.lastAssignedAt && !second.lastAssignedAt) {
      return first.queueOrder - second.queueOrder;
    }
    if (!first.lastAssignedAt) return -1;
    if (!second.lastAssignedAt) return 1;
    return (
      new Date(first.lastAssignedAt).getTime() -
      new Date(second.lastAssignedAt).getTime()
    );
  })[0];
};

export const assignLeadToNextInCycle = async (
  client: CoreApiClient,
  leadId: string,
): Promise<{ assigneeId: string | null }> => {
  const nextEntry = await getNextQueueEntry(client);

  if (!nextEntry?.assigneeId) {
    return { assigneeId: null };
  }

  await client.mutation({
    updateLead: {
      __args: {
        id: leadId,
        data: { assigneeId: nextEntry.assigneeId },
      },
      id: true,
    },
  } as never);

  await client.mutation({
    updateDistributionQueueEntry: {
      __args: {
        id: nextEntry.id,
        data: { lastAssignedAt: new Date().toISOString() },
      },
      id: true,
    },
  } as never);

  return { assigneeId: nextEntry.assigneeId };
};

export const createLeadFromPayload = async (
  client: CoreApiClient,
  payload: {
    name: string;
    phone: string;
    phoneSecondary?: string;
    email?: string;
    source?: string;
    budget?: string;
    compound?: string;
  },
) => {
  const primaryPhoneNumber =
    normalizeInboundPhone(payload.phone) ?? payload.phone;

  const result = (await client.mutation({
    createLead: {
      __args: {
        data: {
          name: payload.name,
          phone: {
            primaryPhoneNumber,
            additionalPhones: payload.phoneSecondary
              ? [
                  {
                    number:
                      normalizeInboundPhone(payload.phoneSecondary) ??
                      payload.phoneSecondary,
                  },
                ]
              : undefined,
          },
          email: payload.email
            ? { primaryEmail: payload.email }
            : undefined,
          source: payload.source,
          budget: payload.budget,
          compound: payload.compound,
          stage: LeadStage.FRESH,
        },
      },
      id: true,
      name: true,
    },
  } as never)) as { createLead: { id: string; name: string } };

  return result.createLead;
};

export const findDuplicateLeadByPhone = async (
  client: CoreApiClient,
  phone: string,
) => {
  const normalizedPhone = normalizeInboundPhone(phone) ?? phone;

  const result = (await client.query({
    leads: {
      __args: {
        filter: {
          phone: { primaryPhoneNumber: { eq: normalizedPhone } },
        },
        first: 1,
      },
      edges: { node: { id: true, name: true } },
    },
  } as never)) as {
    leads: { edges: { node: { id: string; name: string } }[] };
  };

  return result.leads.edges[0]?.node ?? null;
};

export const createLeadComment = async (
  client: CoreApiClient,
  leadId: string,
  text: string,
) => {
  await client.mutation({
    createLeadComment: {
      __args: {
        data: {
          text,
          leadId,
        },
      },
      id: true,
    },
  } as never);
};
