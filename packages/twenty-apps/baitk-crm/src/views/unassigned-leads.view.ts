import {
  defineView,
  ViewFilterOperand,
  ViewKey,
} from 'twenty-sdk/define';
import {
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  UNASSIGNED_LEADS_VIEW_FIELD_IDS,
  UNASSIGNED_LEADS_VIEW_ID,
} from 'src/constants/uuids';

export { UNASSIGNED_LEADS_VIEW_ID };

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
  universalIdentifier: UNASSIGNED_LEADS_VIEW_ID,
  name: 'Unassigned',
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  icon: 'IconAlertCircle',
  key: ViewKey.INDEX,
  position: 1,
  filters: [
    {
      universalIdentifier: UNASSIGNED_LEADS_VIEW_FIELD_IDS.filter,
      fieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.assignee,
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
      positionInViewFilterGroup: 0,
    },
  ],
  fields: [
    field(
      UNASSIGNED_LEADS_VIEW_FIELD_IDS.name,
      LEAD_FIELD_IDS.name,
      0,
      180,
    ),
    field(UNASSIGNED_LEADS_VIEW_FIELD_IDS.phone, LEAD_FIELD_IDS.phone, 1),
    field(UNASSIGNED_LEADS_VIEW_FIELD_IDS.source, LEAD_FIELD_IDS.source, 2),
    field(
      UNASSIGNED_LEADS_VIEW_FIELD_IDS.stage,
      LEAD_FIELD_IDS.stage,
      3,
      120,
    ),
    field(
      UNASSIGNED_LEADS_VIEW_FIELD_IDS.compound,
      LEAD_FIELD_IDS.compound,
      4,
    ),
  ],
});
