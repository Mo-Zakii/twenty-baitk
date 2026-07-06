import { IntegrationType } from 'src/objects/integration.object';

export type IntegrationSetupStep = {
  title: string;
  description: string;
};

export const extractGoogleSheetIdFromUrl = (value: string): string | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const spreadsheetMatch = trimmedValue.match(
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
  );

  if (spreadsheetMatch?.[1]) {
    return spreadsheetMatch[1];
  }

  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  return null;
};

export const buildGoogleSheetEditUrl = (sheetId: string): string =>
  `https://docs.google.com/spreadsheets/d/${sheetId.trim()}/edit`;

export const isSheetBasedIntegrationType = (
  integrationType: IntegrationType,
): boolean =>
  integrationType === IntegrationType.GOOGLE_SHEETS ||
  integrationType === IntegrationType.META_LEADS;

export const SAAS_CLIENT_SETUP_STEPS: IntegrationSetupStep[] = [
  {
    title: 'Connect Google',
    description:
      'On the Integrations page, click Connect Google and sign in with the account that owns your lead sheet.',
  },
  {
    title: 'Create integration + map columns',
    description:
      'Choose Meta / Facebook Leads for the standard Meta sheet layout, or map columns manually.',
  },
  {
    title: 'Choose sheet + import',
    description:
      'Load spreadsheets, pick tab, Save, then Import all rows now. New rows sync every minute automatically.',
  },
];

export const SAAS_OPERATOR_NOTES = [
  'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in BAITK app settings (Google Cloud OAuth).',
  'Add redirect URI from Twenty app settings to Google Cloud Console.',
  'Enable Google Sheets API + Google Drive API on the OAuth project.',
  'Clients never use ngrok or Apps Script when Google sync is configured.',
];
