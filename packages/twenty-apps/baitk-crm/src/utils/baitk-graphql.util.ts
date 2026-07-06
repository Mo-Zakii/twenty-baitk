type GraphqlResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

const getApiUrl = (): string => {
  const apiUrl = process.env.TWENTY_API_URL;

  if (!apiUrl) {
    throw new Error('TWENTY_API_URL is not set');
  }

  return apiUrl.replace(/\/$/, '');
};

const getAccessToken = (): string => {
  const accessToken =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!accessToken) {
    throw new Error(
      'TWENTY_APP_ACCESS_TOKEN or TWENTY_API_KEY is not set',
    );
  }

  return accessToken;
};

const postGraphql = async <TData>(
  endpoint: 'graphql' | 'metadata',
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => {
  const response = await fetch(`${getApiUrl()}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: HTTP ${response.status}`);
  }

  const body = (await response.json()) as GraphqlResponse<TData>;

  if (body.errors && body.errors.length > 0) {
    const message = body.errors.map((error) => error.message).join(', ');

    if (message.includes('Row level permission predicate feature is disabled')) {
      throw new Error(
        `${message}. Add ENTERPRISE_VALIDITY_TOKEN to packages/twenty-server/.env (see .env.test), restart twenty-server, then run yarn rls:configure again.`,
      );
    }

    throw new Error(message);
  }

  if (!body.data) {
    throw new Error('GraphQL response contained no data');
  }

  return body.data;
};

export const postCoreGraphql = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => postGraphql<TData>('graphql', query, variables);

export const postMetadataGraphql = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => postGraphql<TData>('metadata', query, variables);
