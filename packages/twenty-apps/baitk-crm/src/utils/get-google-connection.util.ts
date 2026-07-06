import {
  AppConnectionAuthFailedError,
  getConnection,
  listConnections,
  type AppConnection,
} from 'twenty-sdk/logic-function';

export const getGoogleConnection = async (
  connectionId?: string | null,
): Promise<AppConnection | null> => {
  if (connectionId) {
    try {
      return await getConnection(connectionId);
    } catch (error) {
      if (error instanceof AppConnectionAuthFailedError) {
        return null;
      }

      throw error;
    }
  }

  const connections = await listConnections({ providerName: 'google' });

  return (
    connections.find((connection) => connection.visibility === 'workspace') ??
    connections[0] ??
    null
  );
};

export const GOOGLE_NOT_CONNECTED_MESSAGE =
  'Google is not connected. Click Connect Google below to sign in.';
