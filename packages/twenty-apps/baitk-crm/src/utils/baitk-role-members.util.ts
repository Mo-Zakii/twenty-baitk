import { ROLE_IDS } from 'src/constants/uuids';

export type BaitkWorkspaceMemberRow = {
  id: string;
  userEmail: string;
  name: { firstName: string; lastName: string };
  roles?: { id: string; label: string; universalIdentifier?: string | null }[];
};

export type BaitkRoleRow = {
  id: string;
  label: string;
  universalIdentifier?: string | null;
  canBeAssignedToUsers: boolean;
  workspaceMembers?: {
    id: string;
    userEmail: string;
    name: { firstName: string; lastName: string };
  }[];
};

export const BAITK_ASSIGNABLE_ROLE_UNIVERSAL_IDS = new Set(
  Object.values(ROLE_IDS).filter(
    (roleUniversalIdentifier) => roleUniversalIdentifier !== ROLE_IDS.function,
  ),
);

// When stale data lists a member under multiple roles, later entries win.
const BAITK_ROLE_MEMBER_RESOLUTION_ORDER = [
  ROLE_IDS.owner,
  ROLE_IDS.operations,
  ROLE_IDS.marketing,
  ROLE_IDS.manager,
  ROLE_IDS.teamLeader,
  ROLE_IDS.sales,
] as const;

export const filterAssignableBaitkRoles = (roles: BaitkRoleRow[]): BaitkRoleRow[] =>
  roles
    .filter(
      (role) =>
        role.canBeAssignedToUsers &&
        role.universalIdentifier &&
        BAITK_ASSIGNABLE_ROLE_UNIVERSAL_IDS.has(
          role.universalIdentifier as (typeof ROLE_IDS)[keyof typeof ROLE_IDS],
        ),
    )
    .sort((leftRole, rightRole) =>
      leftRole.label.localeCompare(rightRole.label),
    );

export const resolveMemberBaitkRoleId = (
  member: BaitkWorkspaceMemberRow,
  assignableRoles: BaitkRoleRow[],
): string => {
  const memberRole = member.roles?.[0];

  if (!memberRole) {
    return assignableRoles[0]?.id ?? '';
  }

  const roleById = assignableRoles.find((role) => role.id === memberRole.id);

  if (roleById) {
    return roleById.id;
  }

  const roleByUniversalIdentifier = assignableRoles.find(
    (role) => role.universalIdentifier === memberRole.universalIdentifier,
  );

  return roleByUniversalIdentifier?.id ?? memberRole.id;
};

export const buildMembersFromBaitkRoles = (
  roles: BaitkRoleRow[],
): BaitkWorkspaceMemberRow[] => {
  const memberById = new Map<string, BaitkWorkspaceMemberRow>();
  const rolesByUniversalIdentifier = new Map<string, BaitkRoleRow>();

  for (const role of roles) {
    if (
      !role.universalIdentifier ||
      !BAITK_ASSIGNABLE_ROLE_UNIVERSAL_IDS.has(
        role.universalIdentifier as (typeof ROLE_IDS)[keyof typeof ROLE_IDS],
      )
    ) {
      continue;
    }

    rolesByUniversalIdentifier.set(role.universalIdentifier, role);
  }

  for (const roleUniversalIdentifier of BAITK_ROLE_MEMBER_RESOLUTION_ORDER) {
    const role = rolesByUniversalIdentifier.get(roleUniversalIdentifier);

    if (!role) {
      continue;
    }

    for (const member of role.workspaceMembers ?? []) {
      memberById.set(member.id, {
        ...member,
        roles: [
          {
            id: role.id,
            label: role.label,
            universalIdentifier: role.universalIdentifier,
          },
        ],
      });
    }
  }

  return Array.from(memberById.values()).sort((leftMember, rightMember) => {
    const leftMemberName =
      `${leftMember.name.firstName} ${leftMember.name.lastName}`.trim() ||
      leftMember.userEmail;
    const rightMemberName =
      `${rightMember.name.firstName} ${rightMember.name.lastName}`.trim() ||
      rightMember.userEmail;

    return leftMemberName.localeCompare(rightMemberName);
  });
};
