// BAITK CRM object metadata kept when stripping default Twenty CRM objects.

export const BAITK_OBJECT_NAMES = [
  'lead',
  'baitkTeam',
  'leadActivity',
  'leadComment',
  'baitkNotification',
  'baitkIntegration',
  'distributionQueueEntry',
  'baitkCustomReport',
] as const;

export const BAITK_OBJECT_NAME_SET = new Set<string>(BAITK_OBJECT_NAMES);
