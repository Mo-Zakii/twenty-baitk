import { ROLE_IDS } from 'src/constants/uuids';
import {
  postCoreGraphql,
  postMetadataGraphql,
} from 'src/utils/baitk-graphql.util';
import {
  type BaitkRoleRow,
  loadBaitkRolesWithMembers,
} from 'src/utils/load-baitk-workspace-members.util';

type QueueEntryRow = {
  id: string;
  assigneeId: string | null;
  queueOrder: number;
};

export const isSalesRoleId = (
  roleId: string,
  roles: BaitkRoleRow[],
): boolean => {
  const role = roles.find((roleRow) => roleRow.id === roleId);

  return role?.universalIdentifier === ROLE_IDS.sales;
};

export const getSalesMemberIds = async (): Promise<Set<string>> => {
  const { roles } = await loadBaitkRolesWithMembers();
  const salesRole = roles.find(
    (role) => role.universalIdentifier === ROLE_IDS.sales,
  );

  return new Set(
    (salesRole?.workspaceMembers ?? []).map((member) => member.id),
  );
};

const loadAllQueueEntries = async (): Promise<QueueEntryRow[]> => {
  const result = await postCoreGraphql<{
    distributionQueueEntries: {
      edges: {
        node: QueueEntryRow;
      }[];
    };
  }>(`query LoadDistributionQueue {
    distributionQueueEntries(first: 100, orderBy: [{ queueOrder: AscNullsFirst }]) {
      edges {
        node {
          id
          assigneeId
          queueOrder
        }
      }
    }
  }`);

  return result.distributionQueueEntries.edges.map((edge) => edge.node);
};

const getNextQueueOrder = async (): Promise<number> => {
  const result = await postCoreGraphql<{
    distributionQueueEntries: { edges: { node: { queueOrder: number } }[] };
  }>(`query QueueSize {
    distributionQueueEntries(first: 1, orderBy: [{ queueOrder: DescNullsLast }]) {
      edges {
        node {
          queueOrder
        }
      }
    }
  }`);

  return (
    (result.distributionQueueEntries.edges[0]?.node.queueOrder ?? -1) + 1
  );
};

export const removeMemberFromDistributionQueue = async (
  workspaceMemberId: string,
): Promise<boolean> => {
  const result = await postCoreGraphql<{
    distributionQueueEntries: { edges: { node: { id: string } }[] };
  }>(
    `query QueueEntryForMember($assigneeId: UUID!) {
      distributionQueueEntries(
        filter: { assigneeId: { eq: $assigneeId } }
        first: 1
      ) {
        edges {
          node {
            id
          }
        }
      }
    }`,
    { assigneeId: workspaceMemberId },
  );

  const queueEntryId =
    result.distributionQueueEntries.edges[0]?.node.id ?? null;

  if (!queueEntryId) {
    return false;
  }

  await postCoreGraphql(
    `mutation DeleteQueueEntry($id: UUID!) {
      deleteDistributionQueueEntry(id: $id) {
        id
      }
    }`,
    { id: queueEntryId },
  );

  return true;
};

export const addMemberToDistributionQueue = async ({
  workspaceMemberId,
  memberName,
}: {
  workspaceMemberId: string;
  memberName: string;
}): Promise<boolean> => {
  const existingResult = await postCoreGraphql<{
    distributionQueueEntries: { edges: { node: { id: string } }[] };
  }>(
    `query ExistingQueueEntry($assigneeId: UUID!) {
      distributionQueueEntries(
        filter: { assigneeId: { eq: $assigneeId } }
        first: 1
      ) {
        edges {
          node {
            id
          }
        }
      }
    }`,
    { assigneeId: workspaceMemberId },
  );

  if (existingResult.distributionQueueEntries.edges.length > 0) {
    return false;
  }

  const nextQueueOrder = await getNextQueueOrder();

  await postCoreGraphql(
    `mutation AddToQueue(
      $assigneeId: UUID!
      $queueOrder: Float!
      $name: String!
    ) {
      createDistributionQueueEntry(
        data: {
          assigneeId: $assigneeId
          queueOrder: $queueOrder
          name: $name
        }
      ) {
        id
      }
    }`,
    {
      assigneeId: workspaceMemberId,
      queueOrder: nextQueueOrder,
      name: memberName.trim() || 'Sales queue entry',
    },
  );

  return true;
};

