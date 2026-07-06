import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';
import { LIST_GOOGLE_SHEET_TABS_ROUTE_ID } from 'src/constants/uuids';
import { listGoogleSheetTabsHandler } from 'src/logic-functions/handlers/list-google-sheet-tabs-handler';

const handler = async (event: RoutePayload) => {
  return listGoogleSheetTabsHandler({
    spreadsheetId: event.queryStringParameters?.spreadsheetId,
    connectionId: event.queryStringParameters?.connectionId,
  });
};

export default defineLogicFunction({
  universalIdentifier: LIST_GOOGLE_SHEET_TABS_ROUTE_ID,
  name: 'list-google-sheet-tabs-route',
  description: 'List tabs in a Google spreadsheet',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/google/sheet-tabs',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
