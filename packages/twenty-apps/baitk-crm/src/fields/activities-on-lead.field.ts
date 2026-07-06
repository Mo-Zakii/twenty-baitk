import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';
import {
  ACTIVITIES_ON_LEAD_FIELD_ID,
  LEAD_ACTIVITY_FIELD_IDS,
  LEAD_ACTIVITY_OBJECT_ID,
  LEAD_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: ACTIVITIES_ON_LEAD_FIELD_ID,
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'activities',
  label: 'Activities',
  icon: 'IconTimelineEvent',
  relationTargetObjectMetadataUniversalIdentifier: LEAD_ACTIVITY_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: LEAD_ACTIVITY_FIELD_IDS.lead,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
