import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import {
  INTEGRATIONS_FRONT_COMPONENT_ID,
  INTEGRATIONS_PAGE_IDS,
  INTEGRATIONS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export { INTEGRATIONS_PAGE_LAYOUT_ID };

export default definePageLayout({
  universalIdentifier: INTEGRATIONS_PAGE_LAYOUT_ID,
  name: 'Integrations',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: INTEGRATIONS_PAGE_IDS.tab,
      title: 'Integrations',
      position: 0,
      icon: 'IconPlug',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: INTEGRATIONS_PAGE_IDS.widget,
          title: 'Google Sheets to Leads',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, columnSpan: 12, rowSpan: 10 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              INTEGRATIONS_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
