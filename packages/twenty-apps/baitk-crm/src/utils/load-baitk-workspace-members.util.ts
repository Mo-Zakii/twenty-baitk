import { postMetadataGraphql } from 'src/utils/baitk-graphql.util';
import {
  buildMembersFromBaitkRoles,
  type BaitkRoleRow,
  type BaitkWorkspaceMemberRow,
} from 'src/utils/baitk-role-members.util';
import { filterSupportUsersFromBaitkRoles } from 'src/utils/baitk-support-user.util';

export type { BaitkRoleRow, BaitkWorkspaceMemberRow } from 'src/utils/baitk-role-members.util';
export { buildMembersFromBaitkRoles } from 'src/utils/baitk-role-members.util';

export const loadBaitkRolesWithMembers = async (options?: {
  viewerUserId?: string | null;
}): Promise<{
  roles: BaitkRoleRow[];
  members: BaitkWorkspaceMemberRow[];
}> => {
  const rolesResult = await postMetadataGraphql<{ getRoles: BaitkRoleRow[] }>(
    `query LoadBaitkRolesWithMembers {
      getRoles {
        id
        label
        universalIdentifier
        canBeAssignedToUsers
        workspaceMembers {
          id
          userEmail
          name {
            firstName
            lastName
          }
        }
      }
    }`,
  );

  const roles = filterSupportUsersFromBaitkRoles(
    rolesResult.getRoles ?? [],
    options?.viewerUserId,
  );

  return {
    roles,
    members: buildMembersFromBaitkRoles(roles),
  };
};
