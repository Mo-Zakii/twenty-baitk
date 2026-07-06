import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  MANAGED_TEAMS_ON_MEMBER_FIELD_ID,
  TEAM_FIELD_IDS,
  TEAM_OBJECT_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: TEAM_FIELD_IDS.manager,
  objectUniversalIdentifier: TEAM_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'manager',
  label: 'Manager',
  icon: 'IconUserCog',
  relationTargetObjectMetadataUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    MANAGED_TEAMS_ON_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'managerId',
    isNullable: true,
  },
});
