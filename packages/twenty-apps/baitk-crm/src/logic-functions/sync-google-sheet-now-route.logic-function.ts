import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';
import { SYNC_GOOGLE_SHEET_NOW_ROUTE_ID } from 'src/constants/uuids';
import { syncGoogleSheetNowHandler } from 'src/logic-functions/handlers/sync-google-sheet-now-handler';

type SyncRequestBody = {
  integrationId?: string;
  resetCursor?: boolean;
};

const parseBody = (body: unknown): SyncRequestBody => {
  if (!body || typeof body !== 'object') {
    return {};
  }

  return body as SyncRequestBody;
};

const handler = async (event: RoutePayload) => {
  const body = parseBody(event.body);

  return syncGoogleSheetNowHandler({
    integrationId: body.integrationId,
    resetCursor: body.resetCursor,
  });
};

export default defineLogicFunction({
  universalIdentifier: SYNC_GOOGLE_SHEET_NOW_ROUTE_ID,
  name: 'sync-google-sheet-now-route',
  description: 'Import leads from a connected Google Sheet integration',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/google/sync-now',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
