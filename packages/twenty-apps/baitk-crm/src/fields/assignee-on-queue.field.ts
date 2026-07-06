import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  DISTRIBUTION_QUEUE_FIELD_IDS,
  DISTRIBUTION_QUEUE_OBJECT_ID,
  QUEUE_ON_MEMBER_FIELD_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: DISTRIBUTION_QUEUE_FIELD_IDS.assignee,
  objectUniversalIdentifier: DISTRIBUTION_QUEUE_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignee',
  label: 'Salesperson',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: QUEUE_ON_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'assigneeId',
  },
});
