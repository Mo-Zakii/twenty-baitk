import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  ALL_LEADS_VIEW_FIELD_IDS,
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  LEADS_VIEW_ID,
} from 'src/constants/uuids';

export { LEADS_VIEW_ID };

const field = (
  universalIdentifier: string,
  fieldMetadataUniversalIdentifier: string,
  position: number,
  size = 140,
) => ({
  universalIdentifier,
  fieldMetadataUniversalIdentifier,
  position,
  isVisible: true,
  size,
});

export default defineView({
  universalIdentifier: LEADS_VIEW_ID,
  name: 'All Leads',
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  icon: 'IconUserSearch',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    field(ALL_LEADS_VIEW_FIELD_IDS.name, LEAD_FIELD_IDS.name, 0, 180),
    field(ALL_LEADS_VIEW_FIELD_IDS.phone, LEAD_FIELD_IDS.phone, 1),
    field(ALL_LEADS_VIEW_FIELD_IDS.source, LEAD_FIELD_IDS.source, 2),
    field(ALL_LEADS_VIEW_FIELD_IDS.stage, LEAD_FIELD_IDS.stage, 3, 120),
    field(ALL_LEADS_VIEW_FIELD_IDS.assignee, LEAD_FIELD_IDS.assignee, 4, 150),
    field(ALL_LEADS_VIEW_FIELD_IDS.compound, LEAD_FIELD_IDS.compound, 5),
  ],
});
