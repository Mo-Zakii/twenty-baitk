import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  DISTRIBUTION_QUEUE_FIELD_IDS,
  DISTRIBUTION_QUEUE_OBJECT_ID,
} from 'src/constants/uuids';

export { DISTRIBUTION_QUEUE_OBJECT_ID, DISTRIBUTION_QUEUE_FIELD_IDS };

export default defineObject({
  universalIdentifier: DISTRIBUTION_QUEUE_OBJECT_ID,
  nameSingular: 'distributionQueueEntry',
  namePlural: 'distributionQueueEntries',
  labelSingular: 'Distribution Queue Entry',
  labelPlural: 'Distribution Queue',
  description: 'Round-robin lead assignment cycle',
  icon: 'IconRotate',
  labelIdentifierFieldMetadataUniversalIdentifier:
    DISTRIBUTION_QUEUE_FIELD_IDS.name,
  fields: [
    {
      universalIdentifier: DISTRIBUTION_QUEUE_FIELD_IDS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconUser',
    },
    {
      universalIdentifier: DISTRIBUTION_QUEUE_FIELD_IDS.queueOrder,
      type: FieldType.NUMBER,
      name: 'queueOrder',
      label: 'Queue Order',
      icon: 'IconListNumbers',
      defaultValue: 0,
    },
    {
      universalIdentifier: DISTRIBUTION_QUEUE_FIELD_IDS.lastAssignedAt,
      type: FieldType.DATE_TIME,
      name: 'lastAssignedAt',
      label: 'Last Assigned At',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
