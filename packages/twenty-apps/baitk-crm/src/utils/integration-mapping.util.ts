import { normalizeInboundPhone } from 'src/utils/normalize-inbound-phone.util';

export type CustomMappingEntry = {
  id: string;
  label: string;
  column: string | null;
};

export type IntegrationColumnMapping = {
  name?: string | null;
  phone?: string | null;
  phoneSecondary?: string | null;
  email?: string | null;
  source?: string | null;
  budget?: string | null;
  compound?: string | null;
  comments?: string | null;
  customMappings?: CustomMappingEntry[];
};

export type MappedLeadPayload = {
  name: string;
  phone: string;
  phoneSecondary?: string;
  email?: string;
  source?: string;
  budget?: string;
  compound?: string;
  comments?: string;
  customFieldValues?: { label: string; value: string }[];
};

export const COLUMN_OPTIONS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export const LEAD_MAPPING_FIELDS: {
  key: keyof Omit<IntegrationColumnMapping, 'customMappings'>;
  label: string;
  required: boolean;
}[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'phone', label: 'Phone', required: true },
  { key: 'phoneSecondary', label: 'Second phone', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'source', label: 'Source', required: false },
  { key: 'budget', label: 'Budget', required: false },
  { key: 'compound', label: 'Compound / Project', required: false },
  { key: 'comments', label: 'Comments', required: false },
];

export const REQUIRED_DEFAULT_COLUMN_MAPPING: IntegrationColumnMapping = {
  name: 'A',
  phone: 'B',
};

export const DEFAULT_COLUMN_MAPPING: IntegrationColumnMapping = {
  ...REQUIRED_DEFAULT_COLUMN_MAPPING,
  customMappings: [],
};

// Standard Meta Lead Ads → Google Sheets export (columns A–P)
export const META_LEAD_ADS_COLUMN_MAPPING: IntegrationColumnMapping = {
  name: 'N',
  phone: 'O',
  source: 'L',
  compound: 'M',
  customMappings: [
    {
      id: 'meta-job-title',
      label: 'Job Title',
      column: 'P',
    },
  ],
};

export type SheetColumnPreview = {
  column: string;
  header: string;
};

const normalizeSheetHeader = (header: string): string =>
  header.trim().toLowerCase().replace(/[\s_-]+/g, ' ');

const SHEET_HEADER_MATCHERS: {
  key: keyof Omit<IntegrationColumnMapping, 'customMappings'>;
  patterns: string[];
}[] = [
  {
    key: 'name',
    patterns: ['full name', 'fullname', 'name', 'lead name', 'contact name'],
  },
  {
    key: 'phone',
    patterns: [
      'phone',
      'phone number',
      'mobile',
      'telephone',
      'whatsapp',
      'phone_number',
    ],
  },
  {
    key: 'phoneSecondary',
    patterns: ['second phone', 'phone 2', 'alternate phone', 'work phone'],
  },
  { key: 'email', patterns: ['email', 'e mail', 'email address'] },
  {
    key: 'source',
    patterns: ['source', 'platform', 'lead source', 'campaign source'],
  },
  { key: 'budget', patterns: ['budget', 'price', 'amount'] },
  {
    key: 'compound',
    patterns: ['compound', 'project', 'company question', 'property'],
  },
  { key: 'comments', patterns: ['comments', 'notes', 'note'] },
];

const headerMatchesPattern = (
  normalizedHeader: string,
  pattern: string,
): boolean =>
  normalizedHeader === pattern ||
  normalizedHeader.includes(pattern) ||
  pattern.includes(normalizedHeader);

