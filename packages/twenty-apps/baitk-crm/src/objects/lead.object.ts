import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  LEAD_STAGE_OPTION_IDS,
} from 'src/constants/uuids';

export enum LeadStage {
  FRESH = 'FRESH',
  NO_ANSWER = 'NO_ANSWER',
  CALL_BACK = 'CALL_BACK',
  POTENTIAL = 'POTENTIAL',
  MEETING = 'MEETING',
  WON = 'WON',
  LOST = 'LOST',
}

export { LEAD_OBJECT_ID, LEAD_FIELD_IDS };

export default defineObject({
  universalIdentifier: LEAD_OBJECT_ID,
  nameSingular: 'lead',
  namePlural: 'leads',
  labelSingular: 'Lead',
  labelPlural: 'Leads',
  description: 'Real estate lead',
  icon: 'IconUserSearch',
  labelIdentifierFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.name,
  fields: [
    {
      universalIdentifier: LEAD_FIELD_IDS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconUser',
    },
    {
      universalIdentifier: LEAD_FIELD_IDS.phone,
      type: FieldType.PHONES,
      name: 'phone',
      label: 'Phone',
      icon: 'IconPhone',
    },
    {
      universalIdentifier: LEAD_FIELD_IDS.email,
      type: FieldType.EMAILS,
      name: 'email',
      label: 'Email',
      icon: 'IconMail',
      isNullable: true,
    },
    {
      universalIdentifier: LEAD_FIELD_IDS.source,
      type: FieldType.TEXT,
      name: 'source',
      label: 'Source',
      icon: 'IconTarget',
      isNullable: true,
    },
    {
      universalIdentifier: LEAD_FIELD_IDS.budget,
      type: FieldType.TEXT,
      name: 'budget',
      label: 'Budget',
      icon: 'IconCurrencyDollar',
      isNullable: true,
    },
    {
      universalIdentifier: LEAD_FIELD_IDS.compound,
      type: FieldType.TEXT,
      name: 'compound',
      label: 'Compound',
      icon: 'IconBuilding',
      isNullable: true,
    },
    {
      universalIdentifier: LEAD_FIELD_IDS.stage,
      type: FieldType.SELECT,
      name: 'stage',
      label: 'Stage',
      icon: 'IconStairs',
      defaultValue: `'${LeadStage.FRESH}'`,
      options: [
        {
          id: LEAD_STAGE_OPTION_IDS.fresh,
          value: LeadStage.FRESH,
          label: 'Fresh',
          position: 0,
          color: 'blue',
        },
        {
          id: LEAD_STAGE_OPTION_IDS.noAnswer,
          value: LeadStage.NO_ANSWER,
          label: 'No Answer',
          position: 1,
          color: 'gray',
        },
        {
          id: LEAD_STAGE_OPTION_IDS.callBack,
          value: LeadStage.CALL_BACK,
          label: 'Call Back',
          position: 2,
          color: 'orange',
        },
        {
          id: LEAD_STAGE_OPTION_IDS.potential,
          value: LeadStage.POTENTIAL,
          label: 'Potential',
          position: 3,
          color: 'purple',
        },
        {
          id: LEAD_STAGE_OPTION_IDS.meeting,
          value: LeadStage.MEETING,
          label: 'Meeting',
          position: 4,
          color: 'sky',
        },
        {
          id: LEAD_STAGE_OPTION_IDS.won,
          value: LeadStage.WON,
          label: 'Won',
          position: 5,
          color: 'green',
        },
        {
          id: LEAD_STAGE_OPTION_IDS.lost,
          value: LeadStage.LOST,
          label: 'Lost',
          position: 6,
          color: 'red',
        },
      ],
    },
  ],
});
