import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { POLL_GOOGLE_SHEETS_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import {
  loadGoogleSheetIntegrations,
  markGoogleSheetSyncError,
  syncGoogleSheetIntegrationUntilCaughtUp,
} from 'src/utils/google-sheets-sync.util';

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();
  const integrations = await loadGoogleSheetIntegrations(client);

  for (const integration of integrations) {
    const syncResult = await syncGoogleSheetIntegrationUntilCaughtUp({
      client,
      integration,
    });

    if (!syncResult.success && syncResult.error) {
      await markGoogleSheetSyncError({
        client,
        integrationId: integration.id,
        errorMessage: syncResult.error,
      });
    }
  }
};

export default defineLogicFunction({
  universalIdentifier: POLL_GOOGLE_SHEETS_LOGIC_FUNCTION_ID,
  name: 'poll-google-sheets',
  description:
    'Poll connected Google Sheets integrations and import new lead rows',
  timeoutSeconds: 120,
  cronTriggerSettings: {
    pattern: '*/1 * * * *',
  },
  handler,
});
