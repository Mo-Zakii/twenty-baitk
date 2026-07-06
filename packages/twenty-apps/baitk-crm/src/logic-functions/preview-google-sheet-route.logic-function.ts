import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';
import { PREVIEW_GOOGLE_SHEET_ROUTE_ID } from 'src/constants/uuids';
import { previewGoogleSheetHandler } from 'src/logic-functions/handlers/preview-google-sheet-handler';

const handler = async (event: RoutePayload) => {
  return previewGoogleSheetHandler({
    spreadsheetId: event.queryStringParameters?.spreadsheetId,
    tabName: event.queryStringParameters?.tabName,
    connectionId: event.queryStringParameters?.connectionId,
  });
};

export default defineLogicFunction({
  universalIdentifier: PREVIEW_GOOGLE_SHEET_ROUTE_ID,
  name: 'preview-google-sheet-route',
  description: 'Preview Google Sheet headers for column mapping',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/google/sheet-preview',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
