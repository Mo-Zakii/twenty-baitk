import { SystemPermissionFlag, defineRole } from 'twenty-sdk/define';
import { LEAD_OBJECT_ID, ROLE_IDS } from 'src/constants/uuids';
import {
  fullCustomReportBuilderPermission,
  marketingLeadFieldPermissions,
} from 'src/roles/shared/lead-object-permission.util';

export default defineRole({
  universalIdentifier: ROLE_IDS.marketing,
  label: 'Marketing',
  description:
    'Full reports and custom dashboards, can add leads, cannot distribute or delete',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.IMPORT_CSV,
    SystemPermissionFlag.EXPORT_CSV,
    SystemPermissionFlag.VIEWS,
    SystemPermissionFlag.LAYOUTS,
  ],
  objectPermissions: [
    {
      objectUniversalIdentifier: LEAD_OBJECT_ID,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    fullCustomReportBuilderPermission,
  ],
  fieldPermissions: marketingLeadFieldPermissions,
});
