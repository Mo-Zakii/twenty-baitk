import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  BAITK_NOTIFICATION_FIELD_IDS,
  BAITK_NOTIFICATION_OBJECT_ID,
  LEAD_OBJECT_ID,
  NOTIFICATIONS_ON_LEAD_FIELD_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: NOTIFICATIONS_ON_LEAD_FIELD_ID,
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'notifications',
  label: 'Notifications',
  icon: 'IconBell',
  relationTargetObjectMetadataUniversalIdentifier: BAITK_NOTIFICATION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    BAITK_NOTIFICATION_FIELD_IDS.lead,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
