import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import {
  TEAMS_FRONT_COMPONENT_ID,
  TEAMS_PAGE_IDS,
  TEAMS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export { TEAMS_PAGE_LAYOUT_ID };

export default definePageLayout({
  universalIdentifier: TEAMS_PAGE_LAYOUT_ID,
  name: 'BAITK Teams',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: TEAMS_PAGE_IDS.tab,
      title: 'Teams',
      position: 0,
      icon: 'IconUsersGroup',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: TEAMS_PAGE_IDS.widget,
          title: 'Team Management',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, columnSpan: 12, rowSpan: 10 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: TEAMS_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
