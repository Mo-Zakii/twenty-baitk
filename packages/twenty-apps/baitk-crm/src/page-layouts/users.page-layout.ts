import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import {
  USERS_FRONT_COMPONENT_ID,
  USERS_PAGE_IDS,
  USERS_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export { USERS_PAGE_LAYOUT_ID };

export default definePageLayout({
  universalIdentifier: USERS_PAGE_LAYOUT_ID,
  name: 'Users',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: USERS_PAGE_IDS.tab,
      title: 'Users',
      position: 0,
      icon: 'IconUsers',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: USERS_PAGE_IDS.widget,
          title: 'User Management',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, columnSpan: 12, rowSpan: 10 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: USERS_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
