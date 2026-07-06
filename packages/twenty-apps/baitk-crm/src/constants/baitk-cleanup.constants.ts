export const TWENTY_WORKFLOWS_NAV_UNIVERSAL_IDENTIFIER =
  '20202020-b007-4b07-8b07-c0aba11c0007';

export const DEMO_COMMAND_MENU_ITEM_LABELS = [
  'Hello World',
  'Show Notification',
  'Quick Lead',
] as const;

export const FORCE_REMOVE_OBJECT_NAMES = [
  'workflowAutomatedTrigger',
  'workflowRun',
  'workflowVersion',
] as const;

export const FORCE_REMOVE_OBJECT_NAME_SET = new Set<string>(
  FORCE_REMOVE_OBJECT_NAMES,
);
