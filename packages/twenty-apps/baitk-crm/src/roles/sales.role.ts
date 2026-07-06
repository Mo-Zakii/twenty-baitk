import { defineRole } from 'twenty-sdk/define';
import { LEAD_COMMENT_OBJECT_ID, LEAD_OBJECT_ID, ROLE_IDS } from 'src/constants/uuids';
import { salesLeadFieldPermissions } from 'src/roles/shared/lead-object-permission.util';

export const SALES_ROLE_LABEL = 'Sales';

export default defineRole({
  universalIdentifier: ROLE_IDS.sales,
  label: SALES_ROLE_LABEL,
  description: 'Own assigned leads only',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  objectPermissions: [
    {
      objectUniversalIdentifier: LEAD_OBJECT_ID,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: LEAD_COMMENT_OBJECT_ID,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: salesLeadFieldPermissions,
});
