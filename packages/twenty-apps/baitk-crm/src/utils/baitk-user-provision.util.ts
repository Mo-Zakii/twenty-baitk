type GraphqlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 50;

export const isValidPassword = (password: string): boolean =>
  password.length >= PASSWORD_MIN_LENGTH &&
  password.length <= PASSWORD_MAX_LENGTH;

export const getApiUrl = (): string => {
  const apiUrl = process.env.TWENTY_API_URL;

  if (!apiUrl) {
    throw new Error('TWENTY_API_URL is not set');
  }

  return apiUrl.replace(/\/$/, '');
};

export const getAppAccessToken = (): string => {
  const accessToken =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!accessToken) {
    throw new Error('TWENTY_APP_ACCESS_TOKEN or TWENTY_API_KEY is not set');
  }

  return accessToken;
};

export const postMetadataGraphql = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => {
  const response = await fetch(`${getApiUrl()}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAppAccessToken()}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Metadata request failed: HTTP ${response.status}`);
  }

  const body = (await response.json()) as GraphqlResponse<TData>;

  if (body.errors && body.errors.length > 0) {
    throw new Error(body.errors.map((error) => error.message).join(', '));
  }

  if (!body.data) {
    throw new Error('Metadata response contained no data');
  }

  return body.data;
};

export const postCoreGraphql = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => {
  const response = await fetch(`${getApiUrl()}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAppAccessToken()}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: HTTP ${response.status}`);
  }

  const body = (await response.json()) as GraphqlResponse<TData>;

  if (body.errors && body.errors.length > 0) {
    throw new Error(body.errors.map((error) => error.message).join(', '));
  }

  if (!body.data) {
    throw new Error('GraphQL response contained no data');
  }

  return body.data;
};

export type CreateBaitkUserPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
};

export type LogicFunctionEventBody = {
  email?: string;
  password?: string;
  newPassword?: string;
  currentPassword?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  workspaceMemberId?: string;
};

export const parseEventBody = (body: unknown): LogicFunctionEventBody => {
  if (!body || typeof body !== 'object') {
    return {};
  }

  return body as LogicFunctionEventBody;
};

type WorkspaceInfo = {
  id: string;
  inviteHash: string | null;
  isPublicInviteLinkEnabled: boolean;
};

export const ensurePublicInviteEnabled = async (): Promise<WorkspaceInfo> => {
  const workspaceResult = await postMetadataGraphql<{
    currentWorkspace: WorkspaceInfo;
  }>(`query CurrentWorkspace {
    currentWorkspace {
      id
      inviteHash
      isPublicInviteLinkEnabled
    }
  }`);

  const workspace = workspaceResult.currentWorkspace;

  if (!workspace.inviteHash) {
    throw new Error('Workspace invite hash is missing');
  }

  if (!workspace.isPublicInviteLinkEnabled) {
    await postMetadataGraphql(
      `mutation EnablePublicInvite {
        updateWorkspace(data: { isPublicInviteLinkEnabled: true }) {
          id
          isPublicInviteLinkEnabled
        }
      }`,
    );
  }

  return workspace;
};

