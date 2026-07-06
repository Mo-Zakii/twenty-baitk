import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  BAITK_NOTIFICATION_FIELD_IDS,
  BAITK_NOTIFICATION_OBJECT_ID,
  BAITK_NOTIFICATION_TYPE_OPTION_IDS,
} from 'src/constants/uuids';

export enum BaitkNotificationType {
  WON = 'WON',
  LOST = 'LOST',
  STAGE_CHANGE = 'STAGE_CHANGE',
  NEW_UNASSIGNED = 'NEW_UNASSIGNED',
  REASSIGNED = 'REASSIGNED',
}

export { BAITK_NOTIFICATION_OBJECT_ID, BAITK_NOTIFICATION_FIELD_IDS };

export default defineObject({
  universalIdentifier: BAITK_NOTIFICATION_OBJECT_ID,
  nameSingular: 'baitkNotification',
  namePlural: 'baitkNotifications',
  labelSingular: 'Notification',
  labelPlural: 'Notifications',
  description: 'BAITK in-app notifications',
  icon: 'IconBell',
  labelIdentifierFieldMetadataUniversalIdentifier:
    BAITK_NOTIFICATION_FIELD_IDS.message,
  fields: [
    {
      universalIdentifier: BAITK_NOTIFICATION_FIELD_IDS.message,
      type: FieldType.TEXT,
      name: 'message',
      label: 'Message',
      icon: 'IconBell',
    },
    {
      universalIdentifier: BAITK_NOTIFICATION_FIELD_IDS.notificationType,
      type: FieldType.SELECT,
      name: 'notificationType',
      label: 'Notification Type',
      icon: 'IconTag',
      defaultValue: `'${BaitkNotificationType.STAGE_CHANGE}'`,
      options: [
        {
          id: BAITK_NOTIFICATION_TYPE_OPTION_IDS.won,
          value: BaitkNotificationType.WON,
          label: 'Won',
          position: 0,
          color: 'green',
        },
        {
          id: BAITK_NOTIFICATION_TYPE_OPTION_IDS.lost,
          value: BaitkNotificationType.LOST,
          label: 'Lost',
          position: 1,
          color: 'red',
        },
        {
          id: BAITK_NOTIFICATION_TYPE_OPTION_IDS.stageChange,
          value: BaitkNotificationType.STAGE_CHANGE,
          label: 'Stage Change',
          position: 2,
          color: 'blue',
        },
        {
          id: BAITK_NOTIFICATION_TYPE_OPTION_IDS.newUnassigned,
          value: BaitkNotificationType.NEW_UNASSIGNED,
          label: 'New Unassigned',
          position: 3,
          color: 'orange',
        },
        {
          id: BAITK_NOTIFICATION_TYPE_OPTION_IDS.reassigned,
          value: BaitkNotificationType.REASSIGNED,
          label: 'Reassigned',
          position: 4,
          color: 'purple',
        },
      ],
    },
    {
      universalIdentifier: BAITK_NOTIFICATION_FIELD_IDS.isRead,
      type: FieldType.BOOLEAN,
      name: 'isRead',
      label: 'Read',
      icon: 'IconCheck',
      defaultValue: false,
    },
  ],
});
