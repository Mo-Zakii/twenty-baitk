import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import {
  DISTRIBUTION_FRONT_COMPONENT_ID,
  DISTRIBUTION_PAGE_IDS,
  DISTRIBUTION_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export { DISTRIBUTION_PAGE_LAYOUT_ID };

export default definePageLayout({
  universalIdentifier: DISTRIBUTION_PAGE_LAYOUT_ID,
  name: 'Distribution Settings',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: DISTRIBUTION_PAGE_IDS.tab,
      title: 'Distribution',
      position: 0,
      icon: 'IconRotate',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: DISTRIBUTION_PAGE_IDS.widget,
          title: 'Round-Robin Queue',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, columnSpan: 12, rowSpan: 8 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              DISTRIBUTION_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
