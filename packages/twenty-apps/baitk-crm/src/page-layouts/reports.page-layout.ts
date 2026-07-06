import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import {
  REPORTS_FRONT_COMPONENT_ID,
  REPORTS_PAGE_IDS,
  REPORTS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export { REPORTS_PAGE_LAYOUT_ID };

export default definePageLayout({
  universalIdentifier: REPORTS_PAGE_LAYOUT_ID,
  name: 'BAITK Reports',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: REPORTS_PAGE_IDS.tab,
      title: 'Reports',
      position: 0,
      icon: 'IconChartBar',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: REPORTS_PAGE_IDS.widget,
          title: 'Reports',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, columnSpan: 12, rowSpan: 6 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: REPORTS_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
