import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  LEAD_ACTIVITY_FIELD_IDS,
  LEAD_ACTIVITY_OBJECT_ID,
} from 'src/constants/uuids';

export { LEAD_ACTIVITY_OBJECT_ID, LEAD_ACTIVITY_FIELD_IDS };

export default defineObject({
  universalIdentifier: LEAD_ACTIVITY_OBJECT_ID,
  nameSingular: 'leadActivity',
  namePlural: 'leadActivities',
  labelSingular: 'Lead Activity',
  labelPlural: 'Lead Activities',
  description: 'Stage change and activity history for leads',
  icon: 'IconTimelineEvent',
  labelIdentifierFieldMetadataUniversalIdentifier:
    LEAD_ACTIVITY_FIELD_IDS.toStage,
  fields: [
    {
      universalIdentifier: LEAD_ACTIVITY_FIELD_IDS.fromStage,
      type: FieldType.TEXT,
      name: 'fromStage',
      label: 'From Stage',
      icon: 'IconArrowRight',
      isNullable: true,
    },
    {
      universalIdentifier: LEAD_ACTIVITY_FIELD_IDS.toStage,
      type: FieldType.TEXT,
      name: 'toStage',
      label: 'To Stage',
      icon: 'IconArrowRight',
      isNullable: true,
    },
    {
      universalIdentifier: LEAD_ACTIVITY_FIELD_IDS.note,
      type: FieldType.TEXT,
      name: 'note',
      label: 'Note',
      icon: 'IconNotes',
      isNullable: true,
    },
  ],
});
