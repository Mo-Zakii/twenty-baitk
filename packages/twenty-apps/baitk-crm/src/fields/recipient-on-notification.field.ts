import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  BAITK_NOTIFICATION_FIELD_IDS,
  BAITK_NOTIFICATION_OBJECT_ID,
  NOTIFICATIONS_ON_MEMBER_FIELD_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: BAITK_NOTIFICATION_FIELD_IDS.recipient,
  objectUniversalIdentifier: BAITK_NOTIFICATION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'recipient',
  label: 'Recipient',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    NOTIFICATIONS_ON_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'recipientId',
    isNullable: true,
  },
});
