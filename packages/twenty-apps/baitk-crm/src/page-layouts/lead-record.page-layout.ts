import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import {
  LEAD_OBJECT_ID,
  LEAD_RECORD_PAGE_IDS,
  LEAD_RECORD_PAGE_LAYOUT_ID,
} from 'src/constants/uuids';

export { LEAD_RECORD_PAGE_LAYOUT_ID };

export default definePageLayout({
  universalIdentifier: LEAD_RECORD_PAGE_LAYOUT_ID,
  name: 'Lead Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  tabs: [
    {
      universalIdentifier: LEAD_RECORD_PAGE_IDS.infoTab,
      title: 'Info',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: LEAD_RECORD_PAGE_IDS.infoWidget,
          title: 'Lead Details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: LEAD_RECORD_PAGE_IDS.commentsTab,
      title: 'Comments',
      position: 50,
      icon: 'IconMessage',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: LEAD_RECORD_PAGE_IDS.commentsWidget,
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
  ],
});
