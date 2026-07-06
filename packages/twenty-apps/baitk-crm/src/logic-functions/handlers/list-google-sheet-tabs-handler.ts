import {
  GOOGLE_NOT_CONNECTED_MESSAGE,
  getGoogleConnection,
} from 'src/utils/get-google-connection.util';
import { listGoogleSheetTabs } from 'src/utils/google-sheets-api.util';

type HandlerResult =
  | { success: true; tabs: { title: string; index: number }[] }
  | { success: false; error: string };

export const listGoogleSheetTabsHandler = async ({
  spreadsheetId,
  connectionId,
}: {
  spreadsheetId?: string;
  connectionId?: string;
}): Promise<HandlerResult> => {
  if (!spreadsheetId?.trim()) {
    return { success: false, error: 'spreadsheetId is required' };
  }

  const connection = await getGoogleConnection(connectionId);

  if (!connection) {
    return { success: false, error: GOOGLE_NOT_CONNECTED_MESSAGE };
  }

  const result = await listGoogleSheetTabs({
    accessToken: connection.accessToken,
    spreadsheetId: spreadsheetId.trim(),
  });

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, tabs: result.tabs };
};
