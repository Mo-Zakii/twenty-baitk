type GoogleApiErrorBody = {
  error?: {
    message?: string;
  };
};

const parseGoogleApiError = async (response: Response): Promise<string> => {
  const text = await response.text().catch(() => '');

  try {
    const body = JSON.parse(text) as GoogleApiErrorBody;

    if (body.error?.message) {
      return body.error.message;
    }
  } catch {
    // fall through
  }

  return text.slice(0, 200) || `HTTP ${response.status}`;
};

export const callGoogleApi = async <TData>({
  accessToken,
  url,
}: {
  accessToken: string;
  url: string;
}): Promise<{ data?: TData; error?: string }> => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return { error: await parseGoogleApiError(response) };
  }

  const data = (await response.json()) as TData;

  return { data };
};

export type GoogleSpreadsheetSummary = {
  id: string;
  name: string;
};

export type GoogleSheetTabSummary = {
  title: string;
  index: number;
};

export const listGoogleSpreadsheets = async (
  accessToken: string,
): Promise<{ spreadsheets: GoogleSpreadsheetSummary[]; error?: string }> => {
  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=100&orderBy=modifiedTime desc`;

  const result = await callGoogleApi<{
    files?: GoogleSpreadsheetSummary[];
  }>({ accessToken, url });

  if (result.error) {
    return { spreadsheets: [], error: result.error };
  }

  return { spreadsheets: result.data?.files ?? [] };
};

export const listGoogleSheetTabs = async ({
  accessToken,
  spreadsheetId,
}: {
  accessToken: string;
  spreadsheetId: string;
}): Promise<{ tabs: GoogleSheetTabSummary[]; error?: string }> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties(title,index)`;

  const result = await callGoogleApi<{
    sheets?: { properties?: GoogleSheetTabSummary }[];
  }>({ accessToken, url });

  if (result.error) {
    return { tabs: [], error: result.error };
  }

  const tabs =
    result.data?.sheets
      ?.map((sheet) => sheet.properties)
      .filter(
        (properties): properties is GoogleSheetTabSummary =>
          properties !== undefined && properties !== null,
      ) ?? [];

  return { tabs };
};

const escapeSheetTabName = (tabName: string): string =>
  `'${tabName.replace(/'/g, "''")}'`;

export const fetchGoogleSheetValues = async ({
  accessToken,
  spreadsheetId,
  tabName,
}: {
  accessToken: string;
  spreadsheetId: string;
  tabName: string;
}): Promise<{ values: string[][]; error?: string }> => {
  const range = `${escapeSheetTabName(tabName)}!A1:ZZ`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE`;

  const result = await callGoogleApi<{ values?: string[][] }>({
    accessToken,
    url,
  });

  if (result.error) {
    return { values: [], error: result.error };
  }

  return { values: result.data?.values ?? [] };
};

export const normalizeSheetCellValues = (row: unknown[]): string[] =>
  row.map((cell) => {
    if (cell === null || cell === undefined) {
      return '';
    }

    return String(cell);
  });

export const buildFieldsFromHeaderRow = ({
  headerRow,
  dataRow,
}: {
  headerRow: string[];
  dataRow: string[];
}): Record<string, string> => {
  const fields: Record<string, string> = {};

  for (
    let columnIndex = 0;
    columnIndex < Math.max(headerRow.length, dataRow.length);
    columnIndex++
  ) {
    const headerName = headerRow[columnIndex]?.trim();

    if (!headerName) {
      continue;
    }

    fields[headerName] = dataRow[columnIndex] ?? '';
  }

  return fields;
};
