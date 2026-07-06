import {
  GOOGLE_NOT_CONNECTED_MESSAGE,
  getGoogleConnection,
} from 'src/utils/get-google-connection.util';
import {
  fetchGoogleSheetValues,
  normalizeSheetCellValues,
} from 'src/utils/google-sheets-api.util';
import { indexToColumnKey } from 'src/utils/integration-mapping.util';

type HandlerResult =
  | {
      success: true;
      columns: { column: string; header: string }[];
      sampleRow: string[];
    }
  | { success: false; error: string };

export const previewGoogleSheetHandler = async ({
  spreadsheetId,
  tabName,
  connectionId,
}: {
  spreadsheetId?: string;
  tabName?: string;
  connectionId?: string;
}): Promise<HandlerResult> => {
  if (!spreadsheetId?.trim()) {
    return { success: false, error: 'spreadsheetId is required' };
  }

  if (!tabName?.trim()) {
    return { success: false, error: 'tabName is required' };
  }

  const connection = await getGoogleConnection(connectionId);

  if (!connection) {
    return { success: false, error: GOOGLE_NOT_CONNECTED_MESSAGE };
  }

  const sheetValuesResult = await fetchGoogleSheetValues({
    accessToken: connection.accessToken,
    spreadsheetId: spreadsheetId.trim(),
    tabName: tabName.trim(),
  });

  if (sheetValuesResult.error) {
    return { success: false, error: sheetValuesResult.error };
  }

  const values = sheetValuesResult.values.map(normalizeSheetCellValues);
  const headerRow = values[0] ?? [];
  const sampleRow = values[1] ?? [];
  const columns = headerRow.map((header, columnIndex) => ({
    column: indexToColumnKey(columnIndex),
    header: header || `(column ${indexToColumnKey(columnIndex)})`,
  }));

  return {
    success: true,
    columns,
    sampleRow,
  };
};