export const suggestColumnMappingFromHeaders = (
  columns: SheetColumnPreview[],
): IntegrationColumnMapping => {
  const mapping: IntegrationColumnMapping = { customMappings: [] };
  const usedColumns = new Set<string>();

  for (const matcher of SHEET_HEADER_MATCHERS) {
    for (const column of columns) {
      if (usedColumns.has(column.column)) {
        continue;
      }

      const normalizedHeader = normalizeSheetHeader(column.header);
      const matches = matcher.patterns.some((pattern) =>
        headerMatchesPattern(normalizedHeader, pattern),
      );

      if (matches) {
        mapping[matcher.key] = column.column;
        usedColumns.add(column.column);
        break;
      }
    }
  }

  for (const column of columns) {
    if (usedColumns.has(column.column)) {
      continue;
    }

    const normalizedHeader = normalizeSheetHeader(column.header);

    if (
      normalizedHeader.includes('job title') ||
      normalizedHeader === 'job title'
    ) {
      mapping.customMappings = [
        {
          id: 'suggested-job-title',
          label: 'Job Title',
          column: column.column,
        },
      ];
      break;
    }
  }

  return mapping;
};

const normalizeMappingValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();

  return trimmed.length > 0 ? trimmed : null;
};

export const normalizeColumnMapping = (
  value: unknown,
): IntegrationColumnMapping => {
  const raw =
    value && typeof value === 'object'
      ? (value as IntegrationColumnMapping)
      : {};

  const customMappings = Array.isArray(raw.customMappings)
    ? raw.customMappings
        .map((entry, index) => ({
          id: entry.id?.trim() || `custom-${index}`,
          label: entry.label?.trim() ?? '',
          column: normalizeMappingValue(entry.column),
        }))
        .filter((entry) => entry.label.length > 0 && entry.column)
    : [];

  return {
    name:
      normalizeMappingValue(raw.name) ??
      REQUIRED_DEFAULT_COLUMN_MAPPING.name ??
      null,
    phone:
      normalizeMappingValue(raw.phone) ??
      REQUIRED_DEFAULT_COLUMN_MAPPING.phone ??
      null,
    phoneSecondary: normalizeMappingValue(raw.phoneSecondary),
    email: normalizeMappingValue(raw.email),
    source: normalizeMappingValue(raw.source),
    budget: normalizeMappingValue(raw.budget),
    compound: normalizeMappingValue(raw.compound),
    comments: normalizeMappingValue(raw.comments),
    customMappings,
  };
};

export const parseColumnMapping = normalizeColumnMapping;

export const columnKeyToIndex = (columnKey: string): number => {
  const normalized = columnKey.trim();

  if (/^\d+$/.test(normalized)) {
    return parseInt(normalized, 10);
  }

  const letters = normalized.toUpperCase();
  let index = 0;

  for (const character of letters) {
    index = index * 26 + (character.charCodeAt(0) - 64);
  }

  return index - 1;
};

export const indexToColumnKey = (index: number): string => {
  let columnIndex = index + 1;
  let columnKey = '';

  while (columnIndex > 0) {
    const remainder = (columnIndex - 1) % 26;
    columnKey = String.fromCharCode(65 + remainder) + columnKey;
    columnIndex = Math.floor((columnIndex - 1) / 26);
  }

  return columnKey;
};

const readMappedValue = (
  mappingKey: string | null | undefined,
  row: string[],
  fields?: Record<string, string>,
): string | undefined => {
  if (!mappingKey?.trim()) {
    return undefined;
  }

  const trimmedKey = mappingKey.trim();

  if (fields) {
    if (trimmedKey in fields) {
      const fieldValue = fields[trimmedKey]?.trim();

      if (fieldValue) {
        return fieldValue;
      }
    }

    const upperFieldValue = fields[trimmedKey.toUpperCase()]?.trim();

    if (upperFieldValue) {
      return upperFieldValue;
    }
  }

  const index = columnKeyToIndex(trimmedKey);
  const cellValue = row[index]?.trim();

  return cellValue || undefined;
};

