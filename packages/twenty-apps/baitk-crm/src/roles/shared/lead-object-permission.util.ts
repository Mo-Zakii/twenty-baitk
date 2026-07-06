import {
  CUSTOM_REPORT_OBJECT_ID,
  LEAD_FIELD_IDS,
  LEAD_OBJECT_ID,
} from 'src/constants/uuids';

export const readOnlyCustomReportPermission = {
  objectUniversalIdentifier: CUSTOM_REPORT_OBJECT_ID,
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
} as const;

export const fullCustomReportBuilderPermission = {
  objectUniversalIdentifier: CUSTOM_REPORT_OBJECT_ID,
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
} as const;

const readOnlyLeadField = (fieldUniversalIdentifier: string) => ({
  objectUniversalIdentifier: LEAD_OBJECT_ID,
  fieldUniversalIdentifier,
  canReadFieldValue: true,
  canUpdateFieldValue: false,
});

export const marketingLeadFieldPermissions = [
  readOnlyLeadField(LEAD_FIELD_IDS.name),
  readOnlyLeadField(LEAD_FIELD_IDS.phone),
  readOnlyLeadField(LEAD_FIELD_IDS.email),
  readOnlyLeadField(LEAD_FIELD_IDS.source),
  readOnlyLeadField(LEAD_FIELD_IDS.budget),
  readOnlyLeadField(LEAD_FIELD_IDS.compound),
  readOnlyLeadField(LEAD_FIELD_IDS.assignee),
  readOnlyLeadField(LEAD_FIELD_IDS.team),
  readOnlyLeadField(LEAD_FIELD_IDS.teamLeaderScope),
  readOnlyLeadField(LEAD_FIELD_IDS.teamManagerScope),
  {
    objectUniversalIdentifier: LEAD_OBJECT_ID,
    fieldUniversalIdentifier: LEAD_FIELD_IDS.stage,
    canReadFieldValue: true,
    canUpdateFieldValue: true,
  },
];

export const salesLeadFieldPermissions = [
  readOnlyLeadField(LEAD_FIELD_IDS.assignee),
  readOnlyLeadField(LEAD_FIELD_IDS.team),
  readOnlyLeadField(LEAD_FIELD_IDS.teamLeaderScope),
  readOnlyLeadField(LEAD_FIELD_IDS.teamManagerScope),
];
