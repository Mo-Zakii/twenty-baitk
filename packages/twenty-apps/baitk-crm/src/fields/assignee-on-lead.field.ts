import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  ASSIGNED_LEADS_ON_MEMBER_FIELD_ID,
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: LEAD_FIELD_IDS.assignee,
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignee',
  label: 'Assignee',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    ASSIGNED_LEADS_ON_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'assigneeId',
  },
});
