import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  loadGoogleSheetIntegrations,
  markGoogleSheetSyncError,
  syncGoogleSheetIntegrationUntilCaughtUp,
} from 'src/utils/google-sheets-sync.util';

type HandlerResult =
  | {
      success: true;
      processedCount: number;
      createdCount: number;
      duplicateCount: number;
      skippedCount: number;
      lastProcessedRow: number;
      message: string;
    }
  | { success: false; error: string };

export const syncGoogleSheetNowHandler = async ({
  integrationId,
  resetCursor,
}: {
  integrationId?: string;
  resetCursor?: boolean;
}): Promise<HandlerResult> => {
  if (!integrationId?.trim()) {
    return { success: false, error: 'integrationId is required' };
  }

  const client = new CoreApiClient();
  const integrations = await loadGoogleSheetIntegrations(
    client,
    integrationId.trim(),
  );
  const integration = integrations[0];

  if (!integration) {
    return { success: false, error: 'Integration not found' };
  }

  const syncResult = await syncGoogleSheetIntegrationUntilCaughtUp({
    client,
    integration,
    resetCursor: resetCursor === true,
    batchSize: resetCursor ? 100 : 50,
    maxBatches: resetCursor ? 100 : 10,
  });

  if (!syncResult.success && syncResult.error) {
    await markGoogleSheetSyncError({
      client,
      integrationId: integration.id,
      errorMessage: syncResult.error,
    });

    return { success: false, error: syncResult.error };
  }

  return {
    success: true,
    processedCount: syncResult.processedCount,
    createdCount: syncResult.createdCount,
    duplicateCount: syncResult.duplicateCount,
    skippedCount: syncResult.skippedCount,
    lastProcessedRow: syncResult.lastProcessedRow,
    message: syncResult.message,
  };
};
