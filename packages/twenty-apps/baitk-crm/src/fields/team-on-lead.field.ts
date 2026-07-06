import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  LEADS_ON_TEAM_FIELD_ID,
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  TEAM_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: LEAD_FIELD_IDS.team,
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'team',
  label: 'Team',
  icon: 'IconUsersGroup',
  relationTargetObjectMetadataUniversalIdentifier: TEAM_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: LEADS_ON_TEAM_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'teamId',
  },
});
