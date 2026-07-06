import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';
import {
  ASSIGNED_LEADS_ON_MEMBER_FIELD_ID,
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: ASSIGNED_LEADS_ON_MEMBER_FIELD_ID,
  objectUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'assignedLeads',
  label: 'Assigned Leads',
  icon: 'IconUserSearch',
  relationTargetObjectMetadataUniversalIdentifier: LEAD_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.assignee,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
