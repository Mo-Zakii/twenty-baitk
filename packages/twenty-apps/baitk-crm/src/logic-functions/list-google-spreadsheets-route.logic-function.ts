import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';
import { LIST_GOOGLE_SPREADSHEETS_ROUTE_ID } from 'src/constants/uuids';
import { listGoogleSpreadsheetsHandler } from 'src/logic-functions/handlers/list-google-spreadsheets-handler';

const handler = async (event: RoutePayload) => {
  return listGoogleSpreadsheetsHandler({
    connectionId: event.queryStringParameters?.connectionId,
  });
};

export default defineLogicFunction({
  universalIdentifier: LIST_GOOGLE_SPREADSHEETS_ROUTE_ID,
  name: 'list-google-spreadsheets-route',
  description: 'List Google spreadsheets for BAITK sheet sync',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/google/spreadsheets',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
