import {
  GOOGLE_NOT_CONNECTED_MESSAGE,
  getGoogleConnection,
} from 'src/utils/get-google-connection.util';
import { listGoogleSpreadsheets } from 'src/utils/google-sheets-api.util';

type HandlerResult =
  | {
      success: true;
      connectionId: string;
      spreadsheets: { id: string; name: string }[];
    }
  | { success: false; error: string };

export const listGoogleSpreadsheetsHandler = async ({
  connectionId,
}: {
  connectionId?: string;
}): Promise<HandlerResult> => {
  const connection = await getGoogleConnection(connectionId);

  if (!connection) {
    return { success: false, error: GOOGLE_NOT_CONNECTED_MESSAGE };
  }

  const result = await listGoogleSpreadsheets(connection.accessToken);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    connectionId: connection.id,
    spreadsheets: result.spreadsheets,
  };
};
