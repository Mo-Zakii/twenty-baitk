import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';
import {
  COMMENTS_ON_LEAD_FIELD_ID,
  LEAD_COMMENT_FIELD_IDS,
  LEAD_COMMENT_OBJECT_ID,
  LEAD_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: COMMENTS_ON_LEAD_FIELD_ID,
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'comments',
  label: 'Comments',
  icon: 'IconMessage',
  relationTargetObjectMetadataUniversalIdentifier: LEAD_COMMENT_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: LEAD_COMMENT_FIELD_IDS.lead,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
