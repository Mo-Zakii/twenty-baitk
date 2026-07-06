import { useCallback, useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useUserId } from 'twenty-sdk/front-component';
import { Button, Callout } from 'twenty-sdk/ui';
import { ROLE_IDS, TEAMS_FRONT_COMPONENT_ID } from 'src/constants/uuids';
import { getBaitkPanelStyles } from 'src/front-components/utils/baitk-panel-styles.util';
import { postCoreGraphql } from 'src/utils/baitk-graphql.util';
import {
  findManagerIdForTeamLeader,
  propagateManagerForTeamLeader,
  resolveManagerIdForTeamLeader,
} from 'src/utils/sync-team-manager-for-leader.util';
import {
  type BaitkWorkspaceMemberRow,
  loadBaitkRolesWithMembers,
} from 'src/utils/load-baitk-workspace-members.util';

type TeamRow = {
  id: string;
  name: string;
  leaderId: string | null;
  managerId: string | null;
  leader?: {
    id: string;
    name: { firstName: string; lastName: string };
  } | null;
  manager?: {
    id: string;
    name: { firstName: string; lastName: string };
  } | null;
};

type MessageState = {
  text: string;
  variant: 'success' | 'error' | 'neutral';
};

const memberLabel = (member: BaitkWorkspaceMemberRow) => {
  const fullName =
    `${member.name.firstName} ${member.name.lastName}`.trim() ||
    member.userEmail;
  const roleLabel = member.roles?.[0]?.label;

  return roleLabel ? `${fullName} (${roleLabel})` : fullName;
};

