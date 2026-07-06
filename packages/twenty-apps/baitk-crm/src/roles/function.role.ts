import { SystemPermissionFlag, defineRole } from 'twenty-sdk/define';
import {
  BAITK_NOTIFICATION_OBJECT_ID,
  DISTRIBUTION_QUEUE_OBJECT_ID,
  INTEGRATION_OBJECT_ID,
  LEAD_ACTIVITY_OBJECT_ID,
  LEAD_COMMENT_OBJECT_ID,
  LEAD_OBJECT_ID,
  ROLE_IDS,
} from 'src/constants/uuids';

export default defineRole({
  universalIdentifier: ROLE_IDS.function,
  label: 'BAITK Function Role',
  description: 'Used by BAITK logic functions for automation',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.APPLICATIONS],
  objectPermissions: [
    LEAD_OBJECT_ID,
    LEAD_ACTIVITY_OBJECT_ID,
    LEAD_COMMENT_OBJECT_ID,
    BAITK_NOTIFICATION_OBJECT_ID,
    DISTRIBUTION_QUEUE_OBJECT_ID,
    INTEGRATION_OBJECT_ID,
  ].map((objectUniversalIdentifier) => ({
    objectUniversalIdentifier,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  })),
});
