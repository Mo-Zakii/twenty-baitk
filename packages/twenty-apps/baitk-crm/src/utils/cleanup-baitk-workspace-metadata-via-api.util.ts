import {
  DEMO_COMMAND_MENU_ITEM_LABELS,
  TWENTY_WORKFLOWS_NAV_UNIVERSAL_IDENTIFIER,
} from 'src/constants/baitk-cleanup.constants';
import { postMetadataGraphql } from 'src/utils/baitk-graphql.util';

type CommandMenuItemRow = {
  id: string;
  label: string;
  workflowVersionId: string | null;
  engineComponentKey: string | null;
  availabilityObjectMetadataId: string | null;
};

type NavigationMenuItemRow = {
  id: string;
  name: string;
  universalIdentifier: string | null;
};

type ObjectRow = {
  id: string;
  nameSingular: string;
};

const listCommandMenuItems = async (): Promise<CommandMenuItemRow[]> => {
  const data = await postMetadataGraphql<{
    commandMenuItems: CommandMenuItemRow[];
  }>(`{
    commandMenuItems {
      id
      label
      workflowVersionId
      engineComponentKey
      availabilityObjectMetadataId
    }
  }`);

  return data.commandMenuItems;
};

const listNavigationMenuItems = async (): Promise<NavigationMenuItemRow[]> => {
  const data = await postMetadataGraphql<{
    navigationMenuItems: NavigationMenuItemRow[];
  }>(`{
    navigationMenuItems {
      id
      name
      universalIdentifier
    }
  }`);

  return data.navigationMenuItems;
};

const listObjects = async (): Promise<ObjectRow[]> => {
  const data = await postMetadataGraphql<{
    objects: { edges: { node: ObjectRow }[] };
  }>(`{ objects(paging:{first:200}) { edges { node { id nameSingular } } } }`);

  return data.objects.edges.map((edge) => edge.node);
};

const deleteCommandMenuItem = async (commandMenuItemId: string): Promise<void> => {
  await postMetadataGraphql(
    `mutation DeleteCommandMenuItem($id: UUID!) {
      deleteCommandMenuItem(id: $id) {
        id
      }
    }`,
    { id: commandMenuItemId },
  );
};

const deleteNavigationMenuItem = async (
  navigationMenuItemId: string,
): Promise<void> => {
  await postMetadataGraphql(
    `mutation DeleteNavigationMenuItem($id: UUID!) {
      deleteNavigationMenuItem(id: $id) {
        id
      }
    }`,
    { id: navigationMenuItemId },
  );
};

export const cleanupBaitkWorkspaceMetadataViaApi = async (): Promise<void> => {
  const [commandMenuItems, navigationMenuItems, objects] = await Promise.all([
    listCommandMenuItems(),
    listNavigationMenuItems(),
    listObjects(),
  ]);

  const objectMetadataIdSet = new Set(
    objects.map((objectMetadata) => objectMetadata.id),
  );

  const commandMenuItemIdsToDelete = new Set<string>();

  for (const commandMenuItem of commandMenuItems) {
    const isWorkflowCommand =
      commandMenuItem.workflowVersionId !== null ||
      commandMenuItem.engineComponentKey === 'TRIGGER_WORKFLOW_VERSION';

    const isDemoCommand = DEMO_COMMAND_MENU_ITEM_LABELS.includes(
      commandMenuItem.label as (typeof DEMO_COMMAND_MENU_ITEM_LABELS)[number],
    );

    const hasMissingAvailabilityObject =
      commandMenuItem.availabilityObjectMetadataId !== null &&
      !objectMetadataIdSet.has(commandMenuItem.availabilityObjectMetadataId);

    if (isWorkflowCommand || isDemoCommand || hasMissingAvailabilityObject) {
      commandMenuItemIdsToDelete.add(commandMenuItem.id);
    }
  }

  for (const commandMenuItemId of commandMenuItemIdsToDelete) {
    const commandMenuItem = commandMenuItems.find(
      (item) => item.id === commandMenuItemId,
    );

    await deleteCommandMenuItem(commandMenuItemId);
    console.log(
      `Deleted command ${commandMenuItem?.label ?? commandMenuItemId}`,
    );
  }

  for (const navigationMenuItem of navigationMenuItems) {
    if (
      navigationMenuItem.universalIdentifier !==
      TWENTY_WORKFLOWS_NAV_UNIVERSAL_IDENTIFIER
    ) {
      continue;
    }

    await deleteNavigationMenuItem(navigationMenuItem.id);
    console.log(
      `Deleted navigation item ${navigationMenuItem.name} (${navigationMenuItem.id})`,
    );
  }
};
