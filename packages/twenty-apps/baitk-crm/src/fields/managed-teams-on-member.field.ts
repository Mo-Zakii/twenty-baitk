import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  MANAGED_TEAMS_ON_MEMBER_FIELD_ID,
  TEAM_FIELD_IDS,
  TEAM_OBJECT_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: MANAGED_TEAMS_ON_MEMBER_FIELD_ID,
  objectUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'managedTeams',
  label: 'Managed Teams',
  icon: 'IconUsersGroup',
  relationTargetObjectMetadataUniversalIdentifier: TEAM_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: TEAM_FIELD_IDS.manager,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