export const applyColumnMapping = ({
  mapping,
  row,
  fields,
  defaultSource,
}: {
  mapping: IntegrationColumnMapping;
  row: string[];
  fields?: Record<string, string>;
  defaultSource?: string;
}): MappedLeadPayload | null => {
  const normalizedMapping = normalizeColumnMapping(mapping);
  const name = readMappedValue(normalizedMapping.name, row, fields);
  const phone = normalizeInboundPhone(
    readMappedValue(normalizedMapping.phone, row, fields),
  );

  if (!name || !phone) {
    return null;
  }

  const customFieldValues = (normalizedMapping.customMappings ?? [])
    .map((entry) => {
      const value = readMappedValue(entry.column, row, fields);

      if (!value) {
        return null;
      }

      return { label: entry.label, value };
    })
    .filter(
      (entry): entry is { label: string; value: string } => entry !== null,
    );

  return {
    name,
    phone,
    phoneSecondary: normalizeInboundPhone(
      readMappedValue(normalizedMapping.phoneSecondary, row, fields),
    ),
    email: readMappedValue(normalizedMapping.email, row, fields),
    source:
      readMappedValue(normalizedMapping.source, row, fields) ??
      defaultSource ??
      undefined,
    budget: readMappedValue(normalizedMapping.budget, row, fields),
    compound: readMappedValue(normalizedMapping.compound, row, fields),
    comments: readMappedValue(normalizedMapping.comments, row, fields),
    customFieldValues:
      customFieldValues.length > 0 ? customFieldValues : undefined,
  };
};

export const getMaxMappedColumnCount = (
  mapping: IntegrationColumnMapping,
): number => {
  const normalizedMapping = normalizeColumnMapping(mapping);
  const mappedColumns = [
    normalizedMapping.name,
    normalizedMapping.phone,
    normalizedMapping.phoneSecondary,
    normalizedMapping.email,
    normalizedMapping.source,
    normalizedMapping.budget,
    normalizedMapping.compound,
    normalizedMapping.comments,
    ...(normalizedMapping.customMappings ?? []).map((entry) => entry.column),
  ].filter((column): column is string => Boolean(column?.trim()));

  if (mappedColumns.length === 0) {
    return 2;
  }

  const maxColumnIndex = mappedColumns.reduce(
    (maximum, column) => Math.max(maximum, columnKeyToIndex(column)),
    0,
  );

  return maxColumnIndex + 1;
};

const collectMappedColumnLetters = (
  mapping: IntegrationColumnMapping,
): string[] => {
  const normalizedMapping = normalizeColumnMapping(mapping);
  const columns = new Set<string>();

  for (const field of LEAD_MAPPING_FIELDS) {
    const column = normalizedMapping[field.key];

    if (column) {
      columns.add(column.trim().toUpperCase());
    }
  }

  for (const entry of normalizedMapping.customMappings ?? []) {
    if (entry.column) {
      columns.add(entry.column.trim().toUpperCase());
    }
  }

  return Array.from(columns);
};

export const describeMappingFailure = ({
  mapping,
  row,
  fields,
}: {
  mapping: IntegrationColumnMapping;
  row: string[];
  fields?: Record<string, string>;
}): string => {
  const normalizedMapping = normalizeColumnMapping(mapping);
  const nameColumn = normalizedMapping.name ?? '(not set — defaults to A)';
  const phoneColumn = normalizedMapping.phone ?? '(not set — defaults to B)';
  const nameRaw = readMappedValue(normalizedMapping.name, row, fields);
  const phoneRaw = readMappedValue(normalizedMapping.phone, row, fields);
  const nameFromFields =
    normalizedMapping.name && fields
      ? fields[normalizedMapping.name.trim()]?.trim()
      : undefined;
  const phoneFromFields =
    normalizedMapping.phone && fields
      ? fields[normalizedMapping.phone.trim()]?.trim()
      : undefined;
  const requiredColumnCount = getMaxMappedColumnCount(normalizedMapping);
  const parts = [
    `Name column ${nameColumn} → "${nameRaw ?? nameFromFields ?? ''}"`,
    `Phone column ${phoneColumn} → "${phoneRaw ?? phoneFromFields ?? ''}"`,
    `Row has ${row.length} value(s), need at least ${requiredColumnCount}`,
  ];

  if (row.length < requiredColumnCount) {
    parts.push(
      'Row is too short — re-copy the Apps Script (v0.1.27+) or check sheet columns match your mapping',
    );
  }

  if (!nameRaw?.trim() && !nameFromFields) {
    parts.push(`Column ${nameColumn} is empty on this row`);
  }

  if (!phoneRaw?.trim() && !phoneFromFields) {
    parts.push(`Column ${phoneColumn} is empty on this row`);
  }

  return parts.join('. ');
};

