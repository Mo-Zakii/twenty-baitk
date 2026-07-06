import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  PermissionFlagType,
  WidgetType,
} from '~/generated-metadata/graphql';

type CanAccessNavigationMenuItemArgs = {
  navigationMenuItem: NavigationMenuItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: ViewWithRelations[];
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getObjectPermissionsForObject
  >[0];
  pageLayouts: PageLayout[];
  permissionFlags: PermissionFlagType[];
};

const WORKFLOW_OBJECT_NAME_SINGULARS = [
  'workflow',
  'workflowVersion',
  'workflowRun',
] as const;

const hasPermissionFlag = (
  permissionFlags: PermissionFlagType[],
  permissionFlag: PermissionFlagType,
) => permissionFlags.includes(permissionFlag);

const hasWorkflowsPermission = (permissionFlags: PermissionFlagType[]) =>
  hasPermissionFlag(permissionFlags, PermissionFlagType.WORKFLOWS);

// Owner / workspace Admin (canUpdateAllSettings) receive both flags
const hasFullWorkspaceNavigationAccess = (
  permissionFlags: PermissionFlagType[],
) =>
  hasPermissionFlag(permissionFlags, PermissionFlagType.WORKSPACE_MEMBERS) &&
  hasPermissionFlag(permissionFlags, PermissionFlagType.ROLES);

const isWorkflowObjectMetadataItem = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) =>
  WORKFLOW_OBJECT_NAME_SINGULARS.includes(
    objectMetadataItem.nameSingular as (typeof WORKFLOW_OBJECT_NAME_SINGULARS)[number],
  );

const canReadAllObjectMetadataIds = ({
  objectMetadataIds,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataIds: string[];
  objectPermissionsByObjectMetadataId: CanAccessNavigationMenuItemArgs['objectPermissionsByObjectMetadataId'];
}) =>
  objectMetadataIds.every((objectMetadataId) =>
    getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataId,
    ).canReadObjectRecords,
  );

const hasObjectReadByNameSingular = ({
  objectNameSingular,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  objectNameSingular: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: CanAccessNavigationMenuItemArgs['objectPermissionsByObjectMetadataId'];
}) => {
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    return false;
  }

  return getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  ).canReadObjectRecords;
};

const canAccessPageLayoutNavigationMenuItem = ({
  pageLayoutId,
  pageLayouts,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  permissionFlags,
}: {
  pageLayoutId: string;
  pageLayouts: PageLayout[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: CanAccessNavigationMenuItemArgs['objectPermissionsByObjectMetadataId'];
  permissionFlags: PermissionFlagType[];
}) => {
  if (hasFullWorkspaceNavigationAccess(permissionFlags)) {
    return true;
  }

  const pageLayout = pageLayouts.find((layout) => layout.id === pageLayoutId);

  if (!isDefined(pageLayout)) {
    return false;
  }

  const widgets = pageLayout.tabs.flatMap((tab) => tab.widgets);
  const graphWidgets = widgets.filter(
    (widget) => widget.type === WidgetType.GRAPH,
  );
  const graphObjectMetadataIds = graphWidgets
    .map((widget) => widget.objectMetadataId)
    .filter(isDefined);

  if (graphWidgets.length >= 2) {
    if (hasPermissionFlag(permissionFlags, PermissionFlagType.LAYOUTS)) {
      return true;
    }

    if (graphObjectMetadataIds.length === 0) {
      return false;
    }

    return canReadAllObjectMetadataIds({
      objectMetadataIds: graphObjectMetadataIds,
      objectPermissionsByObjectMetadataId,
    });
  }

  const pageNameLower = pageLayout.name.toLowerCase();

  if (pageNameLower.includes('integration')) {
    return hasObjectReadByNameSingular({
      objectNameSingular: 'baitkIntegration',
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });
  }

  if (pageNameLower.includes('distribution')) {
    return hasObjectReadByNameSingular({
      objectNameSingular: 'distributionQueueEntry',
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });
  }

  if (pageNameLower.includes('user')) {
    return hasPermissionFlag(
      permissionFlags,
      PermissionFlagType.WORKSPACE_MEMBERS,
    );
  }

  if (pageNameLower.includes('report')) {
    return hasObjectReadByNameSingular({
      objectNameSingular: 'baitkCustomReport',
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });
  }

  if (pageNameLower.includes('team')) {
    return hasObjectReadByNameSingular({
      objectNameSingular: 'baitkTeam',
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });
  }

  const objectMetadataIds = widgets
    .map((widget) => widget.objectMetadataId)
    .filter(isDefined);

  if (objectMetadataIds.length === 0) {
    return false;
  }

  return canReadAllObjectMetadataIds({
    objectMetadataIds,
    objectPermissionsByObjectMetadataId,
  });
};

export const canAccessNavigationMenuItem = ({
  navigationMenuItem,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
  pageLayouts,
  permissionFlags,
}: CanAccessNavigationMenuItemArgs): boolean => {
  const itemType = navigationMenuItem.type;

  if (hasFullWorkspaceNavigationAccess(permissionFlags)) {
    if (itemType === NavigationMenuItemType.LINK) {
      return true;
    }

    if (itemType === NavigationMenuItemType.FOLDER) {
      return true;
    }

    if (itemType === NavigationMenuItemType.PAGE_LAYOUT) {
      return isDefined(navigationMenuItem.pageLayoutId);
    }
  }

  if (itemType === NavigationMenuItemType.LINK) {
    return true;
  }

  if (itemType === NavigationMenuItemType.FOLDER) {
    const folderNameLower = navigationMenuItem.name?.toLowerCase() ?? '';

    if (folderNameLower.includes('workflow')) {
      return hasWorkflowsPermission(permissionFlags);
    }

    return true;
  }

  if (itemType === NavigationMenuItemType.PAGE_LAYOUT) {
    if (!isDefined(navigationMenuItem.pageLayoutId)) {
      return false;
    }

    return canAccessPageLayoutNavigationMenuItem({
      pageLayoutId: navigationMenuItem.pageLayoutId,
      pageLayouts,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      permissionFlags,
    });
  }

  if (
    itemType === NavigationMenuItemType.OBJECT ||
    itemType === NavigationMenuItemType.VIEW ||
    itemType === NavigationMenuItemType.RECORD
  ) {
    const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
      navigationMenuItem,
      objectMetadataItems,
      views,
    );

    if (!isDefined(objectMetadataItem)) {
      return false;
    }

    if (isWorkflowObjectMetadataItem(objectMetadataItem)) {
      return (
        hasWorkflowsPermission(permissionFlags) &&
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords
      );
    }

    return getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataItem.id,
    ).canReadObjectRecords;
  }

  return false;
};

export const canAccessPageLayoutById = ({
  pageLayoutId,
  pageLayouts,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  permissionFlags,
}: {
  pageLayoutId: string;
  pageLayouts: PageLayout[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: CanAccessNavigationMenuItemArgs['objectPermissionsByObjectMetadataId'];
  permissionFlags: PermissionFlagType[];
}) =>
  canAccessPageLayoutNavigationMenuItem({
    pageLayoutId,
    pageLayouts,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
    permissionFlags,
  });