export const syncMemberDistributionQueueEntry = async ({
  workspaceMemberId,
  roleId,
  memberName,
}: {
  workspaceMemberId: string;
  roleId: string;
  memberName: string;
}): Promise<void> => {
  const { roles } = await loadBaitkRolesWithMembers();

  if (isSalesRoleId(roleId, roles)) {
    await addMemberToDistributionQueue({ workspaceMemberId, memberName });
    return;
  }

  await removeMemberFromDistributionQueue(workspaceMemberId);
};

export const syncDistributionQueueForSalesMembers = async (): Promise<{
  removedCount: number;
  addedCount: number;
  salesMemberCount: number;
}> => {
  const { roles } = await loadBaitkRolesWithMembers();
  const salesRole = roles.find(
    (role) => role.universalIdentifier === ROLE_IDS.sales,
  );
  const salesMembers = salesRole?.workspaceMembers ?? [];
  const salesMemberIds = new Set(salesMembers.map((member) => member.id));
  const salesMemberNameById = new Map(
    salesMembers.map((member) => [
      member.id,
      `${member.name.firstName} ${member.name.lastName}`.trim() ||
        member.userEmail,
    ]),
  );

  const queueEntries = await loadAllQueueEntries();
  let removedCount = 0;
  let addedCount = 0;

  for (const queueEntry of queueEntries) {
    if (
      queueEntry.assigneeId &&
      !salesMemberIds.has(queueEntry.assigneeId)
    ) {
      await postCoreGraphql(
        `mutation DeleteQueueEntry($id: UUID!) {
          deleteDistributionQueueEntry(id: $id) {
            id
          }
        }`,
        { id: queueEntry.id },
      );
      removedCount += 1;
    }
  }

  const refreshedEntries = await loadAllQueueEntries();
  const queuedAssigneeIds = new Set(
    refreshedEntries
      .map((queueEntry) => queueEntry.assigneeId)
      .filter((assigneeId): assigneeId is string => assigneeId !== null),
  );

  for (const salesMemberId of salesMemberIds) {
    if (queuedAssigneeIds.has(salesMemberId)) {
      continue;
    }

    await addMemberToDistributionQueue({
      workspaceMemberId: salesMemberId,
      memberName:
        salesMemberNameById.get(salesMemberId) ?? 'Sales queue entry',
    });
    addedCount += 1;
  }

  return {
    removedCount,
    addedCount,
    salesMemberCount: salesMemberIds.size,
  };
};

export const resolveSalesRoleId = async (): Promise<string | null> => {
  const rolesResult = await postMetadataGraphql<{ getRoles: BaitkRoleRow[] }>(
    `query LoadSalesRole {
      getRoles {
        id
        universalIdentifier
      }
    }`,
  );

  return (
    rolesResult.getRoles.find(
      (role) => role.universalIdentifier === ROLE_IDS.sales,
    )?.id ?? null
  );
};

export const moveQueueEntryOrder = async ({
  queueEntryId,
  direction,
}: {
  queueEntryId: string;
  direction: 'up' | 'down';
}): Promise<void> => {
  const queueEntries = await loadAllQueueEntries();
  const sortedEntries = [...queueEntries].sort(
    (leftEntry, rightEntry) => leftEntry.queueOrder - rightEntry.queueOrder,
  );

  const entryIndex = sortedEntries.findIndex(
    (queueEntry) => queueEntry.id === queueEntryId,
  );

  if (entryIndex === -1) {
    return;
  }

  const swapIndex =
    direction === 'up' ? entryIndex - 1 : entryIndex + 1;

  if (swapIndex < 0 || swapIndex >= sortedEntries.length) {
    return;
  }

  const currentEntry = sortedEntries[entryIndex];
  const swapEntry = sortedEntries[swapIndex];

  await postCoreGraphql(
    `mutation UpdateQueueOrder($id: UUID!, $queueOrder: Float!) {
      updateDistributionQueueEntry(id: $id, data: { queueOrder: $queueOrder }) {
        id
      }
    }`,
    { id: currentEntry.id, queueOrder: swapEntry.queueOrder },
  );

  await postCoreGraphql(
    `mutation UpdateQueueOrder($id: UUID!, $queueOrder: Float!) {
      updateDistributionQueueEntry(id: $id, data: { queueOrder: $queueOrder }) {
        id
      }
    }`,
    { id: swapEntry.id, queueOrder: currentEntry.queueOrder },
  );
};
