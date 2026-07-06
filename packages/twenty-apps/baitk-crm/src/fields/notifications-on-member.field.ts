import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  BAITK_NOTIFICATION_FIELD_IDS,
  BAITK_NOTIFICATION_OBJECT_ID,
  NOTIFICATIONS_ON_MEMBER_FIELD_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: NOTIFICATIONS_ON_MEMBER_FIELD_ID,
  objectUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'baitkNotifications',
  label: 'BAITK Notifications',
  icon: 'IconBell',
  relationTargetObjectMetadataUniversalIdentifier: BAITK_NOTIFICATION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    BAITK_NOTIFICATION_FIELD_IDS.recipient,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
