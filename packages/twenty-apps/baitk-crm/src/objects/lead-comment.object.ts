import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  LEAD_COMMENT_FIELD_IDS,
  LEAD_COMMENT_OBJECT_ID,
} from 'src/constants/uuids';

export { LEAD_COMMENT_OBJECT_ID, LEAD_COMMENT_FIELD_IDS };

export default defineObject({
  universalIdentifier: LEAD_COMMENT_OBJECT_ID,
  nameSingular: 'leadComment',
  namePlural: 'leadComments',
  labelSingular: 'Lead Comment',
  labelPlural: 'Lead Comments',
  description: 'Comments on leads',
  icon: 'IconMessage',
  labelIdentifierFieldMetadataUniversalIdentifier: LEAD_COMMENT_FIELD_IDS.text,
  fields: [
    {
      universalIdentifier: LEAD_COMMENT_FIELD_IDS.text,
      type: FieldType.TEXT,
      name: 'text',
      label: 'Comment',
      icon: 'IconMessage',
    },
  ],
});
