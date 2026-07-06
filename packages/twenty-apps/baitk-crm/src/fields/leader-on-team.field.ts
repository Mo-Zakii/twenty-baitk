import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  LED_TEAMS_ON_MEMBER_FIELD_ID,
  TEAM_FIELD_IDS,
  TEAM_OBJECT_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: TEAM_FIELD_IDS.leader,
  objectUniversalIdentifier: TEAM_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'leader',
  label: 'Team Leader',
  icon: 'IconUserStar',
  relationTargetObjectMetadataUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: LED_TEAMS_ON_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'leaderId',
    isNullable: true,
  },
});
