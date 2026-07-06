// BAITK CRM internal support — hidden from customer workspace users.

const BAITK_SUPPORT_USER_EMAILS = ['tim@apple.dev'] as const;

const BAITK_SUPPORT_USER_IDS = [
  '20202020-9e3b-46d4-a556-88b9ddc2b034',
] as const;

const supportUserEmails = new Set(
  BAITK_SUPPORT_USER_EMAILS.map((email) => email.toLowerCase()),
);

const supportUserIds = new Set<string>(BAITK_SUPPORT_USER_IDS);

type WorkspaceMemberIdentity = {
  id: string;
  userEmail?: string | null;
};

export const isBaitkSupportWorkspaceMember = (
  member: WorkspaceMemberIdentity,
): boolean =>
  supportUserIds.has(member.id) ||
  (typeof member.userEmail === 'string' &&
    supportUserEmails.has(member.userEmail.trim().toLowerCase()));

export const filterVisibleWorkspaceMembers = <
  TMember extends WorkspaceMemberIdentity,
>(
  members: TMember[],
  currentWorkspaceMember: WorkspaceMemberIdentity | null | undefined,
): TMember[] => {
  if (
    currentWorkspaceMember &&
    isBaitkSupportWorkspaceMember(currentWorkspaceMember)
  ) {
    return members;
  }

  return members.filter((member) => !isBaitkSupportWorkspaceMember(member));
};