const TeamsManagementPanel = () => {
  const styles = getBaitkPanelStyles();
  const viewerUserId = useUserId();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [members, setMembers] = useState<BaitkWorkspaceMemberRow[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLeaderId, setNewTeamLeaderId] = useState('');
  const [newTeamManagerId, setNewTeamManagerId] = useState('');
  const [draftsByTeamId, setDraftsByTeamId] = useState<
    Record<string, { leaderId: string; managerId: string }>
  >({});
  const [message, setMessage] = useState<MessageState | null>(null);
  const [loading, setLoading] = useState(true);

  const teamLeaderMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.roles?.[0]?.universalIdentifier === ROLE_IDS.teamLeader,
      ),
    [members],
  );

  const managerMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.roles?.[0]?.universalIdentifier === ROLE_IDS.manager,
      ),
    [members],
  );

  const showMessage = (
    text: string,
    variant: MessageState['variant'] = 'neutral',
  ) => {
    setMessage({ text, variant });
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [teamsResult, membersResult] = await Promise.all([
        postCoreGraphql<{
          baitkTeams: { edges: { node: TeamRow }[] };
        }>(`query LoadTeams {
          baitkTeams(first: 100, orderBy: [{ name: AscNullsFirst }]) {
            edges {
              node {
                id
                name
                leaderId
                managerId
                leader {
                  id
                  name { firstName lastName }
                }
                manager {
                  id
                  name { firstName lastName }
                }
              }
            }
          }
        }`),
        loadBaitkRolesWithMembers({ viewerUserId }),
      ]);

      const loadedTeams = teamsResult.baitkTeams.edges.map((edge) => edge.node);
      setTeams(loadedTeams);
      setMembers(membersResult.members);
      setDraftsByTeamId(
        Object.fromEntries(
          loadedTeams.map((team) => [
            team.id,
            {
              leaderId: team.leaderId ?? '',
              managerId: team.managerId ?? '',
            },
          ]),
        ),
      );
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to load teams',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [viewerUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      showMessage('Team name is required', 'error');
      return;
    }

    if (!newTeamLeaderId) {
      showMessage('Team leader is required', 'error');
      return;
    }

    showMessage('Creating team...');

    try {
      const resolvedManagerId = await resolveManagerIdForTeamLeader({
        leaderId: newTeamLeaderId,
        managerId: newTeamManagerId || null,
      });

      await postCoreGraphql(
        `mutation CreateTeam($data: BaitkTeamCreateInput!) {
          createBaitkTeam(data: $data) { id }
        }`,
        {
          data: {
            name: newTeamName.trim(),
            leaderId: newTeamLeaderId,
            managerId: resolvedManagerId,
          },
        },
      );

      const propagationResult = await propagateManagerForTeamLeader({
        leaderId: newTeamLeaderId,
        managerId: resolvedManagerId,
      });

      setNewTeamName('');
      setNewTeamLeaderId('');
      setNewTeamManagerId('');
      showMessage(
        propagationResult.updatedTeamCount > 0
          ? `Team created — manager linked to ${propagationResult.updatedTeamCount + 1} team(s) for this leader`
          : 'Team created — manager can see this team leader’s leads',
        'success',
      );
      await loadData();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to create team',
        'error',
      );
    }
  };

  const saveTeam = async (team: TeamRow) => {
    const draft = draftsByTeamId[team.id];

    if (!draft) {
      return;
    }

    if (!draft.leaderId) {
      showMessage('Each team needs a team leader', 'error');
      return;
    }

    showMessage(`Saving ${team.name}...`);

    try {
      const resolvedManagerId = await resolveManagerIdForTeamLeader({
        leaderId: draft.leaderId,
        managerId: draft.managerId || null,
      });

      await postCoreGraphql(
        `mutation UpdateTeam($id: UUID!, $data: BaitkTeamUpdateInput!) {
          updateBaitkTeam(id: $id, data: $data) { id }
        }`,
        {
          id: team.id,
          data: {
            leaderId: draft.leaderId,
            managerId: resolvedManagerId,
          },
        },
      );

      const propagationResult = await propagateManagerForTeamLeader({
        leaderId: draft.leaderId,
        managerId: resolvedManagerId,
      });

      showMessage(
        propagationResult.updatedTeamCount > 0
          ? `${team.name} saved — manager now sees this leader across ${propagationResult.updatedTeamCount + 1} team(s)`
          : `${team.name} saved — manager sees this team leader’s leads`,
        'success',
      );
      await loadData();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to update team',
        'error',
      );
    }
  };

  const deleteTeam = async (team: TeamRow) => {
    if (
      !window.confirm(
        `Delete team "${team.name}"? Leads on this team will keep their team link until you change them.`,
      )
    ) {
      return;
    }

    showMessage(`Deleting ${team.name}...`);

    try {
      await postCoreGraphql(
        `mutation DeleteTeam($id: UUID!) {
          deleteBaitkTeam(id: $id) { id }
        }`,
        { id: team.id },
      );

      showMessage(`${team.name} deleted`, 'success');
      await loadData();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to delete team',
        'error',
      );
    }
  };

  const updateDraft = async (
    teamId: string,
    field: 'leaderId' | 'managerId',
    value: string,
  ) => {
    if (field === 'leaderId' && value) {
      const existingManagerId = await findManagerIdForTeamLeader(value);

      setDraftsByTeamId((previousDrafts) => ({
        ...previousDrafts,
        [teamId]: {
          leaderId: value,
          managerId:
            existingManagerId ??
            previousDrafts[teamId]?.managerId ??
            '',
        },
      }));

      return;
    }

    setDraftsByTeamId((previousDrafts) => ({
      ...previousDrafts,
      [teamId]: {
        leaderId: previousDrafts[teamId]?.leaderId ?? '',
        managerId: previousDrafts[teamId]?.managerId ?? '',
        [field]: value,
      },
    }));
  };

  const handleNewTeamLeaderChange = async (leaderId: string) => {
    setNewTeamLeaderId(leaderId);

    if (!leaderId) {
      return;
    }

    const existingManagerId = await findManagerIdForTeamLeader(leaderId);

    if (existingManagerId) {
      setNewTeamManagerId(existingManagerId);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centeredState}>Loading teams...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Teams</h1>
        <p style={styles.pageSubtitle}>
          Assign each team a team leader, then pick the manager who oversees
          that leader. The manager automatically sees that leader and all leads
          on every team they lead.
        </p>
      </div>

      <div style={styles.body}>
        {message && (
          <Callout
            variant={
              message.variant === 'error'
                ? 'error'
                : message.variant === 'success'
                  ? 'success'
                  : 'neutral'
            }
            title={message.text}
            description=""
          />
        )}

        <section style={styles.section}>
          <div>
            <h2 style={styles.sectionTitle}>Create team</h2>
            <p style={styles.sectionDescription}>
              Pick the team leader first, then their manager. If this leader
              already has a manager on another team, it fills in automatically.
            </p>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Team name</label>
              <input
                style={styles.input}
                placeholder="e.g. Downtown Sales"
                value={newTeamName}
                onChange={(event) => setNewTeamName(event.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Team leader</label>
              <select
                style={styles.select}
                value={newTeamLeaderId}
                onChange={(event) =>
                  handleNewTeamLeaderChange(event.target.value)
                }
              >
                <option value="">— None —</option>
                {(teamLeaderMembers.length > 0
                  ? teamLeaderMembers
                  : members
                ).map((member) => (
                  <option key={member.id} value={member.id}>
                    {memberLabel(member)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Manager over team leader</label>
              <select
                style={styles.select}
                value={newTeamManagerId}
                onChange={(event) => setNewTeamManagerId(event.target.value)}
              >
                <option value="">— None —</option>
                {(managerMembers.length > 0 ? managerMembers : members).map(
                  (member) => (
                    <option key={member.id} value={member.id}>
                      {memberLabel(member)}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <Button
              variant="primary"
              accent="blue"
              title="Create team"
              onClick={createTeam}
            />
          </div>
        </section>

        <section style={styles.section}>
          <div>
            <h2 style={styles.sectionTitle}>Teams</h2>
            <p style={styles.sectionDescription}>
              Saving applies the manager to every team this leader runs, and
              syncs lead access for both the leader and their manager.
            </p>
          </div>

          {teams.length === 0 ? (
            <div style={styles.centeredState}>No teams yet.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeadCell}>Team</th>
                  <th style={styles.tableHeadCell}>Team leader</th>
                  <th style={styles.tableHeadCell}>Manager over leader</th>
                  <th style={styles.tableHeadCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => {
                  const draft = draftsByTeamId[team.id] ?? {
                    leaderId: '',
                    managerId: '',
                  };

                  return (
                    <tr key={team.id}>
                      <td style={styles.tableCell}>{team.name}</td>
                      <td style={styles.tableCell}>
                        <select
                          style={styles.select}
                          value={draft.leaderId}
                          onChange={(event) =>
                            updateDraft(team.id, 'leaderId', event.target.value)
                          }
                        >
                          <option value="">— None —</option>
                          {(teamLeaderMembers.length > 0
                            ? teamLeaderMembers
                            : members
                          ).map((member) => (
                            <option key={member.id} value={member.id}>
                              {memberLabel(member)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={styles.tableCell}>
                        <select
                          style={styles.select}
                          value={draft.managerId}
                          onChange={(event) =>
                            updateDraft(
                              team.id,
                              'managerId',
                              event.target.value,
                            )
                          }
                        >
                          <option value="">— None —</option>
                          {(managerMembers.length > 0
                            ? managerMembers
                            : members
                          ).map((member) => (
                            <option key={member.id} value={member.id}>
                              {memberLabel(member)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.tableActions}>
                          <Button
                            variant="secondary"
                            size="small"
                            title="Save"
                            onClick={() => saveTeam(team)}
                          />
                          <Button
                            variant="secondary"
                            accent="danger"
                            size="small"
                            title="Delete"
                            onClick={() => deleteTeam(team)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: TEAMS_FRONT_COMPONENT_ID,
  name: 'baitk-teams-management',
  component: TeamsManagementPanel,
});
