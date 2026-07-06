import { ROLE_IDS } from 'src/constants/uuids';
import { postMetadataGraphql } from 'src/utils/baitk-graphql.util';
import { isBaitkSupportUserId } from 'src/utils/baitk-support-user.util';

const ADMIN_DISTRIBUTION_ROLE_UNIVERSAL_IDS = new Set([
  ROLE_IDS.owner,
  ROLE_IDS.operations,
]);

export const loadCanManageBaitkDistribution = async (): Promise<boolean> => {
  const result = await postMetadataGraphql<{
    currentUser: {
      id: string;
      workspaceMember: { id: string } | null;
    };
    currentUserWorkspace: {
      permissionFlags: string[];
    } | null;
    getRoles: {
      universalIdentifier: string | null;
      workspaceMembers: { id: string }[];
    }[];
  }>(`query CanManageBaitkDistribution {
    currentUser {
      id
      workspaceMember {
        id
      }
    }
    currentUserWorkspace {
      permissionFlags
    }
    getRoles {
      universalIdentifier
      workspaceMembers {
        id
      }
    }
  }`);

  const permissionFlags = result.currentUserWorkspace?.permissionFlags ?? [];

  if (isBaitkSupportUserId(result.currentUser.id)) {
    return true;
  }

  if (
    permissionFlags.includes('WORKSPACE_MEMBERS') &&
    permissionFlags.includes('ROLES')
  ) {
    return true;
  }

  const workspaceMemberId = result.currentUser.workspaceMember?.id;

  if (!workspaceMemberId) {
    return false;
  }

  return result.getRoles.some(
    (role) =>
      role.universalIdentifier !== null &&
      ADMIN_DISTRIBUTION_ROLE_UNIVERSAL_IDS.has(
        role.universalIdentifier as (typeof ROLE_IDS)[keyof typeof ROLE_IDS],
      ) &&
      role.workspaceMembers.some(
        (member) => member.id === workspaceMemberId,
      ),
  );
};
