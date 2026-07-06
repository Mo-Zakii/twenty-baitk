import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  DatabaseEventPayload,
  defineLogicFunction,
} from 'twenty-sdk/define';
import { STAGE_CHANGED_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import { BaitkNotificationType } from 'src/objects/baitk-notification.object';
import { LeadStage } from 'src/objects/lead.object';

const stageLabel = (stage: string | null | undefined) => {
  if (!stage) return 'New';
  return stage
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const handler = async (payload: DatabaseEventPayload) => {
  const properties = payload.properties as {
    after?: {
      id: string;
      name?: string;
      stage?: string;
      assigneeId?: string | null;
    };
    before?: { stage?: string };
    updatedFields?: string[];
  };

  if (!properties.updatedFields?.includes('stage')) {
    return {};
  }

  const fromStage = properties.before?.stage ?? null;
  const toStage = properties.after?.stage ?? null;

  if (!properties.after?.id || !toStage || fromStage === toStage) {
    return {};
  }

  const client = new CoreApiClient();

  const notificationType =
    toStage === LeadStage.WON
      ? BaitkNotificationType.WON
      : toStage === LeadStage.LOST
        ? BaitkNotificationType.LOST
        : BaitkNotificationType.STAGE_CHANGE;

  const leadName = properties.after.name ?? 'Lead';

  const stageMessage =
    notificationType === BaitkNotificationType.WON
      ? `${leadName} won: ${stageLabel(fromStage)} → ${stageLabel(toStage)}`
      : notificationType === BaitkNotificationType.LOST
        ? `${leadName} lost: ${stageLabel(fromStage)} → ${stageLabel(toStage)}`
        : `${leadName}: ${stageLabel(fromStage)} → ${stageLabel(toStage)}`;

  await client.mutation({
    createBaitkNotification: {
      __args: {
        data: {
          message: stageMessage,
          notificationType: notificationType,
          isRead: false,
          leadId: properties.after.id,
        },
      },
      id: true,
    },
  } as never);

  return { notified: true, fromStage, toStage };
};

export default defineLogicFunction({
  universalIdentifier: STAGE_CHANGED_LOGIC_FUNCTION_ID,
  name: 'baitk-on-lead-stage-changed',
  description:
    'Creates notifications when a lead stage changes',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'lead.updated',
    updatedFields: ['stage'],
  },
});
