export const callBaitkAppRoute = async <TResult>(
  path: string,
  method: 'GET' | 'POST',
  body?: Record<string, unknown>,
): Promise<TResult> => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('API configuration missing');
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/s${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');

    throw new Error(
      `Request failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  return response.json() as Promise<TResult>;
};
