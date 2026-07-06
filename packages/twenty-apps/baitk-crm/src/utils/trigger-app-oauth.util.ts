type TriggerAppOAuthParams = {
  applicationId: string;
  providerName: string;
  visibility: 'user' | 'workspace';
  reconnectingConnectedAccountId?: string;
  redirectLocation?: string;
};

type FrontComponentHostApi = {
  triggerAppOAuth?: (params: TriggerAppOAuthParams) => Promise<void>;
};

// Uses the Twenty host API at runtime — no twenty-sdk export required at build time.
export const triggerAppOAuthFromHost = async (
  params: TriggerAppOAuthParams,
): Promise<void> => {
  const hostApi = (
    globalThis as typeof globalThis & {
      frontComponentHostCommunicationApi?: FrontComponentHostApi;
    }
  ).frontComponentHostCommunicationApi;

  const triggerAppOAuth = hostApi?.triggerAppOAuth;

  if (!triggerAppOAuth) {
    throw new Error(
      'Google sign-in is not available yet. Restart Twenty (frontend) and hard-refresh this page.',
    );
  }

  await triggerAppOAuth(params);
};
