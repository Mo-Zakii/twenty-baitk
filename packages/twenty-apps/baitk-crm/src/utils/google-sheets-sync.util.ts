import { CoreApiClient } from 'twenty-client-sdk/core';
import { IntegrationType } from 'src/objects/integration.object';
import {
  buildFieldsFromHeaderRow,
  fetchGoogleSheetValues,
  normalizeSheetCellValues,
} from 'src/utils/google-sheets-api.util';
import { getGoogleConnection } from 'src/utils/get-google-connection.util';
import { importMappedLead } from 'src/utils/import-mapped-lead.util';
import {
  applyColumnMapping,
  getMaxMappedColumnCount,
  parseColumnMapping,
} from 'src/utils/integration-mapping.util';

export type GoogleSheetIntegrationRecord = {
  id: string;
  name: string;
  integrationType: string | null;
  sheetId: string | null;
  sheetTabName: string | null;
  googleConnectionId: string | null;
  columnMapping: unknown;
  customSourceLabel: string | null;
  lastProcessedRow: number | null;
  isActive: boolean;
};

export type GoogleSheetSyncResult = {
  success: boolean;
  processedCount: number;
  createdCount: number;
  duplicateCount: number;
  skippedCount: number;
  lastProcessedRow: number;
  message: string;
  error?: string;
};

const MAX_ROWS_PER_SYNC = 50;
const MAX_SYNC_BATCHES = 20;

const defaultSourceForType = (
  integrationType: string | null,
  customSourceLabel: string | null,
): string | undefined => {
  if (customSourceLabel?.trim()) {
    return customSourceLabel.trim();
  }

  switch (integrationType) {
    case IntegrationType.GOOGLE_SHEETS:
      return 'Google Sheets';
    case IntegrationType.META_LEADS:
      return 'Meta Leads';
    default:
      return undefined;
  }
};

const padRowToColumnCount = (row: string[], columnCount: number): string[] => {
  const paddedRow = [...row];

  while (paddedRow.length < columnCount) {
    paddedRow.push('');
  }

  return paddedRow;
};

export const syncGoogleSheetIntegration = async ({
  client,
  integration,
  resetCursor = false,
  maxRowsToProcess = MAX_ROWS_PER_SYNC,
}: {
  client: CoreApiClient;
  integration: GoogleSheetIntegrationRecord;
  resetCursor?: boolean;
  maxRowsToProcess?: number;
}): Promise<GoogleSheetSyncResult> => {
  if (!integration.isActive) {
    return {
      success: false,
      processedCount: 0,
      createdCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      lastProcessedRow: integration.lastProcessedRow ?? 1,
      message: 'Integration is inactive',
      error: 'Integration is inactive',
    };
  }

  if (!integration.sheetId?.trim()) {
    return {
      success: false,
      processedCount: 0,
      createdCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      lastProcessedRow: integration.lastProcessedRow ?? 1,
      message: 'No Google Sheet selected',
      error: 'No Google Sheet selected',
    };
  }

  const tabName = integration.sheetTabName?.trim();

  if (!tabName) {
    return {
      success: false,
      processedCount: 0,
      createdCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      lastProcessedRow: integration.lastProcessedRow ?? 1,
      message: 'No sheet tab selected',
      error: 'No sheet tab selected',
    };
  }

  const connection = await getGoogleConnection(integration.googleConnectionId);

  if (!connection) {
    return {
      success: false,
      processedCount: 0,
      createdCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      lastProcessedRow: integration.lastProcessedRow ?? 1,
      message: 'Google is not connected',
      error: 'Google is not connected',
    };
  }

  const sheetValuesResult = await fetchGoogleSheetValues({
    accessToken: connection.accessToken,
    spreadsheetId: integration.sheetId.trim(),
    tabName,
  });

  if (sheetValuesResult.error) {
    return {
      success: false,
      processedCount: 0,
      createdCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      lastProcessedRow: integration.lastProcessedRow ?? 1,
      message: 'Failed to read Google Sheet',
      error: sheetValuesResult.error,
    };
  }

  const values = sheetValuesResult.values.map(normalizeSheetCellValues);

  if (values.length < 2) {
    const lastProcessedRow = resetCursor ? 1 : (integration.lastProcessedRow ?? 1);

    return {
      success: true,
      processedCount: 0,
      createdCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      lastProcessedRow,
      message: 'Sheet has no data rows yet',
    };
  }

  const mapping = parseColumnMapping(integration.columnMapping);
  const minimumColumnCount = getMaxMappedColumnCount(mapping);
  const headerRow = values[0] ?? [];
  const defaultSource = defaultSourceForType(
    integration.integrationType,
    integration.customSourceLabel,
  );

  let lastProcessedRow = resetCursor ? 1 : (integration.lastProcessedRow ?? 1);
  let processedCount = 0;
  let createdCount = 0;
  let duplicateCount = 0;
  let skippedCount = 0;

  for (
    let sheetRowNumber = lastProcessedRow + 1;
    sheetRowNumber <= values.length;
    sheetRowNumber++
  ) {
    const rawRow = values[sheetRowNumber - 1] ?? [];
    const row = padRowToColumnCount(rawRow, minimumColumnCount);
    const fields = buildFieldsFromHeaderRow({
      headerRow,
      dataRow: row,
    });
    const mappedLead = applyColumnMapping({
      mapping,
      row,
      fields,
      defaultSource,
    });

    if (!mappedLead) {
      skippedCount++;
      lastProcessedRow = sheetRowNumber;
      continue;
    }

    const importResult = await importMappedLead(client, mappedLead);

    if (importResult.status === 'created') {
      createdCount++;
    } else if (importResult.status === 'duplicate') {
      duplicateCount++;
    } else {
      skippedCount++;
    }

    processedCount++;
    lastProcessedRow = sheetRowNumber;

    if (maxRowsToProcess > 0 && processedCount >= maxRowsToProcess) {
      break;
    }
  }

  await client.mutation({
    updateBaitkIntegration: {
      __args: {
        id: integration.id,
        data: {
          lastProcessedRow,
          lastSyncAt: new Date().toISOString(),
          lastSyncError: null,
          googleConnectionId: connection.id,
        },
      },
      id: true,
    },
  } as never);

  return {
    success: true,
    processedCount,
    createdCount,
    duplicateCount,
    skippedCount,
    lastProcessedRow,
    message:
      createdCount > 0
        ? `Imported ${createdCount} lead(s)`
        : processedCount > 0
          ? 'Sync completed (no new leads)'
          : 'Already up to date',
  };
};