export const provisionBaitkUser = async (
  payload: CreateBaitkUserPayload,
): Promise<{ workspaceMemberId: string; email: string }> => {
  const normalizedEmail = payload.email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  if (!isValidPassword(payload.password)) {
    throw new Error('Password must be 8–50 characters');
  }

  if (!payload.roleId) {
    throw new Error('Role is required');
  }

  const existingMemberResult = await postCoreGraphql<{
    workspaceMembers: { edges: { node: { id: string } }[] };
  }>(
    `query ExistingMember($email: String!) {
      workspaceMembers(filter: { userEmail: { eq: $email } }, first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }`,
    { email: normalizedEmail },
  );

  if (existingMemberResult.workspaceMembers.edges.length > 0) {
    throw new Error('A user with this email is already in the workspace');
  }

  const workspace = await ensurePublicInviteEnabled();

  await postMetadataGraphql(
    `mutation SignUpInWorkspace(
      $email: String!
      $password: String!
      $workspaceInviteHash: String
      $workspaceId: UUID
    ) {
      signUpInWorkspace(
        email: $email
        password: $password
        workspaceInviteHash: $workspaceInviteHash
        workspaceId: $workspaceId
      ) {
        loginToken {
          token
        }
        workspace {
          id
        }
      }
    }`,
    {
      email: normalizedEmail,
      password: payload.password,
      workspaceInviteHash: workspace.inviteHash,
      workspaceId: workspace.id,
    },
  );

  const membersResult = await postCoreGraphql<{
    workspaceMembers: {
      edges: {
        node: {
          id: string;
          userEmail: string;
        };
      }[];
    };
  }>(
    `query FindMember($email: String!) {
      workspaceMembers(
        filter: { userEmail: { eq: $email } }
        first: 1
      ) {
        edges {
          node {
            id
            userEmail
          }
        }
      }
    }`,
    { email: normalizedEmail },
  );

  const workspaceMember = membersResult.workspaceMembers.edges[0]?.node;

  if (!workspaceMember) {
    throw new Error('User was created but workspace member was not found');
  }

  await postMetadataGraphql(
    `mutation UpdateMemberRole($workspaceMemberId: UUID!, $roleId: UUID!) {
      updateWorkspaceMemberRole(
        workspaceMemberId: $workspaceMemberId
        roleId: $roleId
      ) {
        id
      }
    }`,
    {
      workspaceMemberId: workspaceMember.id,
      roleId: payload.roleId,
    },
  );

  await postMetadataGraphql(
    `mutation UpdateMemberProfile(
      $workspaceMemberId: UUID!
      $firstName: String!
      $lastName: String!
    ) {
      updateWorkspaceMemberSettings(
        input: {
          workspaceMemberId: $workspaceMemberId
          update: { name: { firstName: $firstName, lastName: $lastName } }
        }
      )
    }`,
    {
      workspaceMemberId: workspaceMember.id,
      firstName: payload.firstName.trim() || 'User',
      lastName: payload.lastName.trim(),
    },
  );

  const { syncMemberDistributionQueueEntry } = await import(
    'src/utils/distribution-queue-sync.util'
  );

  await syncMemberDistributionQueueEntry({
    workspaceMemberId: workspaceMember.id,
    roleId: payload.roleId,
    memberName:
      `${payload.firstName.trim() || 'User'} ${payload.lastName.trim()}`.trim(),
  });

  return {
    workspaceMemberId: workspaceMember.id,
    email: normalizedEmail,
  };
};

export const changeBaitkPassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  if (!isValidPassword(newPassword)) {
    throw new Error('Password must be 8–50 characters');
  }

  await postMetadataGraphql(
    `mutation UpdatePasswordWithCurrentPassword(
      $currentPassword: String!
      $newPassword: String!
    ) {
      updatePasswordWithCurrentPassword(
        currentPassword: $currentPassword
        newPassword: $newPassword
      ) {
        success
      }
    }`,
    { currentPassword, newPassword },
  );
};

export const setBaitkUserPassword = async ({
  workspaceMemberId,
  newPassword,
}: {
  workspaceMemberId: string;
  newPassword: string;
}): Promise<void> => {
  if (!isValidPassword(newPassword)) {
    throw new Error('Password must be 8–50 characters');
  }

  await postMetadataGraphql(
    `mutation UpdateWorkspaceMemberPassword(
      $workspaceMemberId: String!
      $newPassword: String!
    ) {
      updateWorkspaceMemberPassword(
        workspaceMemberId: $workspaceMemberId
        newPassword: $newPassword
      ) {
        success
      }
    }`,
    { workspaceMemberId, newPassword },
  );
};
