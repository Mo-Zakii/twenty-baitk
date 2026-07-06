import { defineConnectionProvider } from 'twenty-sdk/define';
import { GOOGLE_CONNECTION_PROVIDER_ID } from 'src/constants/uuids';

export default defineConnectionProvider({
  universalIdentifier: GOOGLE_CONNECTION_PROVIDER_ID,
  name: 'google',
  displayName: 'Google',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
    clientIdVariable: 'GOOGLE_CLIENT_ID',
    clientSecretVariable: 'GOOGLE_CLIENT_SECRET',
    authorizationParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
    tokenRequestContentType: 'json',
    usePkce: true,
  },
});
