import { defineApplication } from 'twenty-sdk/define';
import { APPLICATION_ID, ROLE_IDS } from 'src/constants/uuids';

export default defineApplication({
  universalIdentifier: APPLICATION_ID,
  displayName: 'BAITK CRM',
  description:
    'Real estate brokerage CRM — leads, round-robin distribution, pipeline, dashboards, and reports',
  defaultRoleUniversalIdentifier: ROLE_IDS.function,
  serverVariables: {
    GOOGLE_CLIENT_ID: {
      description:
        'Google OAuth client ID for Connect Google Sheet (Google Cloud Console).',
      isSecret: false,
      isRequired: false,
    },
    GOOGLE_CLIENT_SECRET: {
      description:
        'Google OAuth client secret. Required for Google Sheets sync.',
      isSecret: true,
      isRequired: false,
    },
  },
});
