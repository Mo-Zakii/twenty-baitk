import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  DISTRIBUTION_QUEUE_FIELD_IDS,
  DISTRIBUTION_QUEUE_OBJECT_ID,
  QUEUE_ON_MEMBER_FIELD_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from 'src/constants/uuids';

export default defineField({
  universalIdentifier: QUEUE_ON_MEMBER_FIELD_ID,
  objectUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'distributionQueueEntries',
  label: 'Distribution Queue Entries',
  icon: 'IconRotate',
  relationTargetObjectMetadataUniversalIdentifier:
    DISTRIBUTION_QUEUE_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    DISTRIBUTION_QUEUE_FIELD_IDS.assignee,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
