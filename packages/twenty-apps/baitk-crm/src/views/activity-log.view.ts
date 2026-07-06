import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  ACTIVITIES_VIEW_ID,
  ACTIVITY_VIEW_FIELD_IDS,
  LEAD_ACTIVITY_FIELD_IDS,
  LEAD_ACTIVITY_OBJECT_ID,
} from 'src/constants/uuids';

export { ACTIVITIES_VIEW_ID };

export default defineView({
  universalIdentifier: ACTIVITIES_VIEW_ID,
  name: 'Activity Log',
  objectUniversalIdentifier: LEAD_ACTIVITY_OBJECT_ID,
  icon: 'IconTimelineEvent',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: ACTIVITY_VIEW_FIELD_IDS.toStage,
      fieldMetadataUniversalIdentifier: LEAD_ACTIVITY_FIELD_IDS.toStage,
      position: 0,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: ACTIVITY_VIEW_FIELD_IDS.fromStage,
      fieldMetadataUniversalIdentifier: LEAD_ACTIVITY_FIELD_IDS.fromStage,
      position: 1,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: ACTIVITY_VIEW_FIELD_IDS.note,
      fieldMetadataUniversalIdentifier: LEAD_ACTIVITY_FIELD_IDS.note,
      position: 2,
      isVisible: true,
      size: 260,
    },
  ],
});
