import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useUserId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { DISTRIBUTION_FRONT_COMPONENT_ID, ROLE_IDS } from 'src/constants/uuids';
import { getBaitkPanelStyles } from 'src/front-components/utils/baitk-panel-styles.util';
import { postCoreGraphql } from 'src/utils/baitk-graphql.util';
import { callBaitkAppRoute } from 'src/utils/baitk-app-route.util';
import { loadCanManageBaitkDistribution } from 'src/utils/can-manage-baitk-distribution.util';
import {
  addMemberToDistributionQueue,
  moveQueueEntryOrder,
  removeMemberFromDistributionQueue,
} from 'src/utils/distribution-queue-sync.util';
import {
  type BaitkRoleRow,
  loadBaitkRolesWithMembers,
} from 'src/utils/load-baitk-workspace-members.util';
import { isBaitkSupportWorkspaceMember } from 'src/utils/baitk-support-user.util';

type QueueRow = {
  id: string;
  assigneeId: string;
  queueOrder: number;
  lastAssignedAt: string | null;
  assigneeName: string;
};

type SalesMemberRow = {
  id: string;
  name: string;
  email: string;
  inQueue: boolean;
};

const DistributionSettings = () => {
  const styles = getBaitkPanelStyles();
  const viewerUserId = useUserId();
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [salesMembers, setSalesMembers] = useState<SalesMemberRow[]>([]);
  const [nextId, setNextId] = useState<string | null>(null);
  const [canManageDistribution, setCanManageDistribution] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setMessage('');

    try {
      const [queueResult, rolesResult, canManage] = await Promise.all([
        postCoreGraphql<{
          distributionQueueEntries: {
            edges: {
              node: {
                id: string;
                queueOrder: number;
                lastAssignedAt: string | null;
                assigneeId: string;
                assignee: { name: { firstName: string; lastName: string } };
              };
            }[];
          };
        }>(`query LoadQueue {
          distributionQueueEntries(first: 50, orderBy: [{ queueOrder: AscNullsFirst }]) {
            edges {
              node {
                id
                queueOrder
                lastAssignedAt
                assigneeId
                assignee {
                  name {
                    firstName
                    lastName
                  }
                }
              }
            }
          }
        }`),
        loadBaitkRolesWithMembers({ viewerUserId }),
        loadCanManageBaitkDistribution(),
      ]);

      const rows = queueResult.distributionQueueEntries.edges
        .map((edge) => ({
          id: edge.node.id,
          assigneeId: edge.node.assigneeId,
          queueOrder: edge.node.queueOrder,
          lastAssignedAt: edge.node.lastAssignedAt,
          assigneeName:
            `${edge.node.assignee.name.firstName} ${edge.node.assignee.name.lastName}`.trim(),
        }))
        .filter(
          (row) =>
            !isBaitkSupportWorkspaceMember({
              id: row.assigneeId,
              userEmail: null,
            }),
        );

      setQueue(rows);
      setCanManageDistribution(canManage);

      const queuedAssigneeIds = new Set(rows.map((row) => row.assigneeId));
      const salesRole = rolesResult.roles.find(
        (role: BaitkRoleRow) => role.universalIdentifier === ROLE_IDS.sales,
      );

      setSalesMembers(
        (salesRole?.workspaceMembers ?? []).map((member) => ({
          id: member.id,
          name:
            `${member.name.firstName} ${member.name.lastName}`.trim() ||
            member.userEmail,
          email: member.userEmail,
          inQueue: queuedAssigneeIds.has(member.id),
        })),
      );

      const sorted = [...rows].sort((first, second) => {
        if (!first.lastAssignedAt && !second.lastAssignedAt) {
          return first.queueOrder - second.queueOrder;
        }
        if (!first.lastAssignedAt) return -1;
        if (!second.lastAssignedAt) return 1;
        return (
          new Date(first.lastAssignedAt).getTime() -
          new Date(second.lastAssignedAt).getTime()
        );
      });

      setNextId(sorted[0]?.id ?? null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load distribution queue',
      );
      setQueue([]);
      setSalesMembers([]);
      setNextId(null);
      setCanManageDistribution(false);
    } finally {
      setLoading(false);
    }
  }, [viewerUserId]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const autoDistribute = async () => {
    setMessage('Distributing...');

    try {
      const body = await callBaitkAppRoute<{ message?: string }>(
        '/baitk/distribution/auto-distribute',
        'POST',
      );
      setMessage(body.message ?? 'Done');
      await loadQueue();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Distribution failed',
      );
    }
  };

  const syncQueue = async () => {
    setMessage('Syncing queue with Sales role...');

    try {
      const body = await callBaitkAppRoute<{ message?: string }>(
        '/baitk/distribution/sync-queue',
        'POST',
      );
      setMessage(body.message ?? 'Queue synced');
      await loadQueue();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Queue sync failed',
      );
    }
  };

  const handleAddToQueue = async (member: SalesMemberRow) => {
    setMessage(`Adding ${member.name} to queue...`);

    try {
      await addMemberToDistributionQueue({
        workspaceMemberId: member.id,
        memberName: member.name,
      });
      setMessage(`${member.name} added to queue`);
      await loadQueue();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Failed to add to queue',
      );
    }
  };

  const handleRemoveFromQueue = async (row: QueueRow) => {
    setMessage(`Removing ${row.assigneeName} from queue...`);

    try {
      await removeMemberFromDistributionQueue(row.assigneeId);
      setMessage(`${row.assigneeName} removed from queue`);
      await loadQueue();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Failed to remove from queue',
      );
    }
  };

  const handleMoveQueueEntry = async (
    queueEntryId: string,
    direction: 'up' | 'down',
  ) => {
    setMessage('Updating queue order...');

    try {
      await moveQueueEntryOrder({ queueEntryId, direction });
      setMessage('Queue order updated');
      await loadQueue();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Failed to reorder queue',
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.body}>
          <p style={{ color: 'var(--t-font-color-secondary)' }}>
            Loading distribution queue...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Lead Distribution</h1>
        <p style={styles.pageSubtitle}>
          Round-robin assigns incoming leads to Sales role members only. Owner
          and Operations manage the queue; admins do not receive leads
          automatically.
        </p>
      </div>

      <div style={styles.body}>
        {message && (
          <p
            style={{
              margin: 0,
              color: 'var(--t-color-green)',
              fontSize: 14,
            }}
          >
            {message}
          </p>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Actions</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Button variant="primary" onClick={autoDistribute}>
              Auto-distribute unassigned leads
            </Button>
            {canManageDistribution && (
              <Button variant="secondary" onClick={syncQueue}>
                Sync queue with Sales role
              </Button>
            )}
          </div>
        </div>

        {nextId && (
          <div style={styles.section}>
            <div
              style={{
                display: 'inline-block',
                background: 'var(--t-background-transparent-orange)',
                color: 'var(--t-font-color-primary)',
                padding: '6px 12px',
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Next in cycle:{' '}
              {queue.find((row) => row.id === nextId)?.assigneeName ?? '—'}
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Round-robin queue</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  borderBottom: '1px solid var(--t-border-color-medium)',
                }}
              >
                <th style={{ padding: 8 }}>#</th>
                <th style={{ padding: 8 }}>Salesperson</th>
                <th style={{ padding: 8 }}>Last assigned</th>
                {canManageDistribution && <th style={{ padding: 8 }}>Order</th>}
                {canManageDistribution && <th style={{ padding: 8 }}>Remove</th>}
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr>
                  <td
                    colSpan={canManageDistribution ? 5 : 3}
                    style={{
                      padding: 16,
                      color: 'var(--t-font-color-secondary)',
                    }}
                  >
                    No salespeople in the queue. Assign users the Sales role,
                    then sync the queue.
                  </td>
                </tr>
              )}
              {queue.map((row, index) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid var(--t-border-color-light)',
                    background:
                      row.id === nextId
                        ? 'var(--t-background-transparent-blue)'
                        : 'transparent',
                  }}
                >
                  <td style={{ padding: 8 }}>{row.queueOrder + 1}</td>
                  <td style={{ padding: 8 }}>
                    {row.assigneeName}
                    {row.id === nextId && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          background: 'var(--t-background-transparent-orange)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        NEXT
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      color: 'var(--t-font-color-secondary)',
                    }}
                  >
                    {row.lastAssignedAt
                      ? new Date(row.lastAssignedAt).toLocaleString()
                      : 'Never'}
                  </td>
                  {canManageDistribution && (
                    <td style={{ padding: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                          variant="secondary"
                          size="small"
                          disabled={index === 0}
                          onClick={() => handleMoveQueueEntry(row.id, 'up')}
                        >
                          Up
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          disabled={index === queue.length - 1}
                          onClick={() => handleMoveQueueEntry(row.id, 'down')}
                        >
                          Down
                        </Button>
                      </div>
                    </td>
                  )}
                  {canManageDistribution && (
                    <td style={{ padding: 8 }}>
                      <Button
                        variant="secondary"
                        size="small"
                        accent="danger"
                        onClick={() => handleRemoveFromQueue(row)}
                      >
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canManageDistribution && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Sales team queue membership</h2>
            <p style={styles.sectionDescription}>
              Add or remove Sales role members from the round-robin cycle.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    textAlign: 'left',
                    borderBottom: '1px solid var(--t-border-color-medium)',
                  }}
                >
                  <th style={{ padding: 8 }}>Name</th>
                  <th style={{ padding: 8 }}>Email</th>
                  <th style={{ padding: 8 }}>In queue</th>
                  <th style={{ padding: 8 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {salesMembers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: 16,
                        color: 'var(--t-font-color-secondary)',
                      }}
                    >
                      No users with the Sales role yet. Create Sales users on
                      the Users page.
                    </td>
                  </tr>
                )}
                {salesMembers.map((member) => (
                  <tr
                    key={member.id}
                    style={{
                      borderBottom: '1px solid var(--t-border-color-light)',
                    }}
                  >
                    <td style={{ padding: 8 }}>{member.name}</td>
                    <td
                      style={{
                        padding: 8,
                        color: 'var(--t-font-color-secondary)',
                      }}
                    >
                      {member.email}
                    </td>
                    <td style={{ padding: 8 }}>
                      {member.inQueue ? 'Yes' : 'No'}
                    </td>
                    <td style={{ padding: 8 }}>
                      {member.inQueue ? (
                        <Button
                          variant="secondary"
                          size="small"
                          accent="danger"
                          onClick={() =>
                            handleRemoveFromQueue({
                              id: '',
                              assigneeId: member.id,
                              queueOrder: 0,
                              lastAssignedAt: null,
                              assigneeName: member.name,
                            })
                          }
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleAddToQueue(member)}
                        >
                          Add to queue
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: DISTRIBUTION_FRONT_COMPONENT_ID,
  name: 'baitk-distribution-settings',
  component: DistributionSettings,
});
