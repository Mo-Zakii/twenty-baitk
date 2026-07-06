import { useCallback, useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useUserId } from 'twenty-sdk/front-component';
import { Button, Callout } from 'twenty-sdk/ui';
import { ROLE_IDS, USERS_FRONT_COMPONENT_ID } from 'src/constants/uuids';
import { PasswordField } from 'src/front-components/components/password-field.component';
import { getBaitkPanelStyles } from 'src/front-components/utils/baitk-panel-styles.util';
import { postMetadataGraphql } from 'src/utils/baitk-graphql.util';
import { callBaitkAppRoute } from 'src/utils/baitk-app-route.util';
import {
  filterAssignableBaitkRoles,
  resolveMemberBaitkRoleId,
} from 'src/utils/baitk-role-members.util';
import {
  removeMemberFromDistributionQueue,
  syncMemberDistributionQueueEntry,
} from 'src/utils/distribution-queue-sync.util';
import {
  type BaitkRoleRow,
  type BaitkWorkspaceMemberRow,
  loadBaitkRolesWithMembers,
} from 'src/utils/load-baitk-workspace-members.util';
import { isBaitkSupportWorkspaceMember } from 'src/utils/baitk-support-user.util';

type RouteResponse = {
  success: boolean;
  message: string;
};

type MessageState = {
  text: string;
  variant: 'success' | 'error' | 'neutral';
};

