import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  MANAGER_SCOPED_LEADS_ON_MEMBER_FIELD_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: LEAD_FIELD_IDS.teamManagerScope,
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'teamManagerScope',
  label: 'Team Manager Scope',
  icon: 'IconUserCog',
  relationTargetObjectMetadataUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    MANAGER_SCOPED_LEADS_ON_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'teamManagerScopeId',
    isNullable: true,
  },
});
