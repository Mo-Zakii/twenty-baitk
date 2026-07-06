import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  BAITK_NOTIFICATION_FIELD_IDS,
  BAITK_NOTIFICATION_OBJECT_ID,
  LEAD_OBJECT_ID,
  NOTIFICATIONS_ON_LEAD_FIELD_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: BAITK_NOTIFICATION_FIELD_IDS.lead,
  objectUniversalIdentifier: BAITK_NOTIFICATION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'lead',
  label: 'Lead',
  icon: 'IconUserSearch',
  relationTargetObjectMetadataUniversalIdentifier: LEAD_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: NOTIFICATIONS_ON_LEAD_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'leadId',
  },
});