export const syncGoogleSheetIntegrationUntilCaughtUp = async ({
  client,
  integration,
  resetCursor = false,
  batchSize = MAX_ROWS_PER_SYNC,
  maxBatches = MAX_SYNC_BATCHES,
}: {
  client: CoreApiClient;
  integration: GoogleSheetIntegrationRecord;
  resetCursor?: boolean;
  batchSize?: number;
  maxBatches?: number;
}): Promise<GoogleSheetSyncResult> => {
  let currentIntegration = integration;
  let processedCount = 0;
  let createdCount = 0;
  let duplicateCount = 0;
  let skippedCount = 0;
  let lastResult: GoogleSheetSyncResult | null = null;

  for (let batchIndex = 0; batchIndex < maxBatches; batchIndex++) {
    const syncResult = await syncGoogleSheetIntegration({
      client,
      integration: currentIntegration,
      resetCursor: batchIndex === 0 && resetCursor,
      maxRowsToProcess: batchSize,
    });

    lastResult = syncResult;

    if (!syncResult.success) {
      return syncResult;
    }

    processedCount += syncResult.processedCount;
    createdCount += syncResult.createdCount;
    duplicateCount += syncResult.duplicateCount;
    skippedCount += syncResult.skippedCount;

    if (syncResult.processedCount === 0) {
      break;
    }

    currentIntegration = {
      ...currentIntegration,
      lastProcessedRow: syncResult.lastProcessedRow,
    };
  }

  if (!lastResult) {
    return {
      success: false,
      processedCount: 0,
      createdCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      lastProcessedRow: integration.lastProcessedRow ?? 1,
      message: 'Sync did not run',
      error: 'Sync did not run',
    };
  }

  return {
    success: true,
    processedCount,
    createdCount,
    duplicateCount,
    skippedCount,
    lastProcessedRow: lastResult.lastProcessedRow,
    message:
      createdCount > 0
        ? `Imported ${createdCount} lead(s)`
        : processedCount > 0
          ? 'Sync completed (no new leads)'
          : 'Already up to date',
  };
};

export const loadGoogleSheetIntegrations = async (
  client: CoreApiClient,
  integrationId?: string,
): Promise<GoogleSheetIntegrationRecord[]> => {
  const filter = integrationId
    ? { id: { eq: integrationId } }
    : {
        and: [
          { isActive: { eq: true } },
          { sheetId: { is: 'NOT_NULL' } },
          { sheetTabName: { is: 'NOT_NULL' } },
        ],
      };

  const result = (await client.query({
    baitkIntegrations: {
      __args: {
        filter,
        first: 50,
      },
      edges: {
        node: {
          id: true,
          name: true,
          integrationType: true,
          sheetId: true,
          sheetTabName: true,
          googleConnectionId: true,
          columnMapping: true,
          customSourceLabel: true,
          lastProcessedRow: true,
          isActive: true,
        },
      },
    },
  } as never)) as {
    baitkIntegrations: {
      edges: { node: GoogleSheetIntegrationRecord }[];
    };
  };

  return result.baitkIntegrations.edges.map((edge) => edge.node);
};

export const markGoogleSheetSyncError = async ({
  client,
  integrationId,
  errorMessage,
}: {
  client: CoreApiClient;
  integrationId: string;
  errorMessage: string;
}): Promise<void> => {
  await client.mutation({
    updateBaitkIntegration: {
      __args: {
        id: integrationId,
        data: {
          lastSyncAt: new Date().toISOString(),
          lastSyncError: errorMessage.slice(0, 500),
        },
      },
      id: true,
    },
  } as never);
};
