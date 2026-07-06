import { SystemPermissionFlag, defineRole } from 'twenty-sdk/define';
import {
  DISTRIBUTION_QUEUE_OBJECT_ID,
  LEAD_COMMENT_OBJECT_ID,
  LEAD_OBJECT_ID,
  ROLE_IDS,
  TEAM_OBJECT_ID,
} from 'src/constants/uuids';
import { readOnlyCustomReportPermission } from 'src/roles/shared/lead-object-permission.util';

export const MANAGER_ROLE_LABEL = 'Manager';

export default defineRole({
  universalIdentifier: ROLE_IDS.manager,
  label: MANAGER_ROLE_LABEL,
  description:
    'Team-scoped leads and reports; can distribute but not delete leads or export CSV',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.VIEWS,
    SystemPermissionFlag.LAYOUTS,
  ],
  objectPermissions: [
    ...[LEAD_OBJECT_ID, LEAD_COMMENT_OBJECT_ID, TEAM_OBJECT_ID].map(
      (objectUniversalIdentifier) => ({
        objectUniversalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      }),
    ),
    {
      objectUniversalIdentifier: DISTRIBUTION_QUEUE_OBJECT_ID,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    readOnlyCustomReportPermission,
  ],
});
