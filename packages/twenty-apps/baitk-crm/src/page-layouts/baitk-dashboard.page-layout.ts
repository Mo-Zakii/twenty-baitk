import {
  AggregateOperations,
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import {
  DASHBOARD_PAGE_LAYOUT_ID,
  DASHBOARD_WIDGET_IDS,
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  NOTIFICATIONS_FRONT_COMPONENT_ID,
} from 'src/constants/uuids';
import { LeadStage } from 'src/objects/lead.object';

export { DASHBOARD_PAGE_LAYOUT_ID };

export default definePageLayout({
  universalIdentifier: DASHBOARD_PAGE_LAYOUT_ID,
  name: 'BAITK Dashboard',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: DASHBOARD_WIDGET_IDS.tab,
      title: 'Dashboard',
      position: 0,
      icon: 'IconChartBar',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: DASHBOARD_WIDGET_IDS.totalLeads,
          title: 'Total Leads',
          type: 'GRAPH',
          objectUniversalIdentifier: LEAD_OBJECT_ID,
          gridPosition: { row: 0, column: 0, columnSpan: 3, rowSpan: 2 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.name,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'Total Leads',
            color: 'blue',
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
          },
        },
        {
          universalIdentifier: DASHBOARD_WIDGET_IDS.wonLeads,
          title: 'Won Leads',
          type: 'GRAPH',
          objectUniversalIdentifier: LEAD_OBJECT_ID,
          gridPosition: { row: 0, column: 3, columnSpan: 3, rowSpan: 2 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.name,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'Won',
            color: 'green',
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.stage,
                  operand: 'IS',
                  value: LeadStage.WON,
                  type: 'SELECT',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: DASHBOARD_WIDGET_IDS.lostLeads,
          title: 'Lost Leads',
          type: 'GRAPH',
          objectUniversalIdentifier: LEAD_OBJECT_ID,
          gridPosition: { row: 0, column: 6, columnSpan: 3, rowSpan: 2 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.name,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'Lost',
            color: 'red',
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.stage,
                  operand: 'IS',
                  value: LeadStage.LOST,
                  type: 'SELECT',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: DASHBOARD_WIDGET_IDS.pipelineChart,
          title: 'Pipeline by Stage',
          type: 'GRAPH',
          objectUniversalIdentifier: LEAD_OBJECT_ID,
          gridPosition: { row: 2, column: 0, columnSpan: 6, rowSpan: 4 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.name,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              LEAD_FIELD_IDS.stage,
            color: 'blue',
            layout: 'VERTICAL',
            displayLegend: false,
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
          },
        },
        {
          universalIdentifier: DASHBOARD_WIDGET_IDS.sourceChart,
          title: 'Source Breakdown',
          type: 'GRAPH',
          objectUniversalIdentifier: LEAD_OBJECT_ID,
          gridPosition: { row: 2, column: 6, columnSpan: 3, rowSpan: 4 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.name,
            aggregateOperation: AggregateOperations.COUNT,
            groupByFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.source,
            displayLegend: true,
            showCenterMetric: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
          },
        },
        {
          universalIdentifier: DASHBOARD_WIDGET_IDS.notifications,
          title: 'Notifications',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 6, column: 0, columnSpan: 12, rowSpan: 3 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              NOTIFICATIONS_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
