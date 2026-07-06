import { useCallback, useEffect, useState } from 'react';
import {
  APPLICATION_ID,
  INTEGRATIONS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';
import { callBaitkAppRoute } from 'src/utils/baitk-app-route.util';
import { GOOGLE_NOT_CONNECTED_MESSAGE } from 'src/utils/get-google-connection.util';
import { GoogleConnectButton } from 'src/front-components/components/google-connect-button.component';
import { triggerAppOAuthFromHost } from 'src/utils/trigger-app-oauth.util';
import { extractGoogleSheetIdFromUrl } from 'src/utils/integration-setup.util';
import {
  buildSampleRowPreview,
  suggestColumnMappingFromHeaders,
  type IntegrationColumnMapping,
  type SheetColumnPreview,
} from 'src/utils/integration-mapping.util';

type SpreadsheetOption = {
  id: string;
  name: string;
};

type SheetTabOption = {
  title: string;
  index: number;
};

type IntegrationGoogleSheetConnectorProps = {
  integrationId: string | null;
  sheetId: string;
  sheetTabName: string;
  googleConnectionId: string;
  lastProcessedRow: number | null;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  columnMapping: IntegrationColumnMapping;
  onSheetIdChange: (sheetId: string) => void;
  onSheetTabNameChange: (sheetTabName: string) => void;
  onGoogleConnectionIdChange: (connectionId: string) => void;
  onColumnMappingChange: (mapping: IntegrationColumnMapping) => void;
  onPreviewLoaded?: (columns: SheetColumnPreview[], sampleRow: string[]) => void;
  onMessage: (message: string) => void;
  onSyncComplete?: () => void;
};

const sectionNoteStyle = {
  color: 'var(--t-font-color-secondary)',
  fontSize: 14,
  marginBottom: 12,
  lineHeight: 1.5,
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
  marginBottom: 8,
} as const;

const buttonSecondaryStyle = {
  ...buttonPrimaryStyle,
  background: 'var(--t-background-secondary)',
  color: 'var(--t-font-color-primary)',
  border: '1px solid var(--t-border-color-medium)',
} as const;

export const IntegrationGoogleSheetConnector = ({
  integrationId,
  sheetId,
  sheetTabName,
  googleConnectionId,
  lastProcessedRow,
  lastSyncAt,
  lastSyncError,
  columnMapping,
  onSheetIdChange,
  onSheetTabNameChange,
  onGoogleConnectionIdChange,
  onColumnMappingChange,
  onPreviewLoaded,
  onMessage,
  onSyncComplete,
}: IntegrationGoogleSheetConnectorProps) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetOption[]>([]);
  const [tabs, setTabs] = useState<SheetTabOption[]>([]);
  const [columns, setColumns] = useState<SheetColumnPreview[]>([]);
  const [sampleRow, setSampleRow] = useState<string[]>([]);
  const [loadingSpreadsheets, setLoadingSpreadsheets] = useState(false);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  const canImport = Boolean(integrationId && sheetId && sheetTabName);

  const loadSpreadsheets = useCallback(
    async (options?: { silent?: boolean }) => {
      setLoadingSpreadsheets(true);

      try {
        const result = await callBaitkAppRoute<{
          success: boolean;
          spreadsheets?: SpreadsheetOption[];
          connectionId?: string;
          error?: string;
        }>('/baitk/google/spreadsheets', 'GET');

        if (!result.success) {
          if (result.error === GOOGLE_NOT_CONNECTED_MESSAGE) {
            setGoogleConnected(false);
          }

          if (!options?.silent) {
            onMessage(result.error ?? 'Failed to load spreadsheets');
          }

          setSpreadsheets([]);

          return false;
        }

        setGoogleConnected(true);
        setSpreadsheets(result.spreadsheets ?? []);

        if (result.connectionId) {
          onGoogleConnectionIdChange(result.connectionId);
        }

        if (!options?.silent) {
          onMessage(`Loaded ${result.spreadsheets?.length ?? 0} spreadsheet(s)`);
        }

        return true;
      } catch (error) {
        if (!options?.silent) {
          onMessage(
            error instanceof Error ? error.message : 'Failed to load sheets',
          );
        }

        return false;
      } finally {
        setLoadingSpreadsheets(false);
      }
    },
    [onGoogleConnectionIdChange, onMessage],
  );

  const connectGoogle = useCallback(async () => {
    setConnectingGoogle(true);

    try {
      await triggerAppOAuthFromHost({
        applicationId: APPLICATION_ID,
        providerName: 'google',
        visibility: 'workspace',
        redirectLocation: `/page/${INTEGRATIONS_PAGE_LAYOUT_ID}`,
      });
    } catch (error) {
      onMessage(
        error instanceof Error
          ? error.message
          : 'Failed to start Google sign-in',
      );
    } finally {
      setConnectingGoogle(false);
    }
  }, [onMessage]);

  useEffect(() => {
    void loadSpreadsheets({ silent: true });
  }, [loadSpreadsheets]);

  const loadTabs = useCallback(
    async (selectedSpreadsheetId: string) => {
      if (!selectedSpreadsheetId) {
        setTabs([]);
        return;
      }

      setLoadingTabs(true);

      try {
        const query = new URLSearchParams({
          spreadsheetId: selectedSpreadsheetId,
        });

        if (googleConnectionId) {
          query.set('connectionId', googleConnectionId);
        }

        const result = await callBaitkAppRoute<{
          success: boolean;
          tabs?: SheetTabOption[];
          error?: string;
        }>(`/baitk/google/sheet-tabs?${query.toString()}`, 'GET');

        if (!result.success) {
          onMessage(result.error ?? 'Failed to load tabs');
          setTabs([]);

          return;
        }

        setTabs(result.tabs ?? []);

        if (result.tabs?.length === 1) {
          onSheetTabNameChange(result.tabs[0].title);
        }
      } catch (error) {
        onMessage(error instanceof Error ? error.message : 'Failed to load tabs');
      } finally {
        setLoadingTabs(false);
      }
    },
    [googleConnectionId, onMessage, onSheetTabNameChange],
  );

  const loadPreview = useCallback(async () => {
    if (!sheetId || !sheetTabName) {
      onMessage('Select a spreadsheet and tab first');
      return;
    }

    setLoadingPreview(true);

    try {
      const query = new URLSearchParams({
        spreadsheetId: sheetId,
        tabName: sheetTabName,
      });

      if (googleConnectionId) {
        query.set('connectionId', googleConnectionId);
      }

      const result = await callBaitkAppRoute<{
        success: boolean;
        columns?: SheetColumnPreview[];
        sampleRow?: string[];
        error?: string;
      }>(`/baitk/google/sheet-preview?${query.toString()}`, 'GET');

      if (!result.success) {
        onMessage(result.error ?? 'Failed to preview sheet');
        return;
      }

      const nextColumns = result.columns ?? [];
      const nextSampleRow = result.sampleRow ?? [];

      setColumns(nextColumns);
      setSampleRow(nextSampleRow);
      onPreviewLoaded?.(nextColumns, nextSampleRow);
      onMessage('Sheet loaded — map columns below');
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Failed to preview sheet');
    } finally {
      setLoadingPreview(false);
    }
  }, [
    googleConnectionId,
    onMessage,
    sheetId,
    sheetTabName,
  ]);

  const applySuggestedMapping = useCallback(() => {
    if (columns.length === 0) {
      onMessage('Preview the sheet first to suggest mapping');
      return;
    }

    const suggestedMapping = suggestColumnMappingFromHeaders(columns);

    onColumnMappingChange({
      ...columnMapping,
      ...suggestedMapping,
      customMappings: suggestedMapping.customMappings ?? [],
    });
    onMessage('Applied mapping from sheet headers');
  }, [columnMapping, columns, onColumnMappingChange, onMessage]);

  const runSync = useCallback(
    async (resetCursor: boolean) => {
      if (!integrationId) {
        onMessage('Save the integration first, then import rows');
        return;
      }

      setSyncing(true);

      try {
        const result = await callBaitkAppRoute<{
          success: boolean;
          message?: string;
          createdCount?: number;
          error?: string;
        }>('/baitk/google/sync-now', 'POST', {
          integrationId,
          resetCursor,
        });

        if (!result.success) {
          onMessage(result.error ?? 'Sync failed');
          return;
        }

        onMessage(result.message ?? 'Sync completed');
        onSyncComplete?.();
      } catch (error) {
        onMessage(error instanceof Error ? error.message : 'Sync failed');
      } finally {
        setSyncing(false);
      }
    },
    [integrationId, onMessage, onSyncComplete],
  );

  const handleSheetUrlChange = (value: string) => {
    setSheetUrl(value);

    const extractedSheetId = extractGoogleSheetIdFromUrl(value);

    if (extractedSheetId) {
      onSheetIdChange(extractedSheetId);
    }
  };

  const handleSpreadsheetSelect = (selectedSpreadsheetId: string) => {
    onSheetIdChange(selectedSpreadsheetId);

    const selectedSpreadsheet = spreadsheets.find(
      (spreadsheet) => spreadsheet.id === selectedSpreadsheetId,
    );

    if (selectedSpreadsheet) {
      setSheetUrl(
        `https://docs.google.com/spreadsheets/d/${selectedSpreadsheet.id}/edit`,
      );
    }
  };

  useEffect(() => {
    if (sheetId) {
      setSheetUrl(
        `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      );
    }
  }, [sheetId]);

  useEffect(() => {
    if (googleConnected && sheetId) {
      void loadTabs(sheetId);
    }
  }, [googleConnected, sheetId, loadTabs]);

  useEffect(() => {
    if (googleConnected && sheetId && sheetTabName) {
      void loadPreview();
    }
  }, [googleConnected, sheetId, sheetTabName, loadPreview]);

  const mappingPreview = buildSampleRowPreview(columnMapping, sampleRow);

  return (
    <div>
      <h3 style={{ marginBottom: 8, fontSize: 16 }}>Google Sheet</h3>

      {googleConnected === null && (
        <p style={sectionNoteStyle}>Checking Google connection…</p>
      )}

      {googleConnected === false && (
        <>
          <p style={sectionNoteStyle}>
            Connect your Google account to read lead spreadsheets. This is
            shared with your workspace so anyone can set up integrations.
          </p>
          <GoogleConnectButton
            label={connectingGoogle ? 'Redirecting…' : 'Sign in with Google'}
            disabled={connectingGoogle}
            onClick={() => void connectGoogle()}
          />
        </>
      )}

      {googleConnected === true && (
        <>
          <p style={sectionNoteStyle}>
            Paste your sheet link or pick from your Google account, choose the
            tab with your leads, then map columns below.
          </p>

          <GoogleConnectButton
            label={connectingGoogle ? 'Redirecting…' : 'Reconnect Google account'}
            disabled={connectingGoogle}
            onClick={() => void connectGoogle()}
          />

          <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
            Google Sheet URL
          </label>
          <input
            style={inputStyle}
            value={sheetUrl}
            onChange={(event) => handleSheetUrlChange(event.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/…/edit"
          />

          <button
            type="button"
            style={buttonSecondaryStyle}
            onClick={() => void loadSpreadsheets()}
            disabled={loadingSpreadsheets}
          >
            {loadingSpreadsheets ? 'Loading…' : 'Or pick from my Google account'}
          </button>

      {spreadsheets.length > 0 && (
        <>
          <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
            Spreadsheet
          </label>
          <select
            style={inputStyle}
            value={sheetId}
            onChange={(event) => handleSpreadsheetSelect(event.target.value)}
          >
            <option value="">Select spreadsheet…</option>
            {spreadsheets.map((spreadsheet) => (
              <option key={spreadsheet.id} value={spreadsheet.id}>
                {spreadsheet.name}
              </option>
            ))}
          </select>
        </>
      )}

      <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
        Sheet tab
      </label>
      <select
        style={inputStyle}
        value={sheetTabName}
        onChange={(event) => onSheetTabNameChange(event.target.value)}
        disabled={loadingTabs || !sheetId}
      >
        <option value="">Select tab…</option>
        {tabs.map((tab) => (
          <option key={`${tab.index}-${tab.title}`} value={tab.title}>
            {tab.title}
          </option>
        ))}
      </select>

      {loadingPreview && (
        <p style={sectionNoteStyle}>Loading sheet columns…</p>
      )}

      {columns.length > 0 && (
        <>
          <button
            type="button"
            style={{ ...buttonSecondaryStyle, marginTop: 8 }}
            onClick={applySuggestedMapping}
          >
            Suggest mapping from headers
          </button>

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <strong style={{ fontSize: 13 }}>Sheet columns</strong>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 8,
                marginTop: 8,
              }}
            >
              {columns.map((column) => (
                <div
                  key={column.column}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    background: 'var(--t-background-secondary)',
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{column.column}</div>
                  <div style={{ color: 'var(--t-font-color-secondary)' }}>
                    {column.header}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {sampleRow.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <strong style={{ fontSize: 13 }}>
            Mapping preview (first data row)
          </strong>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 8,
              marginTop: 8,
            }}
          >
            {Object.entries(mappingPreview).map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: 'var(--t-background-secondary)',
                  fontSize: 12,
                }}
              >
                <div style={{ color: 'var(--t-font-color-secondary)' }}>
                  {label}
                </div>
                <div style={{ fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          style={buttonPrimaryStyle}
          onClick={() => void runSync(true)}
          disabled={syncing || !canImport}
        >
          {syncing ? 'Importing…' : 'Import all rows now'}
        </button>
        <button
          type="button"
          style={buttonSecondaryStyle}
          onClick={() => void runSync(false)}
          disabled={syncing || !canImport}
        >
          Sync new rows
        </button>
      </div>

      {!integrationId && sheetId && sheetTabName && (
        <p style={{ ...sectionNoteStyle, color: 'var(--t-color-orange)' }}>
          Save the integration below before importing rows.
        </p>
      )}

      {integrationId && (
        <p style={sectionNoteStyle}>
          Last synced row: <strong>{lastProcessedRow ?? 1}</strong>
          {lastSyncAt && (
            <>
              {' '}
              · Last sync:{' '}
              <strong>{new Date(lastSyncAt).toLocaleString()}</strong>
            </>
          )}
          {lastSyncError && (
            <span style={{ color: 'var(--t-color-red)' }}>
              {' '}
              · Error: {lastSyncError}
            </span>
          )}
        </p>
      )}
        </>
      )}
    </div>
  );
};