export const buildLeadCommentText = (
  payload: Pick<MappedLeadPayload, 'comments' | 'customFieldValues'>,
): string | undefined => {
  const lines: string[] = [];

  if (payload.comments?.trim()) {
    lines.push(payload.comments.trim());
  }

  for (const customField of payload.customFieldValues ?? []) {
    lines.push(`${customField.label}: ${customField.value}`);
  }

  return lines.length > 0 ? lines.join('\n') : undefined;
};

export const generateWebhookSecret = (): string => {
  const bytes = new Uint8Array(16);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index++) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const buildGoogleAppsScript = ({
  webhookUrl,
  integrationId,
  secret,
  mapping,
}: {
  webhookUrl: string;
  integrationId: string;
  secret: string;
  mapping: IntegrationColumnMapping;
}): string => {
  const normalizedMapping = normalizeColumnMapping(mapping);
  const nameColumn = normalizedMapping.name ?? 'A';
  const phoneColumn = normalizedMapping.phone ?? 'B';
  const minColumnCount = getMaxMappedColumnCount(normalizedMapping);
  const mappedColumns = collectMappedColumnLetters(normalizedMapping);
  const mappedColumnsJson = JSON.stringify(mappedColumns);

  const mappingComments = LEAD_MAPPING_FIELDS.filter(
    (field) => normalizedMapping[field.key],
  ).map((field) => `// ${field.label} → column ${normalizedMapping[field.key]}`);

  const customMappingComments = (normalizedMapping.customMappings ?? []).map(
    (entry) => `// ${entry.label} → column ${entry.column}`,
  );

  // Avoid multi-line template literals — they break front-component bundling
  // and can swallow adjacent GraphQL query strings in the output bundle.
  return [
    '// Meta -> Google Sheets -> BAITK',
    '// Apps Script runs on Google servers — it CANNOT call localhost.',
    '// Set BAITK_WEBHOOK_URL to your public HTTPS URL (ngrok or production).',
    `const BAITK_WEBHOOK_URL = '${webhookUrl}';`,
    `const BAITK_NAME_COLUMN = '${nameColumn}';`,
    `const BAITK_PHONE_COLUMN = '${phoneColumn}';`,
    `const BAITK_MIN_COLUMN_COUNT = ${minColumnCount};`,
    `const BAITK_MAPPED_COLUMNS = ${mappedColumnsJson};`,
    "// Set to your Meta leads tab name, or leave '' for the spreadsheet's first/active tab.",
    "const BAITK_SHEET_TAB_NAME = '';",
    '// Max rows sent per pollMetaLeadsToBaitk run (avoids Apps Script timeout).',
    'const BAITK_MAX_ROWS_PER_RUN = 20;',
    '',
    'function getLeadSheet() {',
    '  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();',
    "  const tabName = String(BAITK_SHEET_TAB_NAME || '').trim();",
    '',
    '  if (tabName) {',
    '    const sheet = spreadsheet.getSheetByName(tabName);',
    '',
    '    if (!sheet) {',
    "      throw new Error('Sheet tab not found: ' + tabName);",
    '    }',
    '',
    '    return sheet;',
    '  }',
    '',
    '  const sheets = spreadsheet.getSheets();',
    '',
    '  if (sheets.length === 1) {',
    '    return sheets[0];',
    '  }',
    '',
    '  return spreadsheet.getActiveSheet();',
    '}',
    '',
    'function columnLetterToIndex(columnLetter) {',
    '  const letters = String(columnLetter).trim().toUpperCase();',
    '  let index = 0;',
    '',
    '  for (let characterIndex = 0; characterIndex < letters.length; characterIndex++) {',
    '    index = index * 26 + (letters.charCodeAt(characterIndex) - 64);',
    '  }',
    '',
    '  return index - 1;',
    '}',
    '',
    'function columnNumberToLetter(columnNumber) {',
    '  let letter = "";',
    '  let current = columnNumber;',
    '',
    '  while (current > 0) {',
    '    const remainder = (current - 1) % 26;',
    '    letter = String.fromCharCode(65 + remainder) + letter;',
    '    current = Math.floor((current - 1) / 26);',
    '  }',
    '',
    '  return letter;',
    '}',
    '',
    'function getSheetColumnCount(sheet) {',
    '  return Math.max(sheet.getLastColumn(), BAITK_MIN_COLUMN_COUNT);',
    '}',
    '',
    'function getCellValue(sheet, rowIndex, columnLetter) {',
    '  const columnNumber = columnLetterToIndex(columnLetter) + 1;',
    '  const value = sheet.getRange(rowIndex, columnNumber).getValue();',
    '',
    '  return value === null || value === undefined ? "" : String(value);',
    '}',
    '',
    'function getSheetRowValues(sheet, rowIndex) {',
    '  const columnCount = getSheetColumnCount(sheet);',
    '  const endColumn = columnNumberToLetter(columnCount);',
    '  const rangeNotation = "A" + rowIndex + ":" + endColumn + rowIndex;',
    '  const values = sheet.getRange(rangeNotation).getValues();',
    '',
    '  if (!values || values.length === 0 || !values[0]) {',
    '    return [];',
    '  }',
    '',
    '  return values[0].map(function (cell) {',
    "    return cell === null || cell === undefined ? '' : String(cell);",
    '  });',
    '}',
    '',
    'function buildLeadFields(sheet, rowIndex) {',
    '  const fields = {};',
    '',
    '  for (let columnIndex = 0; columnIndex < BAITK_MAPPED_COLUMNS.length; columnIndex++) {',
    '    const columnLetter = BAITK_MAPPED_COLUMNS[columnIndex];',
    '    fields[columnLetter] = getCellValue(sheet, rowIndex, columnLetter);',
    '  }',
    '',
    '  fields.full_name = getCellValue(sheet, rowIndex, BAITK_NAME_COLUMN);',
    '  fields.phone = getCellValue(sheet, rowIndex, BAITK_PHONE_COLUMN);',
    '  fields.phone_number = fields.phone;',
    '',
    '  return fields;',
    '}',
    '',
    'function rowHasRequiredLeadFields(sheet, rowIndex) {',
    '  return Boolean(',
    '    getCellValue(sheet, rowIndex, BAITK_NAME_COLUMN) &&',
    '    getCellValue(sheet, rowIndex, BAITK_PHONE_COLUMN)',
    '  );',
    '}',
    '',
    'function logRowMappingPreview(sheet, rowIndex, rowValues, fields) {',
    "  Logger.log('Row length: ' + rowValues.length);",
    "  Logger.log('Name at ' + BAITK_NAME_COLUMN + ': ' + (fields[BAITK_NAME_COLUMN] || '(empty)'));",
    "  Logger.log('Phone at ' + BAITK_PHONE_COLUMN + ': ' + (fields[BAITK_PHONE_COLUMN] || '(empty)'));",
    '}',
    '',
    'function sendLeadFromSheetRow(sheet, rowIndex) {',
    '  const rowValues = getSheetRowValues(sheet, rowIndex);',
    '  const fields = buildLeadFields(sheet, rowIndex);',
    '',
    '  logRowMappingPreview(sheet, rowIndex, rowValues, fields);',
    '  sendLeadToBaitk({ row: rowValues, fields: fields });',
    '}',
    '',
    'function sendLeadToBaitk(payload) {',
    '  const normalizedPayload = Array.isArray(payload)',
    '    ? { row: payload }',
    '    : payload || {};',
    '',
    '  const nameValue = normalizedPayload.fields',
    '    ? normalizedPayload.fields[BAITK_NAME_COLUMN]',
    '    : undefined;',
    '  const phoneValue = normalizedPayload.fields',
    '    ? normalizedPayload.fields[BAITK_PHONE_COLUMN]',
    '    : undefined;',
    '  const hasRowData =',
    '    normalizedPayload.row && normalizedPayload.row.length > 0;',
    '',
    '  if (!nameValue && !phoneValue && !hasRowData) {',
    "    throw new Error(",
    "      'No lead data to send. Run debugSheetMapping first, then testSendLastRowToBaitk. Do not run sendLeadToBaitk directly.',",
    '    );',
    '  }',
    '',
    '  const requestPayload = {',
    `    integrationId: '${integrationId}',`,
    `    secret: '${secret}',`,
    '    row: normalizedPayload.row || [],',
    '    fields: normalizedPayload.fields || {},',
    '  };',
    '',
    '  const response = UrlFetchApp.fetch(BAITK_WEBHOOK_URL, {',
    "    method: 'post',",
    "    contentType: 'application/json',",
    '    payload: JSON.stringify(requestPayload),',
    '    muteHttpExceptions: true,',
    '  });',
    '',
    '  const statusCode = response.getResponseCode();',
    '  const body = response.getContentText();',
    "  Logger.log('Status: ' + statusCode);",
    '  Logger.log(body);',
    '',
    '  if (statusCode < 200 || statusCode >= 300) {',
    "    throw new Error('BAITK webhook failed (' + statusCode + '): ' + body);",
    '  }',
    '',
    '  try {',
    '    const parsed = JSON.parse(body);',
    '',
    '    if (parsed && parsed.success === false) {',
    '      if (parsed.duplicate === true) {',
    "        Logger.log('Duplicate lead (already in BAITK): ' + (parsed.message || ''));",
    '        return;',
    '      }',
    '',
    "      throw new Error('BAITK rejected lead: ' + (parsed.message || body));",
    '    }',
    '  } catch (parseError) {',
    '    if (parseError instanceof Error && parseError.message.indexOf("BAITK rejected") === 0) {',
    '      throw parseError;',
    '    }',
    '  }',
    '}',
    '',
    '// Google Form linked to this sheet (optional):',
    'function onFormSubmit(event) {',
    '  sendLeadToBaitk({ row: event.values });',
    '}',
    '',
    'function getLastProcessedRowIndex() {',
    '  return parseInt(',
    "    PropertiesService.getScriptProperties().getProperty('BAITK_LAST_ROW') || '1',",
    '    10,',
    '  );',
    '}',
    '',
    'function setLastProcessedRowIndex(rowIndex) {',
    '  PropertiesService.getScriptProperties().setProperty(',
    "    'BAITK_LAST_ROW',",
    '    String(rowIndex),',
    '  );',
    '}',
    '',
    'function processSheetRowsFromCursor(maxRowsToProcess) {',
    '  const sheet = getLeadSheet();',
    '  const lastRow = sheet.getLastRow();',
    '',
    '  if (lastRow < 2) {',
    '    return 0;',
    '  }',
    '',
    '  const lastProcessedRow = getLastProcessedRowIndex();',
    '',
    '  if (lastRow <= lastProcessedRow) {',
    '    return 0;',
    '  }',
    '',
    '  let processedCount = 0;',
    '',
    '  for (let rowIndex = lastProcessedRow + 1; rowIndex <= lastRow; rowIndex++) {',
    '    if (!rowHasRequiredLeadFields(sheet, rowIndex)) {',
    "      Logger.log('Skipping row ' + rowIndex + ' — missing name or phone');",
    '      setLastProcessedRowIndex(rowIndex);',
    '      continue;',
    '    }',
    '',
    '    sendLeadFromSheetRow(sheet, rowIndex);',
    '    setLastProcessedRowIndex(rowIndex);',
    '    processedCount++;',
    '',
    '    if (maxRowsToProcess > 0 && processedCount >= maxRowsToProcess) {',
    "      Logger.log('Processed ' + processedCount + ' row(s) this run; more rows will sync on the next trigger.');",
    '      break;',
    '    }',
    '  }',
    '',
    '  return processedCount;',
    '}',
    '',
    '// Meta Lead Ads -> Google Sheets (recommended):',
    'function pollMetaLeadsToBaitk() {',
    '  processSheetRowsFromCursor(BAITK_MAX_ROWS_PER_RUN);',
    '}',
    '',
    '// Run once manually to import every existing row, then enable pollMetaLeadsToBaitk.',
    'function importAllExistingRowsToBaitk() {',
    '  resetBaitkImportCursor();',
    '  const processedCount = processSheetRowsFromCursor(0);',
    "  Logger.log('Imported ' + processedCount + ' row(s). New Meta leads will sync on pollMetaLeadsToBaitk.');",
    '}',
    '',
    '// Start import from row 2 again (e.g. after skipExistingMetaRows by mistake).',
    'function resetBaitkImportCursor() {',
    "  PropertiesService.getScriptProperties().deleteProperty('BAITK_LAST_ROW');",
    "  Logger.log('Import cursor reset — next import starts from row 2.');",
    '}',
    '',
    '// Only if you want to IGNORE all rows already in the sheet (new leads only):',
    'function skipExistingMetaRows() {',
    '  const sheet = getLeadSheet();',
    '  setLastProcessedRowIndex(sheet.getLastRow());',
    "  Logger.log('Skipped existing rows — only new sheet rows will sync.');",
    '}',
    '',
    'function removeExistingBaitkTriggers() {',
    '  const triggers = ScriptApp.getProjectTriggers();',
    '',
    '  for (let triggerIndex = 0; triggerIndex < triggers.length; triggerIndex++) {',
    '    const handlerName = triggers[triggerIndex].getHandlerFunction();',
    '',
    "    if (handlerName === 'pollMetaLeadsToBaitk' || handlerName === 'onFormSubmit') {",
    '      ScriptApp.deleteTrigger(triggers[triggerIndex]);',
    '    }',
    '  }',
    '}',
    '',
    '// Run this ONCE after pasting the script — imports all rows + enables auto-sync.',
    'function setupBaitkIntegration() {',
    "  if (String(BAITK_WEBHOOK_URL).indexOf('YOUR-PUBLIC-URL') >= 0) {",
    "    throw new Error('BAITK is not configured yet. Ask your BAITK admin to finish server setup.');",
    '  }',
    '',
    '  removeExistingBaitkTriggers();',
    '',
    '  ScriptApp.newTrigger("pollMetaLeadsToBaitk")',
    '    .timeBased()',
    '    .everyMinutes(1)',
    '    .create();',
    '',
    '  importAllExistingRowsToBaitk();',
    '',
    "  Logger.log('BAITK connected. Existing leads imported; new sheet rows sync every minute.');",
    '}',
    '',
    '// Advanced — verify tab + columns (check Executions log).',
    'function debugSheetMapping() {',
    '  const sheet = getLeadSheet();',
    '  const lastRow = sheet.getLastRow();',
    '',
    "  Logger.log('Tab: ' + sheet.getName());",
    "  Logger.log('Last row: ' + lastRow);",
    "  Logger.log('Last column: ' + sheet.getLastColumn());",
    "  Logger.log('Name column: ' + BAITK_NAME_COLUMN);",
    "  Logger.log('Phone column: ' + BAITK_PHONE_COLUMN);",
    '',
    '  if (lastRow < 2) {',
    "    Logger.log('No data rows yet (need header row + at least one lead).');",
    '    return;',
    '  }',
    '',
    '  for (let rowIndex = Math.max(2, lastRow - 4); rowIndex <= lastRow; rowIndex++) {',
    "    Logger.log('--- Row ' + rowIndex + ' ---');",
    "    Logger.log('Name: [' + getCellValue(sheet, rowIndex, BAITK_NAME_COLUMN) + ']');",
    "    Logger.log('Phone: [' + getCellValue(sheet, rowIndex, BAITK_PHONE_COLUMN) + ']');",
    '  }',
    '}',
    '',
    '// Advanced — send only the last row (do not use for production setup).',
    'function testSendLastRowToBaitk() {',
    '  const sheet = getLeadSheet();',
    '  const lastRow = sheet.getLastRow();',
    '',
    '  if (lastRow < 2) {',
    "    throw new Error('No data rows found (need header + at least one lead).');",
    '  }',
    '',
    '  for (let rowIndex = lastRow; rowIndex >= 2; rowIndex--) {',
    '    if (!rowHasRequiredLeadFields(sheet, rowIndex)) {',
    '      continue;',
    '    }',
    '',
    '    sendLeadFromSheetRow(sheet, rowIndex);',
    '    return;',
    '  }',
    '',
    '  throw new Error(',
    "    'No row found with name in ' + BAITK_NAME_COLUMN + ' and phone in ' + BAITK_PHONE_COLUMN,",
    '  );',
    '}',
    '',
    '// Client setup (Meta -> Google Sheets -> BAITK):',
    '// 1. Paste this entire file in Extensions -> Apps Script on the Meta leads sheet.',
    '// 2. Set BAITK_SHEET_TAB_NAME if leads are not on the first tab.',
    '// 3. Run setupBaitkIntegration ONCE (imports all rows + starts 1-min sync).',
    '// Advanced: debugSheetMapping, testSendLastRowToBaitk, skipExistingMetaRows.',
    '',
    '// Column mapping used by BAITK:',
    ...mappingComments,
    ...customMappingComments,
  ].join('\n');
};

