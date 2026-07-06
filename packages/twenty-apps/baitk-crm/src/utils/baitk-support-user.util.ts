import {
  BAITK_SUPPORT_USER_EMAILS,
  BAITK_SUPPORT_USER_IDS,
} from 'src/constants/baitk-support-user.constants';

const supportUserEmails = new Set(
  BAITK_SUPPORT_USER_EMAILS.map((email) => email.toLowerCase()),
);

const supportUserIds = new Set<string>(BAITK_SUPPORT_USER_IDS);

export const isBaitkSupportUserEmail = (email: string | null | undefined): boolean =>
  typeof email === 'string' &&
  supportUserEmails.has(email.trim().toLowerCase());

export const isBaitkSupportWorkspaceMember = (member: {
  id: string;
  userEmail?: string | null;
}): boolean =>
  supportUserIds.has(member.id) ||
  isBaitkSupportUserEmail(member.userEmail ?? null);

export const isBaitkSupportUserId = (
  userId: string | null | undefined,
): boolean => typeof userId === 'string' && supportUserIds.has(userId);

export const filterVisibleBaitkWorkspaceMembers = <
  TMember extends { id: string; userEmail?: string | null },
>(
  members: TMember[],
  viewerUserId?: string | null,
): TMember[] => {
  if (isBaitkSupportUserId(viewerUserId)) {
    return members;
  }

  return members.filter(
    (member) => !isBaitkSupportWorkspaceMember(member),
  );
};

export const filterSupportUsersFromBaitkRoles = <
  TRole extends {
    workspaceMembers?: { id: string; userEmail: string }[];
  },
>(
  roles: TRole[],
  viewerUserId?: string | null,
): TRole[] => {
  if (isBaitkSupportUserId(viewerUserId)) {
    return roles;
  }

  return roles.map((role) => ({
    ...role,
    workspaceMembers: (role.workspaceMembers ?? []).filter(
      (member) => !isBaitkSupportWorkspaceMember(member),
    ),
  }));
};
