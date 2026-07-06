import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  CUSTOM_REPORT_FIELD_IDS,
  CUSTOM_REPORT_OBJECT_ID,
  CUSTOM_REPORTS_VIEW_FIELD_IDS,
  CUSTOM_REPORTS_VIEW_ID,
} from 'src/constants/uuids';

export { CUSTOM_REPORTS_VIEW_ID };

const field = (
  universalIdentifier: string,
  fieldMetadataUniversalIdentifier: string,
  position: number,
  size = 200,
) => ({
  universalIdentifier,
  fieldMetadataUniversalIdentifier,
  position,
  isVisible: true,
  size,
});

export default defineView({
  universalIdentifier: CUSTOM_REPORTS_VIEW_ID,
  name: 'All Custom Reports',
  objectUniversalIdentifier: CUSTOM_REPORT_OBJECT_ID,
  icon: 'IconChartBar',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    field(
      CUSTOM_REPORTS_VIEW_FIELD_IDS.name,
      CUSTOM_REPORT_FIELD_IDS.name,
      0,
      280,
    ),
  ],
});
