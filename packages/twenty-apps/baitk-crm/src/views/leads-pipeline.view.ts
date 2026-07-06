import { defineView, ViewType } from 'twenty-sdk/define';
import {
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
  LEADS_PIPELINE_VIEW_ID,
  PIPELINE_GROUP_IDS,
  PIPELINE_VIEW_FIELD_IDS,
} from 'src/constants/uuids';
import { LeadStage } from 'src/objects/lead.object';

export { LEADS_PIPELINE_VIEW_ID };

export default defineView({
  universalIdentifier: LEADS_PIPELINE_VIEW_ID,
  name: 'Pipeline',
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 2,
  mainGroupByFieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.stage,
  fields: [
    {
      universalIdentifier: PIPELINE_VIEW_FIELD_IDS.name,
      fieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.name,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: PIPELINE_VIEW_FIELD_IDS.phone,
      fieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.phone,
      position: 1,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: PIPELINE_VIEW_FIELD_IDS.assignee,
      fieldMetadataUniversalIdentifier: LEAD_FIELD_IDS.assignee,
      position: 2,
      isVisible: true,
      size: 140,
    },
  ],
  groups: [
    {
      universalIdentifier: PIPELINE_GROUP_IDS.fresh,
      fieldValue: LeadStage.FRESH,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: PIPELINE_GROUP_IDS.noAnswer,
      fieldValue: LeadStage.NO_ANSWER,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: PIPELINE_GROUP_IDS.callBack,
      fieldValue: LeadStage.CALL_BACK,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: PIPELINE_GROUP_IDS.potential,
      fieldValue: LeadStage.POTENTIAL,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: PIPELINE_GROUP_IDS.meeting,
      fieldValue: LeadStage.MEETING,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: PIPELINE_GROUP_IDS.won,
      fieldValue: LeadStage.WON,
      position: 5,
      isVisible: true,
    },
    {
      universalIdentifier: PIPELINE_GROUP_IDS.lost,
      fieldValue: LeadStage.LOST,
      position: 6,
      isVisible: true,
    },
  ],
});
