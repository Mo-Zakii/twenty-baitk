import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  COMMENTS_ON_LEAD_FIELD_ID,
  LEAD_COMMENT_FIELD_IDS,
  LEAD_COMMENT_OBJECT_ID,
  LEAD_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: LEAD_COMMENT_FIELD_IDS.lead,
  objectUniversalIdentifier: LEAD_COMMENT_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'lead',
  label: 'Lead',
  icon: 'IconUserSearch',
  relationTargetObjectMetadataUniversalIdentifier: LEAD_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: COMMENTS_ON_LEAD_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'leadId',
  },
});