export const buildSampleRowPreview = (
  mapping: IntegrationColumnMapping,
  sampleRow: string[],
): Record<string, string> => {
  const normalizedMapping = normalizeColumnMapping(mapping);
  const preview: Record<string, string> = {};

  for (const field of LEAD_MAPPING_FIELDS) {
    const column = normalizedMapping[field.key];

    if (!column) {
      preview[field.label] = 'Not mapped';
      continue;
    }

    const value = readMappedValue(column, sampleRow);
    preview[field.label] = value ?? '—';
  }

  for (const customField of normalizedMapping.customMappings ?? []) {
    const value = readMappedValue(customField.column, sampleRow);
    preview[customField.label] = value ?? '—';
  }

  return preview;
};

export const mappingIndexSummary = (mapping: IntegrationColumnMapping): string => {
  const normalizedMapping = normalizeColumnMapping(mapping);

  const builtInSummary = LEAD_MAPPING_FIELDS.filter(
    (field) => normalizedMapping[field.key],
  ).map((field) => `${field.label}: col ${normalizedMapping[field.key]}`);

  const customSummary = (normalizedMapping.customMappings ?? []).map(
    (entry) => `${entry.label}: col ${entry.column}`,
  );

  return [...builtInSummary, ...customSummary].join(' · ') || 'Name + Phone only';
};

export const createCustomMappingEntry = (): CustomMappingEntry => ({
  id:
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `custom-${Date.now()}`,
  label: '',
  column: null,
});
