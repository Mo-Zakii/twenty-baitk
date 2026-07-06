import { useCallback, useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  copyToClipboard,
  openCommandConfirmationModal,
} from 'twenty-sdk/front-component';
import { INTEGRATIONS_FRONT_COMPONENT_ID } from 'src/constants/uuids';
import { IntegrationType } from 'src/objects/integration.object';
import { postCoreGraphql } from 'src/utils/baitk-graphql.util';
import { callBaitkAppRoute } from 'src/utils/baitk-app-route.util';
import {
  buildAppsScriptWebhookUrl,
  buildBaitkWebhookUrl,
  isLocalhostWebhookUrl,
} from 'src/utils/baitk-webhook-url.util';
import { IntegrationGoogleSheetConnector } from 'src/front-components/components/integration-google-sheet-connector.component';
import { isSheetBasedIntegrationType } from 'src/utils/integration-setup.util';
import {
  buildGoogleAppsScript,
  buildSampleRowPreview,
  createCustomMappingEntry,
  generateWebhookSecret,
  LEAD_MAPPING_FIELDS,
  mappingIndexSummary,
  normalizeColumnMapping,
  parseColumnMapping,
  META_LEAD_ADS_COLUMN_MAPPING,
  REQUIRED_DEFAULT_COLUMN_MAPPING,
  type CustomMappingEntry,
  type IntegrationColumnMapping,
  type SheetColumnPreview,
} from 'src/utils/integration-mapping.util';

type IntegrationRow = {
  id: string;
  name: string;
  integrationType: string | null;
  sheetId: string | null;
  sheetTabName: string | null;
  googleConnectionId: string | null;
  lastProcessedRow: number | null;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  webhookSecret: string | null;
  columnMapping: unknown;
  customSourceLabel: string | null;
  isActive: boolean;
};

const INTEGRATION_TYPE_OPTIONS = [
  { value: IntegrationType.GOOGLE_SHEETS, label: 'Google Sheets' },
  { value: IntegrationType.WEBHOOK, label: 'Webhook' },
  { value: IntegrationType.ZAPIER, label: 'Zapier' },
  { value: IntegrationType.META_LEADS, label: 'Meta / Facebook Leads' },
  { value: IntegrationType.CUSTOM_FORM, label: 'Custom Form' },
] as const;

const panelStyle = {
  padding: 24,
  fontFamily: 'var(--t-font-family, Inter, sans-serif)',
  color: 'var(--t-font-color-primary)',
} as const;

const sectionStyle = {
  border: '1px solid var(--t-border-color-medium)',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  background: 'var(--t-background-primary)',
} as const;

const secondaryTextStyle = {
  color: 'var(--t-font-color-secondary)',
  fontSize: 14,
  marginBottom: 12,
} as const;

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--t-border-color-medium)',
  fontSize: 14,
  marginBottom: 8,
  background: 'var(--t-background-primary)',
  color: 'var(--t-font-color-primary)',
} as const;

const codeBlockStyle = {
  display: 'block',
  padding: 12,
  borderRadius: 8,
  background: 'var(--t-background-secondary)',
  border: '1px solid var(--t-border-color-medium)',
  fontSize: 12,
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
  color: 'var(--t-font-color-primary)',
};

const buttonPrimaryStyle = {
  padding: '8px 14px',
  background: 'var(--t-color-blue)',
  color: 'var(--t-font-color-inverted)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
  marginRight: 8,
} as const;

const buttonSecondaryStyle = {
  ...buttonPrimaryStyle,
  background: 'var(--t-background-secondary)',
  color: 'var(--t-font-color-primary)',
  border: '1px solid var(--t-border-color-medium)',
} as const;

const PUBLIC_WEBHOOK_STORAGE_PREFIX = 'baitk-public-webhook:';

const publicWebhookUrlByIntegrationId = new Map<string, string>();

const readStoredPublicWebhookUrl = (integrationId: string): string => {
  const inMemoryValue = publicWebhookUrlByIntegrationId.get(integrationId);

  if (inMemoryValue) {
    return inMemoryValue;
  }

  try {
    if (typeof localStorage === 'undefined') {
      return '';
    }

    return (
      localStorage.getItem(`${PUBLIC_WEBHOOK_STORAGE_PREFIX}${integrationId}`) ??
      ''
    );
  } catch {
    return '';
  }
};

