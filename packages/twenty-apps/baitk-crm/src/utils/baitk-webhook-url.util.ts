const WEBHOOK_ROUTE_PATH = '/baitk/leads/webhook';
const WEBHOOK_PATH = `/s${WEBHOOK_ROUTE_PATH}`;

const appendWebhookPath = (baseUrl: string): string => {
  const trimmedBaseUrl = baseUrl.replace(/\/$/, '');

  if (trimmedBaseUrl.endsWith(WEBHOOK_PATH)) {
    return trimmedBaseUrl;
  }

  if (trimmedBaseUrl.endsWith(WEBHOOK_ROUTE_PATH)) {
    return trimmedBaseUrl.replace(
      new RegExp(`${WEBHOOK_ROUTE_PATH.replace(/\//g, '\\/')}$`),
      WEBHOOK_PATH,
    );
  }

  return `${trimmedBaseUrl}${WEBHOOK_PATH}`;
};

export const buildBaitkWebhookUrl = (): string => {
  const apiUrl = process.env.TWENTY_API_URL?.trim();

  if (apiUrl) {
    return appendWebhookPath(apiUrl);
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;

    // Local dev: CRM UI is :3001, API (webhook) is :3000
    if (origin.includes(':3001')) {
      return `http://localhost:3000${WEBHOOK_PATH}`;
    }

    return appendWebhookPath(origin);
  }

  return `http://localhost:3000${WEBHOOK_PATH}`;
};

export const isLocalhostWebhookUrl = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;

    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return url.includes('localhost') || url.includes('127.0.0.1');
  }
};

// Google Apps Script runs on Google's servers — it cannot call localhost.
export const buildAppsScriptWebhookUrl = (
  publicWebhookUrl: string | null | undefined,
  apiWebhookUrl: string,
): string => {
  const trimmedPublicUrl = publicWebhookUrl?.trim();

  if (trimmedPublicUrl) {
    return appendWebhookPath(trimmedPublicUrl);
  }

  if (!isLocalhostWebhookUrl(apiWebhookUrl)) {
    return apiWebhookUrl;
  }

  return `https://YOUR-PUBLIC-URL${WEBHOOK_PATH}`;
};
