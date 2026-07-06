import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  TEAM_FIELD_IDS,
  TEAM_OBJECT_ID,
  TEAMS_VIEW_FIELD_IDS,
  TEAMS_VIEW_ID,
} from 'src/constants/uuids';

export { TEAMS_VIEW_ID };

export default defineView({
  universalIdentifier: TEAMS_VIEW_ID,
  name: 'Teams',
  objectUniversalIdentifier: TEAM_OBJECT_ID,
  icon: 'IconUsersGroup',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: TEAMS_VIEW_FIELD_IDS.name,
      fieldMetadataUniversalIdentifier: TEAM_FIELD_IDS.name,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: TEAMS_VIEW_FIELD_IDS.leader,
      fieldMetadataUniversalIdentifier: TEAM_FIELD_IDS.leader,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: TEAMS_VIEW_FIELD_IDS.manager,
      fieldMetadataUniversalIdentifier: TEAM_FIELD_IDS.manager,
      position: 2,
      isVisible: true,
      size: 180,
    },
  ],
});
