import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { WEBHOOK_LOGIC_FUNCTION_ID } from 'src/constants/uuids';
import {
  assignLeadToNextInCycle,
  createLeadComment,
  createLeadFromPayload,
  findDuplicateLeadByPhone,
} from 'src/utils/distribution.util';
import {
  applyColumnMapping,
  buildLeadCommentText,
  describeMappingFailure,
  parseColumnMapping,
  type MappedLeadPayload,
} from 'src/utils/integration-mapping.util';
import { normalizeInboundPhone } from 'src/utils/normalize-inbound-phone.util';
import { IntegrationType } from 'src/objects/integration.object';
import { BaitkNotificationType } from 'src/objects/baitk-notification.object';

type IntegrationRecord = {
  id: string;
  name: string;
  integrationType: string | null;
  webhookSecret: string | null;
  columnMapping: unknown;
  customSourceLabel: string | null;
  isActive: boolean;
};

type WebhookPayload = {
  integrationId?: string;
  secret?: string;
  row?: string[];
  fields?: Record<string, string>;
  name?: string;
  phone?: string;
  phoneSecondary?: string;
  email?: string;
  source?: string;
  budget?: string;
  compound?: string;
  comments?: string;
};

type LogicFunctionEvent = {
  body?: unknown;
};

const parseWebhookPayload = (body: unknown): WebhookPayload => {
  if (!body || typeof body !== 'object') {
    return {};
  }

  return body as WebhookPayload;
};

const defaultSourceForType = (
  integrationType: string | null,
  customSourceLabel: string | null,
): string | undefined => {
  if (customSourceLabel?.trim()) {
    return customSourceLabel.trim();
  }

  switch (integrationType) {
    case IntegrationType.GOOGLE_SHEETS:
      return 'Google Sheets';
    case IntegrationType.ZAPIER:
      return 'Zapier';
    case IntegrationType.META_LEADS:
      return 'Meta Leads';
    case IntegrationType.CUSTOM_FORM:
      return 'Custom Form';
    case IntegrationType.WEBHOOK:
      return 'Webhook';
    default:
      return undefined;
  }
};

const loadIntegration = async (
  client: CoreApiClient,
  integrationId: string,
): Promise<IntegrationRecord | null> => {
  const result = (await client.query({
    baitkIntegrations: {
      __args: {
        filter: { id: { eq: integrationId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          name: true,
          integrationType: true,
          webhookSecret: true,
          columnMapping: true,
          customSourceLabel: true,
          isActive: true,
        },
      },
    },
  } as never)) as {
    baitkIntegrations: {
      edges: { node: IntegrationRecord }[];
    };
  };

  return result.baitkIntegrations.edges[0]?.node ?? null;
};

const resolveLeadPayload = async (
  client: CoreApiClient,
  payload: WebhookPayload,
): Promise<MappedLeadPayload | { error: string }> => {
  if (payload.integrationId) {
    const integration = await loadIntegration(client, payload.integrationId);

    if (!integration) {
      return { error: 'Integration not found' };
    }

    if (!integration.isActive) {
      return { error: 'Integration is inactive' };
    }

    if (
      integration.webhookSecret &&
      payload.secret !== integration.webhookSecret
    ) {
      return { error: 'Invalid integration secret' };
    }

    const mapping = parseColumnMapping(integration.columnMapping);
    const row = payload.row ?? [];
    const mapped = applyColumnMapping({
      mapping,
      row,
      fields: payload.fields,
      defaultSource: defaultSourceForType(
        integration.integrationType,
        integration.customSourceLabel,
      ),
    });

    if (!mapped) {
      return {
        error: `Could not map row — ${describeMappingFailure({
          mapping,
          row,
          fields: payload.fields,
        })}`,
      };
    }

    return mapped;
  }

  if (!payload.name || !payload.phone) {
    return {
      error:
        'name and phone are required (or send integrationId + row + secret)',
    };
  }

  return {
    name: payload.name,
    phone: normalizeInboundPhone(payload.phone) ?? payload.phone,
    phoneSecondary: normalizeInboundPhone(payload.phoneSecondary),
    email: payload.email,
    source: payload.source,
    budget: payload.budget,
    compound: payload.compound,
    comments: payload.comments,
  };
};

const handler = async (event: LogicFunctionEvent) => {
  const client = new CoreApiClient();
  const payload = parseWebhookPayload(event.body);
  const resolved = await resolveLeadPayload(client, payload);

  if ('error' in resolved) {
    return { success: false, message: resolved.error };
  }

  const duplicate = await findDuplicateLeadByPhone(client, resolved.phone);

  if (duplicate) {
    return {
      success: false,
      duplicate: true,
      leadId: duplicate.id,
      message: `Duplicate phone: existing lead "${duplicate.name}"`,
    };
  }

  const lead = await createLeadFromPayload(client, resolved);
  const commentText = buildLeadCommentText(resolved);

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

  return {
    success: true,
    leadId: lead.id,
    assigneeId,
    message: assigneeId
      ? `Lead "${lead.name}" created and assigned`
      : `Lead "${lead.name}" created (unassigned — no queue)`,
  };
};

export default defineLogicFunction({
  universalIdentifier: WEBHOOK_LOGIC_FUNCTION_ID,
  name: 'baitk-leads-webhook',
  description:
    'Inbound webhook for Google Sheets, Zapier, Meta, and other sources — maps columns and distributes leads',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/baitk/leads/webhook',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
