import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  assignLeadToNextInCycle,
  createLeadComment,
  createLeadFromPayload,
  findDuplicateLeadByPhone,
} from 'src/utils/distribution.util';
import {
  buildLeadCommentText,
  type MappedLeadPayload,
} from 'src/utils/integration-mapping.util';
import { BaitkNotificationType } from 'src/objects/baitk-notification.object';

export type ImportMappedLeadResult =
  | { status: 'created'; leadId: string; assigneeId: string | null }
  | { status: 'duplicate'; leadId: string }
  | { status: 'skipped' };

export const importMappedLead = async (
  client: CoreApiClient,
  mappedLead: MappedLeadPayload,
): Promise<ImportMappedLeadResult> => {
  const duplicate = await findDuplicateLeadByPhone(client, mappedLead.phone);

  if (duplicate) {
    return { status: 'duplicate', leadId: duplicate.id };
  }

  const lead = await createLeadFromPayload(client, mappedLead);
  const commentText = buildLeadCommentText(mappedLead);

  if (commentText) {
    await createLeadComment(client, lead.id, commentText);
  }

  const { assigneeId } = await assignLeadToNextInCycle(client, lead.id);

  if (!assigneeId) {
    await client.mutation({
      createBaitkNotification: {
        __args: {
          data: {
            message: `New unassigned lead: ${lead.name}`,
            notificationType: BaitkNotificationType.NEW_UNASSIGNED,
            isRead: false,
            leadId: lead.id,
          },
        },
        id: true,
      },
    } as never);
  }

  return { status: 'created', leadId: lead.id, assigneeId };
};
