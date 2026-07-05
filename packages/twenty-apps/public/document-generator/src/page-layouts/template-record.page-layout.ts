import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_NOTE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  TEMPLATE_NOTE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  TEMPLATE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Mirror the standard Note object's record page: a single "Note" tab holding
// the native rich-text editor for the object's RICH_TEXT `body` field (the
// FIELD_RICH_TEXT widget binds to it automatically). The record's own fields
// still render in the left summary panel.
export default definePageLayout({
  universalIdentifier: TEMPLATE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Template record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: TEMPLATE_NOTE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Note',
      position: 0,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            TEMPLATE_NOTE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Note',
          type: 'FIELD_RICH_TEXT',
          configuration: {
            configurationType: 'FIELD_RICH_TEXT',
          },
        },
      ],
    },
  ],
});
