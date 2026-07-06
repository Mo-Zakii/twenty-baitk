import { defineRole } from 'twenty-sdk/define';
import {
  DISTRIBUTION_QUEUE_OBJECT_ID,
  LEAD_COMMENT_OBJECT_ID,
  LEAD_OBJECT_ID,
  ROLE_IDS,
} from 'src/constants/uuids';
import { readOnlyCustomReportPermission } from 'src/roles/shared/lead-object-permission.util';

export const TEAM_LEADER_ROLE_LABEL = 'Team Leader';

export default defineRole({
  universalIdentifier: ROLE_IDS.teamLeader,
  label: TEAM_LEADER_ROLE_LABEL,
  description:
    'Team-scoped leads and reports; can distribute but not delete leads',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  objectPermissions: [
    ...[LEAD_OBJECT_ID, LEAD_COMMENT_OBJECT_ID].map(
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
