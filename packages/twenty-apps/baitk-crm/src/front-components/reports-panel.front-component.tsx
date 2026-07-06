import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { REPORTS_FRONT_COMPONENT_ID } from 'src/constants/uuids';
import { LeadStage } from 'src/objects/lead.object';
import { postCoreGraphql } from 'src/utils/baitk-graphql.util';

type ReportMetric = {
  label: string;
  value: number;
  color: string;
};

type CustomReportRow = {
  id: string;
  name: string | null;
};

const panelStyle = {
  padding: 24,
  fontFamily: 'var(--t-font-family, Inter, sans-serif)',
  color: 'var(--t-font-color-primary)',
} as const;

const ReportsPanel = () => {
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [bestSource, setBestSource] = useState('—');
  const [customReports, setCustomReports] = useState<CustomReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await postCoreGraphql<{
      leads: {
        edges: { node: { stage: string | null; source: string | null } }[];
      };
      baitkCustomReports: {
        edges: { node: { id: string; name: string | null } }[];
      };
    }>(`query LoadReports {
      leads(first: 1000) {
        edges {
          node {
            stage
            source
          }
        }
      }
      baitkCustomReports(first: 50, orderBy: [{ updatedAt: DescNullsLast }]) {
        edges {
          node {
            id
            name
          }
        }
      }
    }`);

    const leads = result.leads.edges.map((edge) => edge.node);
    const total = leads.length;
    const won = leads.filter((lead) => lead.stage === LeadStage.WON).length;
    const lost = leads.filter((lead) => lead.stage === LeadStage.LOST).length;
    const meeting = leads.filter(
      (lead) => lead.stage === LeadStage.MEETING,
    ).length;
    const conversionRate =
      total > 0 ? Math.round((won / total) * 1000) / 10 : 0;

    const sourceCounts = new Map<string, number>();
    for (const lead of leads) {
      const source = lead.source?.trim() || 'Unknown';
      sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
    }

    const topSource = [...sourceCounts.entries()].sort(
      (first, second) => second[1] - first[1],
    )[0];

    setBestSource(topSource ? `${topSource[0]} (${topSource[1]})` : '—');
    setCustomReports(
      result.baitkCustomReports.edges.map((edge) => edge.node),
    );
    setMetrics([
      { label: 'Total Leads', value: total, color: 'var(--t-color-blue)' },
      { label: 'Won', value: won, color: 'var(--t-color-green)' },
      { label: 'Lost', value: lost, color: 'var(--t-color-red)' },
      { label: 'Meetings', value: meeting, color: 'var(--t-color-cyan)' },
      {
        label: 'Conversion %',
        value: conversionRate,
        color: 'var(--t-color-purple)',
      },
    ]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div style={panelStyle}>
        <p style={{ color: 'var(--t-font-color-secondary)' }}>
          Loading reports...
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h2 style={{ marginBottom: 8 }}>Reports</h2>
      <p
        style={{
          color: 'var(--t-font-color-secondary)',
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        Built-in brokerage metrics — filtered by your role permissions.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              border: '1px solid var(--t-border-color-medium)',
              borderRadius: 8,
              padding: 16,
              background: 'var(--t-background-primary)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: 'var(--t-font-color-secondary)',
              }}
            >
              {metric.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: metric.color,
                marginTop: 4,
              }}
            >
              {metric.label === 'Conversion %'
                ? `${metric.value}%`
                : metric.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--t-background-transparent-blue)',
          border: '1px solid var(--t-border-color-blue)',
          fontSize: 14,
        }}
      >
        <strong>Best source this month:</strong> {bestSource}
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 8 }}>Custom Reports</h3>
        <p
          style={{
            color: 'var(--t-font-color-secondary)',
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          Saved report configurations. Open Custom Reports in the sidebar to
          create or edit them.
        </p>
        {customReports.length === 0 ? (
          <p style={{ color: 'var(--t-font-color-secondary)', fontSize: 14 }}>
            No custom reports yet.
          </p>
        ) : (
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 14,
              lineHeight: 1.8,
            }}
          >
            {customReports.map((customReport) => (
              <li key={customReport.id}>
                {customReport.name?.trim() || 'Untitled report'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: REPORTS_FRONT_COMPONENT_ID,
  name: 'baitk-reports-panel',
  component: ReportsPanel,
});
