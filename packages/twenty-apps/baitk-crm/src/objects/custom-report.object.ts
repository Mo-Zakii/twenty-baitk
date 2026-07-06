import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  CUSTOM_REPORT_FIELD_IDS,
  CUSTOM_REPORT_OBJECT_ID,
} from 'src/constants/uuids';

export { CUSTOM_REPORT_OBJECT_ID, CUSTOM_REPORT_FIELD_IDS };

export default defineObject({
  universalIdentifier: CUSTOM_REPORT_OBJECT_ID,
  nameSingular: 'baitkCustomReport',
  namePlural: 'baitkCustomReports',
  labelSingular: 'Custom Report',
  labelPlural: 'Custom Reports',
  description: 'Saved report configuration for BAITK CRM',
  icon: 'IconChartBar',
  labelIdentifierFieldMetadataUniversalIdentifier: CUSTOM_REPORT_FIELD_IDS.name,
  fields: [
    {
      universalIdentifier: CUSTOM_REPORT_FIELD_IDS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Report Name',
      icon: 'IconChartBar',
    },
    {
      universalIdentifier: CUSTOM_REPORT_FIELD_IDS.config,
      type: FieldType.RAW_JSON,
      name: 'config',
      label: 'Configuration',
      icon: 'IconSettings',
      isNullable: true,
    },
  ],
});