const writeStoredPublicWebhookUrl = (
  integrationId: string,
  value: string,
): void => {
  publicWebhookUrlByIntegrationId.set(integrationId, value);

  try {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(
      `${PUBLIC_WEBHOOK_STORAGE_PREFIX}${integrationId}`,
      value,
    );
  } catch {
    // Remote front components have no localStorage — in-memory Map only.
  }
};

const emptyForm = () => ({
  name: '',
  integrationType: IntegrationType.GOOGLE_SHEETS,
  sheetId: '',
  sheetTabName: '',
  googleConnectionId: '',
  lastProcessedRow: 1,
  lastSyncAt: null as string | null,
  lastSyncError: null as string | null,
  customSourceLabel: 'Facebook Ads',
  webhookSecret: generateWebhookSecret(),
  columnMapping: {
    ...META_LEAD_ADS_COLUMN_MAPPING,
    customMappings: (META_LEAD_ADS_COLUMN_MAPPING.customMappings ?? []).map(
      (entry) => ({ ...entry }),
    ),
  } as IntegrationColumnMapping,
  isActive: true,
});

const IntegrationsPanel = () => {
  const [integrations, setIntegrations] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sampleRowText, setSampleRowText] = useState(
    'Ahmed Hassan,+201234567890,+209876543210,ahmed@email.com,Facebook,2M EGP,New Cairo',
  );
  const [publicWebhookUrl, setPublicWebhookUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sheetColumns, setSheetColumns] = useState<SheetColumnPreview[]>([]);
  const [sheetSampleRow, setSheetSampleRow] = useState<string[]>([]);

  const webhookUrl = useMemo(() => buildBaitkWebhookUrl(), []);

  const appsScriptWebhookUrl = useMemo(
    () => buildAppsScriptWebhookUrl(publicWebhookUrl, webhookUrl),
    [publicWebhookUrl, webhookUrl],
  );

  const needsPublicWebhookUrl = isLocalhostWebhookUrl(webhookUrl);
  const isProductionWebhook = !needsPublicWebhookUrl;

  const applyMetaLeadAdsPreset = () => {
    setForm((previous) => ({
      ...previous,
      columnMapping: {
        ...META_LEAD_ADS_COLUMN_MAPPING,
        customMappings: (META_LEAD_ADS_COLUMN_MAPPING.customMappings ?? []).map(
          (entry) => ({ ...entry }),
        ),
      },
      customSourceLabel: previous.customSourceLabel.trim()
        ? previous.customSourceLabel
        : 'Facebook Ads',
    }));
  };

  const handleIntegrationTypeChange = (integrationType: IntegrationType) => {
    setForm((previous) => {
      const nextForm = {
        ...previous,
        integrationType,
      };

      if (integrationType === IntegrationType.META_LEADS) {
        return {
          ...nextForm,
          columnMapping: {
            ...META_LEAD_ADS_COLUMN_MAPPING,
            customMappings: (
              META_LEAD_ADS_COLUMN_MAPPING.customMappings ?? []
            ).map((entry) => ({ ...entry })),
          },
          customSourceLabel: previous.customSourceLabel.trim()
            ? previous.customSourceLabel
            : 'Facebook Ads',
        };
      }

      return nextForm;
    });
  };

  const previewSampleRow = useMemo(
    () =>
      sheetSampleRow.length > 0
        ? sheetSampleRow
        : sampleRowText.split(',').map((value) => value.trim()),
    [sampleRowText, sheetSampleRow],
  );

  const preview = useMemo(
    () => buildSampleRowPreview(form.columnMapping, previewSampleRow),
    [form.columnMapping, previewSampleRow],
  );

  const isSheetBasedType = isSheetBasedIntegrationType(form.integrationType);

  const loadIntegrations = useCallback(async (): Promise<IntegrationRow[]> => {
    setLoading(true);

    const result = await postCoreGraphql<{
      baitkIntegrations: {
        edges: { node: IntegrationRow }[];
      };
    }>(`query LoadIntegrations {
      baitkIntegrations(first: 50, orderBy: [{ name: AscNullsFirst }]) {
        edges {
          node {
            id
            name
            integrationType
            sheetId
            sheetTabName
            googleConnectionId
            lastProcessedRow
            lastSyncAt
            lastSyncError
            webhookSecret
            columnMapping
            customSourceLabel
            isActive
          }
        }
      }
    }`);

    const rows = result.baitkIntegrations.edges.map((edge) => edge.node);

    setIntegrations(rows);
    setLoading(false);

    return rows;
  }, []);

  const handlePreviewLoaded = useCallback(
    (columns: SheetColumnPreview[], sampleRowValues: string[]) => {
      setSheetColumns(columns);
      setSheetSampleRow(sampleRowValues);
    },
    [],
  );

  const handleGoogleSyncComplete = useCallback(() => {
    void loadIntegrations().then((rows) => {
      if (!editingId) {
        return;
      }

      const updatedIntegration = rows.find(
        (integration) => integration.id === editingId,
      );

      if (!updatedIntegration) {
        return;
      }

      setForm((previous) => ({
        ...previous,
        lastProcessedRow: updatedIntegration.lastProcessedRow ?? 1,
        lastSyncAt: updatedIntegration.lastSyncAt,
        lastSyncError: updatedIntegration.lastSyncError,
      }));
    });
  }, [editingId, loadIntegrations]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  useEffect(() => {
    if (!editingId) {
      setPublicWebhookUrl('');
      return;
    }

    setPublicWebhookUrl(readStoredPublicWebhookUrl(editingId));
  }, [editingId]);

  const handlePublicWebhookUrlChange = (value: string) => {
    setPublicWebhookUrl(value);

    if (editingId) {
      writeStoredPublicWebhookUrl(editingId, value);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSheetColumns([]);
    setSheetSampleRow([]);
    setMessage('');
  };

  const startEdit = (integration: IntegrationRow) => {
    setEditingId(integration.id);
    setForm({
      name: integration.name,
      integrationType:
        (integration.integrationType as IntegrationType) ??
        IntegrationType.GOOGLE_SHEETS,
      sheetId: integration.sheetId ?? '',
      sheetTabName: integration.sheetTabName ?? '',
      googleConnectionId: integration.googleConnectionId ?? '',
      lastProcessedRow: integration.lastProcessedRow ?? 1,
      lastSyncAt: integration.lastSyncAt,
      lastSyncError: integration.lastSyncError,
      customSourceLabel: integration.customSourceLabel ?? '',
      webhookSecret: integration.webhookSecret ?? generateWebhookSecret(),
      columnMapping: parseColumnMapping(integration.columnMapping),
      isActive: integration.isActive,
    });
    setMessage('');
  };

  const updateMapping = (
    key: keyof Omit<IntegrationColumnMapping, 'customMappings'>,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      columnMapping: {
        ...previous.columnMapping,
        [key]: value.trim() ? value.trim() : null,
      },
    }));
  };

  const updateCustomMapping = (
    mappingId: string,
    patch: Partial<Pick<CustomMappingEntry, 'label' | 'column'>>,
  ) => {
    setForm((previous) => ({
      ...previous,
      columnMapping: {
        ...previous.columnMapping,
        customMappings: (previous.columnMapping.customMappings ?? []).map(
          (entry) => {
            if (entry.id !== mappingId) {
              return entry;
            }

            return {
              ...entry,
              ...patch,
              column:
                patch.column === undefined
                  ? entry.column
                  : patch.column?.trim()
                    ? patch.column.trim()
                    : null,
            };
          },
        ),
      },
    }));
  };

  const addCustomMapping = () => {
    setForm((previous) => ({
      ...previous,
      columnMapping: {
        ...previous.columnMapping,
        customMappings: [
          ...(previous.columnMapping.customMappings ?? []),
          createCustomMappingEntry(),
        ],
      },
    }));
  };

  const removeCustomMapping = (mappingId: string) => {
    setForm((previous) => ({
      ...previous,
      columnMapping: {
        ...previous.columnMapping,
        customMappings: (previous.columnMapping.customMappings ?? []).filter(
          (entry) => entry.id !== mappingId,
        ),
      },
    }));
  };

  const saveIntegration = async () => {
    if (!form.name.trim()) {
      setMessage('Integration name is required');
      return;
    }

    if (!form.columnMapping.name || !form.columnMapping.phone) {
      setMessage('Map at least Name and Phone columns');
      return;
    }

    setMessage('Saving...');
    const columnMapping = normalizeColumnMapping(form.columnMapping);
    const data = {
      name: form.name.trim(),
      integrationType: form.integrationType,
      sheetId: form.sheetId.trim() || null,
      sheetTabName: form.sheetTabName.trim() || null,
      googleConnectionId: form.googleConnectionId.trim() || null,
      lastProcessedRow: form.lastProcessedRow ?? 1,
      customSourceLabel: form.customSourceLabel.trim() || null,
      webhookSecret: form.webhookSecret,
      columnMapping,
      isActive: form.isActive,
    };

    let savedIntegrationId = editingId;

    if (editingId) {
      await postCoreGraphql(
        `mutation UpdateIntegration($id: UUID!, $data: BaitkIntegrationUpdateInput!) {
          updateBaitkIntegration(id: $id, data: $data) {
            id
          }
        }`,
        { id: editingId, data },
      );
      setMessage('Integration updated');
    } else {
      const created = await postCoreGraphql<{
        createBaitkIntegration: { id: string };
      }>(
        `mutation CreateIntegration($data: BaitkIntegrationCreateInput!) {
          createBaitkIntegration(data: $data) {
            id
          }
        }`,
        { data },
      );

      savedIntegrationId = created.createBaitkIntegration.id;
      setEditingId(savedIntegrationId);
      setMessage('Integration created');
    }

    const shouldAutoSync =
      isSheetBasedType &&
      data.isActive &&
      Boolean(data.sheetId) &&
      Boolean(data.sheetTabName);

    if (shouldAutoSync && savedIntegrationId) {
      const shouldImportAll =
        (form.lastProcessedRow ?? 1) <= 1 && !form.lastSyncAt;

      setMessage(
        shouldImportAll
          ? 'Saved — importing existing sheet rows…'
          : 'Saved — syncing new sheet rows…',
      );

      try {
        const syncResult = await callBaitkAppRoute<{
          success: boolean;
          message?: string;
          error?: string;
        }>('/baitk/google/sync-now', 'POST', {
          integrationId: savedIntegrationId,
          resetCursor: shouldImportAll,
        });

        if (syncResult.success) {
          setMessage(syncResult.message ?? 'Sheet sync completed');
        } else {
          setMessage(syncResult.error ?? 'Saved, but sheet sync failed');
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? `Saved, but sheet sync failed: ${error.message}`
            : 'Saved, but sheet sync failed',
        );
      }
    } else if (!shouldAutoSync) {
      setMessage(
        isSheetBasedType
          ? 'Integration saved — select a sheet tab and map columns to enable auto-import'
          : 'Integration saved — copy the script below',
      );
    }

    await loadIntegrations();
  };

  const deleteIntegration = async (integration: IntegrationRow) => {
    const confirmationResult = await openCommandConfirmationModal({
      title: 'Delete integration',
      subtitle: `Delete "${integration.name}"? This cannot be undone.`,
      confirmButtonText: 'Delete',
      confirmButtonAccent: 'danger',
    });

    if (confirmationResult !== 'confirm') {
      return;
    }

    try {
      setMessage('Deleting...');

      await postCoreGraphql(
        `mutation DeleteIntegration($id: UUID!) {
          deleteBaitkIntegration(id: $id) {
            id
          }
        }`,
        { id: integration.id },
      );

      if (editingId === integration.id) {
        resetForm();
      }

      setMessage(`Deleted ${integration.name}`);
      await loadIntegrations();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete integration';
      setMessage(errorMessage);
    }
  };

  const renderColumnFieldInput = (
    fieldKey: keyof Omit<IntegrationColumnMapping, 'customMappings'>,
    required: boolean,
  ) => {
    const value = form.columnMapping[fieldKey] ?? '';

    if (sheetColumns.length > 0) {
      return (
        <select
          style={{ ...inputStyle, marginBottom: 0 }}
          value={value}
          onChange={(event) => updateMapping(fieldKey, event.target.value)}
        >
          <option value="">
            {required ? 'Select column…' : 'Skip'}
          </option>
          {sheetColumns.map((column) => (
            <option key={column.column} value={column.column}>
              {column.column} — {column.header}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        style={{ ...inputStyle, marginBottom: 0 }}
        value={value}
        onChange={(event) => updateMapping(fieldKey, event.target.value)}
        placeholder={
          required
            ? (REQUIRED_DEFAULT_COLUMN_MAPPING[fieldKey] ?? '')
            : 'Leave empty to skip'
        }
      />
    );
  };

  const copyText = async (text: string) => {
    try {
      await copyToClipboard(text);
      setMessage('Copied to clipboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to copy to clipboard';
      setMessage(errorMessage);
    }
  };

  const generatedScript =
    editingId && form.webhookSecret
      ? buildGoogleAppsScript({
          webhookUrl: appsScriptWebhookUrl,
          integrationId: editingId,
          secret: form.webhookSecret,
          mapping: form.columnMapping,
        })
      : null;

  const webhookPayloadExample = editingId
    ? `{
  "integrationId": "${editingId}",
  "secret": "${form.webhookSecret}",
  "row": ["Ahmed Hassan", "+201234567890", "+209876543210"]
}

// Or for Zapier / Meta with field names:
{
  "integrationId": "${editingId}",
  "secret": "${form.webhookSecret}",
  "fields": {
    "${form.columnMapping.name ?? 'full_name'}": "Ahmed Hassan",
    "${form.columnMapping.phone ?? 'phone'}": "+201234567890"
  }
}`
    : `{
  "integrationId": "YOUR_INTEGRATION_ID",
  "secret": "YOUR_SECRET",
  "row": ["Name value", "Phone value", "Second phone value"]
}`;

  return (
    <div style={panelStyle}>
      <h2 style={{ marginBottom: 8 }}>Integrations</h2>
      <p style={secondaryTextStyle}>
        Connect Google Sheets directly — choose a spreadsheet, map columns, and
        BAITK imports leads automatically. No Apps Script for clients.
      </p>

      {message && (
        <p
          style={{
            ...secondaryTextStyle,
            color: message.toLowerCase().includes('fail') ||
              message.toLowerCase().includes('error') ||
              message.toLowerCase().includes('required') ||
              message.toLowerCase().includes('invalid')
              ? 'var(--t-color-red)'
              : 'var(--t-color-green)',
          }}
        >
          {message}
        </p>
      )}

      <div style={sectionStyle}>
        <h3 style={{ marginBottom: 8, fontSize: 16 }}>
          {editingId ? 'Edit integration' : 'Add integration'}
        </h3>

        <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
          Name
        </label>
        <input
          style={inputStyle}
          value={form.name}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, name: event.target.value }))
          }
          placeholder="Facebook leads sheet"
        />

        <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
          Source type
        </label>
        <select
          style={inputStyle}
          value={form.integrationType}
          onChange={(event) =>
            handleIntegrationTypeChange(event.target.value as IntegrationType)
          }
        >
          {INTEGRATION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
          Source label on leads (optional)
        </label>
        <input
          style={inputStyle}
          value={form.customSourceLabel}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              customSourceLabel: event.target.value,
            }))
          }
          placeholder="Facebook Ads"
        />

        {isSheetBasedType && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--t-border-color-light)',
            }}
          >
            <IntegrationGoogleSheetConnector
              integrationId={editingId}
              sheetId={form.sheetId}
              sheetTabName={form.sheetTabName}
              googleConnectionId={form.googleConnectionId}
              lastProcessedRow={form.lastProcessedRow}
              lastSyncAt={form.lastSyncAt}
              lastSyncError={form.lastSyncError}
              columnMapping={form.columnMapping}
              onSheetIdChange={(value) =>
                setForm((previous) => ({ ...previous, sheetId: value }))
              }
              onSheetTabNameChange={(value) =>
                setForm((previous) => ({ ...previous, sheetTabName: value }))
              }
              onGoogleConnectionIdChange={(value) =>
                setForm((previous) => ({
                  ...previous,
                  googleConnectionId: value,
                }))
              }
              onColumnMappingChange={(mapping) =>
                setForm((previous) => ({
                  ...previous,
                  columnMapping: mapping,
                }))
              }
              onPreviewLoaded={handlePreviewLoaded}
              onMessage={setMessage}
              onSyncComplete={handleGoogleSyncComplete}
            />
          </div>
        )}

        <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14 }}>
          Column mapping
        </h4>
        <p style={secondaryTextStyle}>
          {sheetColumns.length > 0
            ? 'Pick columns from your sheet for each lead field. Name and Phone are required.'
            : 'Use column letters (A, B, C…) or load your sheet above to pick columns from headers.'}
        </p>
        <button
          type="button"
          style={{ ...buttonSecondaryStyle, marginBottom: 12 }}
          onClick={applyMetaLeadAdsPreset}
        >
          Use Meta Lead Ads columns (N=name, O=phone)
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {LEAD_MAPPING_FIELDS.map((field) => (
            <div key={field.key}>
              <label
                style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
              >
                {field.label}
                {field.required ? ' *' : ''}
              </label>
              {renderColumnFieldInput(field.key, field.required)}
            </div>
          ))}
        </div>

        <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14 }}>
          Extra column mappings
        </h4>
        <p style={secondaryTextStyle}>
          Add any extra sheet columns you want saved on the lead as comments
          (for example Unit type, Campaign, Notes).
        </p>

        {(form.columnMapping.customMappings ?? []).length === 0 ? (
          <p style={{ ...secondaryTextStyle, marginBottom: 12 }}>
            No extra mappings yet.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
            {(form.columnMapping.customMappings ?? []).map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px auto',
                  gap: 8,
                  alignItems: 'end',
                }}
              >
                <div>
                  <label
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Label
                  </label>
                  <input
                    style={{ ...inputStyle, marginBottom: 0 }}
                    value={entry.label}
                    onChange={(event) =>
                      updateCustomMapping(entry.id, {
                        label: event.target.value,
                      })
                    }
                    placeholder="Unit type"
                  />
                </div>
                <div>
                  <label
                    style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                  >
                    Column
                  </label>
                  {sheetColumns.length > 0 ? (
                    <select
                      style={{ ...inputStyle, marginBottom: 0 }}
                      value={entry.column ?? ''}
                      onChange={(event) =>
                        updateCustomMapping(entry.id, {
                          column: event.target.value,
                        })
                      }
                    >
                      <option value="">Select…</option>
                      {sheetColumns.map((column) => (
                        <option key={column.column} value={column.column}>
                          {column.column} — {column.header}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      style={{ ...inputStyle, marginBottom: 0 }}
                      value={entry.column ?? ''}
                      onChange={(event) =>
                        updateCustomMapping(entry.id, {
                          column: event.target.value,
                        })
                      }
                      placeholder="H"
                    />
                  )}
                </div>
                <button
                  type="button"
                  style={{
                    ...buttonSecondaryStyle,
                    marginRight: 0,
                    color: 'var(--t-color-red)',
                  }}
                  onClick={() => removeCustomMapping(entry.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          style={{ ...buttonSecondaryStyle, marginBottom: 16 }}
          onClick={addCustomMapping}
        >
          Add mapping
        </button>

        <h4 style={{ marginTop: 16, marginBottom: 8, fontSize: 14 }}>
          Test mapping
        </h4>
        {sheetSampleRow.length === 0 && (
          <input
            style={inputStyle}
            value={sampleRowText}
            onChange={(event) => setSampleRowText(event.target.value)}
            placeholder="Sample row, comma-separated"
          />
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {Object.entries(preview).map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: 10,
                borderRadius: 8,
                background: 'var(--t-background-secondary)',
                fontSize: 13,
              }}
            >
              <div style={{ color: 'var(--t-font-color-secondary)' }}>
                {label}
              </div>
              <div style={{ fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                isActive: event.target.checked,
              }))
            }
          />
          Active
        </label>

        <button type="button" style={buttonPrimaryStyle} onClick={saveIntegration}>
          {editingId ? 'Save changes' : 'Create integration'}
        </button>
        {editingId && (
          <button type="button" style={buttonSecondaryStyle} onClick={resetForm}>
            New integration
          </button>
        )}
      </div>

      {editingId && (
        <>
          <div style={sectionStyle}>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Connection details</h3>
            {!isProductionWebhook && (
              <>
                <p style={secondaryTextStyle}>
                  Local dev only — API webhook on your machine:
                </p>
                <code style={codeBlockStyle}>{webhookUrl}</code>
                <button
                  type="button"
                  style={{ ...buttonPrimaryStyle, marginTop: 12 }}
                  onClick={() => copyText(webhookUrl)}
                >
                  Copy URL
                </button>
              </>
            )}
            {needsPublicWebhookUrl && (
              <>
                <p
                  style={{
                    ...secondaryTextStyle,
                    marginTop: 16,
                    color: 'var(--t-color-red)',
                  }}
                >
                  Google Sheets cannot call localhost. Paste your public HTTPS
                  URL below (ngrok or production) — it is used in the Apps
                  Script.
                </p>
                <label
                  style={{
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 4,
                    marginTop: 8,
                  }}
                >
                  Public webhook URL (for Google Sheets)
                </label>
                <input
                  style={inputStyle}
                  value={publicWebhookUrl}
                  onChange={(event) =>
                    handlePublicWebhookUrlChange(event.target.value)
                  }
                  placeholder="https://your-domain.com or https://xxxx.ngrok-free.app"
                />
                <p style={{ ...secondaryTextStyle, marginTop: 8 }}>
                  Script will use:{' '}
                  <strong>{appsScriptWebhookUrl}</strong>
                </p>
              </>
            )}
            {isProductionWebhook && (
              <p style={secondaryTextStyle}>
                SaaS mode: the script already points to{' '}
                <strong>{appsScriptWebhookUrl}</strong>. Clients do not need
                ngrok or extra URLs.
              </p>
            )}
            <p style={{ ...secondaryTextStyle, marginTop: 16 }}>
              Integration ID: <strong>{editingId}</strong>
            </p>
            <p style={secondaryTextStyle}>
              Secret: <strong>{form.webhookSecret}</strong>
            </p>
          </div>

          <button
            type="button"
            style={{ ...buttonSecondaryStyle, marginBottom: 16 }}
            onClick={() => setShowAdvanced((previous) => !previous)}
          >
            {showAdvanced ? 'Hide advanced / developer options' : 'Show advanced / developer options'}
          </button>

          {showAdvanced && (
            <>
          <div style={sectionStyle}>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>Webhook payload</h3>
            <code style={codeBlockStyle}>{webhookPayloadExample}</code>
            <button
              type="button"
              style={{ ...buttonPrimaryStyle, marginTop: 12 }}
              onClick={() => copyText(webhookPayloadExample)}
            >
              Copy payload example
            </button>
          </div>

          {form.integrationType === IntegrationType.GOOGLE_SHEETS ||
          form.integrationType === IntegrationType.META_LEADS
            ? generatedScript && (
              <div style={sectionStyle}>
                <h3 style={{ marginBottom: 8, fontSize: 16 }}>
                  Google Sheets script (full)
                </h3>
                <code style={codeBlockStyle}>{generatedScript}</code>
                <button
                  type="button"
                  style={{ ...buttonPrimaryStyle, marginTop: 12 }}
                  onClick={() => copyText(generatedScript)}
                >
                  Copy Apps Script
                </button>
              </div>
            )
            : null}
            </>
          )}
        </>
      )}

      <div style={sectionStyle}>
        <h3 style={{ marginBottom: 8, fontSize: 16 }}>Your integrations</h3>
        {loading ? (
          <p style={secondaryTextStyle}>Loading...</p>
        ) : integrations.length === 0 ? (
          <p style={secondaryTextStyle}>No integrations yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  borderBottom: '1px solid var(--t-border-color-medium)',
                }}
              >
                <th style={{ padding: 8 }}>Name</th>
                <th style={{ padding: 8 }}>Type</th>
                <th style={{ padding: 8 }}>Mapping</th>
                <th style={{ padding: 8 }}>Active</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((integration) => (
                <tr
                  key={integration.id}
                  style={{
                    borderBottom: '1px solid var(--t-border-color-light)',
                  }}
                >
                  <td style={{ padding: 8 }}>{integration.name}</td>
                  <td style={{ padding: 8, color: 'var(--t-font-color-secondary)' }}>
                    {integration.integrationType ?? '—'}
                  </td>
                  <td style={{ padding: 8, color: 'var(--t-font-color-secondary)', fontSize: 12 }}>
                    {mappingIndexSummary(parseColumnMapping(integration.columnMapping))}
                  </td>
                  <td style={{ padding: 8 }}>
                    {integration.isActive ? 'Yes' : 'No'}
                  </td>
                  <td style={{ padding: 8 }}>
                    <button type="button" style={buttonSecondaryStyle} onClick={() => startEdit(integration)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      style={{ ...buttonSecondaryStyle, color: 'var(--t-color-red)' }}
                      onClick={() => deleteIntegration(integration)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: INTEGRATIONS_FRONT_COMPONENT_ID,
  name: 'baitk-integrations-panel',
  component: IntegrationsPanel,
});
