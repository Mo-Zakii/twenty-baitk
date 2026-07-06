import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';
import {
  LEADS_ON_TEAM_FIELD_ID,
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  TEAM_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: LEADS_ON_TEAM_FIELD_ID,
  objectUniversalIdentifier: TEAM_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'leads',
  label: 'Leads',
  icon: 'IconUserSearch',
  relationTargetObjectMetadataUniversalIdentifier: LEAD_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.team,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
