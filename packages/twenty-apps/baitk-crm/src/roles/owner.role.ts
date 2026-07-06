import { SystemPermissionFlag, defineRole } from 'twenty-sdk/define';
import {
  BAITK_NOTIFICATION_OBJECT_ID,
  CUSTOM_REPORT_OBJECT_ID,
  DISTRIBUTION_QUEUE_OBJECT_ID,
  INTEGRATION_OBJECT_ID,
  LEAD_COMMENT_OBJECT_ID,
  LEAD_OBJECT_ID,
  ROLE_IDS,
  TEAM_OBJECT_ID,
} from 'src/constants/uuids';

const fullLeadObjects = [
  LEAD_OBJECT_ID,
  LEAD_COMMENT_OBJECT_ID,
  TEAM_OBJECT_ID,
  BAITK_NOTIFICATION_OBJECT_ID,
  DISTRIBUTION_QUEUE_OBJECT_ID,
  INTEGRATION_OBJECT_ID,
  CUSTOM_REPORT_OBJECT_ID,
];

export default defineRole({
  universalIdentifier: ROLE_IDS.owner,
  label: 'Owner',
  description: 'Full access across the company',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: true,
  canBeAssignedToUsers: true,
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.WORKSPACE_MEMBERS,
    SystemPermissionFlag.ROLES,
    SystemPermissionFlag.IMPORT_CSV,
    SystemPermissionFlag.EXPORT_CSV,
    SystemPermissionFlag.VIEWS,
    SystemPermissionFlag.LAYOUTS,
    SystemPermissionFlag.WORKFLOWS,
    SystemPermissionFlag.SEND_EMAIL_TOOL,
    SystemPermissionFlag.CONNECTED_ACCOUNTS,
    SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
  ],
  objectPermissions: fullLeadObjects.map((objectUniversalIdentifier) => ({
    objectUniversalIdentifier,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
  })),
});
