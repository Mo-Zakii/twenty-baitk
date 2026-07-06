import { SystemPermissionFlag, defineRole } from 'twenty-sdk/define';
import {
  CUSTOM_REPORT_OBJECT_ID,
  DISTRIBUTION_QUEUE_OBJECT_ID,
  INTEGRATION_OBJECT_ID,
  LEAD_COMMENT_OBJECT_ID,
  LEAD_OBJECT_ID,
  ROLE_IDS,
  TEAM_OBJECT_ID,
} from 'src/constants/uuids';

export default defineRole({
  universalIdentifier: ROLE_IDS.operations,
  label: 'Operations',
  description:
    'Full company visibility; manages users, distribution, lead statuses, and CSV',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.WORKSPACE_MEMBERS,
    SystemPermissionFlag.ROLES,
    SystemPermissionFlag.IMPORT_CSV,
    SystemPermissionFlag.EXPORT_CSV,
    SystemPermissionFlag.VIEWS,
    SystemPermissionFlag.LAYOUTS,
    SystemPermissionFlag.SEND_EMAIL_TOOL,
    SystemPermissionFlag.CONNECTED_ACCOUNTS,
    SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
  ],
  objectPermissions: [
    LEAD_OBJECT_ID,
    LEAD_COMMENT_OBJECT_ID,
    TEAM_OBJECT_ID,
    DISTRIBUTION_QUEUE_OBJECT_ID,
    INTEGRATION_OBJECT_ID,
    CUSTOM_REPORT_OBJECT_ID,
  ].map((objectUniversalIdentifier) => ({
    objectUniversalIdentifier,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
  })),
});
