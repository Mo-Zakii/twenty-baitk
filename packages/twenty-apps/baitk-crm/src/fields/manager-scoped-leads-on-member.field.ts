import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  MANAGER_SCOPED_LEADS_ON_MEMBER_FIELD_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: MANAGER_SCOPED_LEADS_ON_MEMBER_FIELD_ID,
  objectUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'teamManagerScopedLeads',
  label: 'Team Manager Scoped Leads',
  icon: 'IconUserSearch',
  relationTargetObjectMetadataUniversalIdentifier: LEAD_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    LEAD_FIELD_IDS.teamManagerScope,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
