import { defineObject, FieldType } from 'twenty-sdk/define';
import { TEAM_FIELD_IDS, TEAM_OBJECT_ID } from 'src/constants/uuids';

export { TEAM_OBJECT_ID, TEAM_FIELD_IDS };

export default defineObject({
  universalIdentifier: TEAM_OBJECT_ID,
  nameSingular: 'baitkTeam',
  namePlural: 'baitkTeams',
  labelSingular: 'Team',
  labelPlural: 'Teams',
  description: 'Sales team for lead distribution',
  icon: 'IconUsersGroup',
  labelIdentifierFieldMetadataUniversalIdentifier: TEAM_FIELD_IDS.name,
  fields: [
    {
      universalIdentifier: TEAM_FIELD_IDS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Team Name',
      icon: 'IconUsers',
    },
  ],
});