const UsersManagementPanel = () => {
  const styles = getBaitkPanelStyles();
  const viewerUserId = useUserId();
  const [members, setMembers] = useState<BaitkWorkspaceMemberRow[]>([]);
  const [roles, setRoles] = useState<BaitkRoleRow[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [changePassword, setChangePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordMemberId, setResetPasswordMemberId] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [message, setMessage] = useState<MessageState | null>(null);
  const [loading, setLoading] = useState(true);

  const baitkRoles = useMemo(
    () => filterAssignableBaitkRoles(roles),
    [roles],
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
      const { roles: loadedRoles, members: loadedMembers } =
        await loadBaitkRolesWithMembers({ viewerUserId });

      setMembers(loadedMembers);
      setRoles(loadedRoles);
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to load users',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [viewerUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (newRoleId || baitkRoles.length === 0) {
      return;
    }

    const salesRole = baitkRoles.find(
      (role) => role.universalIdentifier === ROLE_IDS.sales,
    );
    setNewRoleId(salesRole?.id ?? baitkRoles[0]?.id ?? '');
  }, [baitkRoles, newRoleId]);

  const createUser = async () => {
    if (!newEmail.trim() || !newPassword) {
      showMessage('Email and password are required', 'error');
      return;
    }

    showMessage('Creating user...');

    try {
      const result = await callBaitkAppRoute<RouteResponse>(
        '/baitk/users/create',
        'POST',
        {
          email: newEmail.trim(),
          password: newPassword,
          firstName: newFirstName.trim(),
          lastName: newLastName.trim(),
          roleId: newRoleId,
        },
      );

      if (!result.success) {
        showMessage(result.message, 'error');
        return;
      }

      setNewEmail('');
      setNewPassword('');
      setNewFirstName('');
      setNewLastName('');
      showMessage(result.message, 'success');
      await loadData();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to create user',
        'error',
      );
    }
  };

  const removeMember = async (member: BaitkWorkspaceMemberRow) => {
    if (isBaitkSupportWorkspaceMember(member)) {
      showMessage('This account cannot be removed', 'error');
      return;
    }

    const memberName =
      `${member.name.firstName} ${member.name.lastName}`.trim() ||
      member.userEmail;

    if (
      !window.confirm(
        `Remove ${memberName} from the workspace? They will lose access immediately.`,
      )
    ) {
      return;
    }

    showMessage('Removing member...');

    await postMetadataGraphql(
      `mutation DeleteUserFromWorkspace($workspaceMemberIdToDelete: String!) {
        deleteUserFromWorkspace(
          workspaceMemberIdToDelete: $workspaceMemberIdToDelete
        ) {
          id
        }
      }`,
      { workspaceMemberIdToDelete: member.id },
    );

    await removeMemberFromDistributionQueue(member.id);

    showMessage(`${memberName} removed`, 'success');
    await loadData();
  };

  const updateMemberRole = async (
    member: BaitkWorkspaceMemberRow,
    roleId: string,
  ) => {
    showMessage('Updating role...');

    await postMetadataGraphql(
      `mutation UpdateWorkspaceMemberRole(
        $workspaceMemberId: UUID!
        $roleId: UUID!
      ) {
        updateWorkspaceMemberRole(
          workspaceMemberId: $workspaceMemberId
          roleId: $roleId
        ) {
          id
        }
      }`,
      { workspaceMemberId: member.id, roleId },
    );

    const memberName =
      `${member.name.firstName} ${member.name.lastName}`.trim() ||
      member.userEmail;

    await syncMemberDistributionQueueEntry({
      workspaceMemberId: member.id,
      roleId,
      memberName,
    });

    const selectedRole = baitkRoles.find((role) => role.id === roleId);

    setMembers((currentMembers) =>
      currentMembers.map((currentMember) =>
        currentMember.id === member.id
          ? {
              ...currentMember,
              roles: selectedRole
                ? [
                    {
                      id: selectedRole.id,
                      label: selectedRole.label,
                      universalIdentifier: selectedRole.universalIdentifier,
                    },
                  ]
                : currentMember.roles,
            }
          : currentMember,
      ),
    );

    showMessage('Role updated', 'success');
    await loadData();
  };

  const submitPasswordChange = async () => {
    if (!currentPassword || !changePassword) {
      showMessage('Enter your current and new password', 'error');
      return;
    }

    if (changePassword !== confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    showMessage('Updating your password...');

    try {
      const result = await callBaitkAppRoute<RouteResponse>(
        '/baitk/users/change-password',
        'POST',
        {
          currentPassword,
          newPassword: changePassword,
        },
      );

      if (!result.success) {
        showMessage(result.message, 'error');
        return;
      }

      setCurrentPassword('');
      setChangePassword('');
      setConfirmPassword('');
      showMessage(result.message, 'success');
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to change password',
        'error',
      );
    }
  };

  const submitMemberPasswordReset = async () => {
    if (!resetPasswordMemberId || !resetPasswordValue) {
      showMessage('Choose a member and enter a new password', 'error');
      return;
    }

    showMessage('Setting password...');

    try {
      const result = await callBaitkAppRoute<RouteResponse>(
        '/baitk/users/set-password',
        'POST',
        {
          workspaceMemberId: resetPasswordMemberId,
          newPassword: resetPasswordValue,
        },
      );

      if (!result.success) {
        showMessage(result.message, 'error');
        return;
      }

      setResetPasswordMemberId('');
      setResetPasswordValue('');
      showMessage(result.message, 'success');
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to set password',
        'error',
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centeredState}>Loading users...</div>
      </div>
    );
  }

  const resetMemberEmail =
    members.find((member) => member.id === resetPasswordMemberId)?.userEmail ??
    'selected member';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Users</h1>
        <p style={styles.pageSubtitle}>
          Add users with email and password. Assign the Team Leader role here,
          then link leaders to teams on the Teams page.
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
            <h2 style={styles.sectionTitle}>Add user</h2>
            <p style={styles.sectionDescription}>
              Create an account the user can sign in with immediately.
            </p>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="email@company.com"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
              />
            </div>

            <PasswordField value={newPassword} onChange={setNewPassword} />

            <div style={styles.field}>
              <label style={styles.label}>First name</label>
              <input
                style={styles.input}
                value={newFirstName}
                onChange={(event) => setNewFirstName(event.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Last name</label>
              <input
                style={styles.input}
                value={newLastName}
                onChange={(event) => setNewLastName(event.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <select
                style={styles.select}
                value={newRoleId}
                onChange={(event) => setNewRoleId(event.target.value)}
              >
                {baitkRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <Button
              variant="primary"
              accent="blue"
              title="Create user"
              onClick={createUser}
            />
          </div>
        </section>

        <section style={styles.section}>
          <div>
            <h2 style={styles.sectionTitle}>Change your password</h2>
            <p style={styles.sectionDescription}>
              Update your own password without email verification.
            </p>
          </div>

          <div style={styles.formGrid}>
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />

            <PasswordField
              label="New password"
              value={changePassword}
              onChange={setChangePassword}
            />

            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>

          <div style={styles.actionsRow}>
            <Button
              variant="secondary"
              title="Update my password"
              onClick={submitPasswordChange}
            />
          </div>
        </section>

        <section style={styles.section}>
          <div>
            <h2 style={styles.sectionTitle}>Team members</h2>
            <p style={styles.sectionDescription}>
              Manage roles and access for people in this workspace.
            </p>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeadCell}>Name</th>
                <th style={styles.tableHeadCell}>Email</th>
                <th style={styles.tableHeadCell}>Role</th>
                <th style={styles.tableHeadCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const memberName =
                  `${member.name.firstName} ${member.name.lastName}`.trim() ||
                  '—';
                const currentRoleId = resolveMemberBaitkRoleId(
                  member,
                  baitkRoles,
                );

                return (
                  <tr key={member.id}>
                    <td style={styles.tableCell}>{memberName}</td>
                    <td style={styles.tableCellSecondary}>
                      {member.userEmail}
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        style={styles.select}
                        value={currentRoleId}
                        onChange={(event) =>
                          updateMemberRole(member, event.target.value)
                        }
                      >
                        {baitkRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.tableActions}>
                        <Button
                          variant="secondary"
                          size="small"
                          title="Set password"
                          onClick={() => setResetPasswordMemberId(member.id)}
                        />
                        <Button
                          variant="secondary"
                          accent="danger"
                          size="small"
                          title="Remove"
                          onClick={() => removeMember(member)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {resetPasswordMemberId && (
          <section style={styles.section}>
            <div>
              <h2 style={styles.sectionTitle}>Set member password</h2>
              <p style={styles.sectionDescription}>
                Set a new password for {resetMemberEmail}.
              </p>
            </div>

            <div style={styles.formGrid}>
              <PasswordField
                label="New password"
                value={resetPasswordValue}
                onChange={setResetPasswordValue}
              />
            </div>

            <div style={styles.actionsRow}>
              <Button
                variant="primary"
                accent="blue"
                title="Save password"
                onClick={submitMemberPasswordReset}
              />
              <Button
                variant="secondary"
                title="Cancel"
                onClick={() => {
                  setResetPasswordMemberId('');
                  setResetPasswordValue('');
                }}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: USERS_FRONT_COMPONENT_ID,
  name: 'baitk-users-management',
  component: UsersManagementPanel,
});
