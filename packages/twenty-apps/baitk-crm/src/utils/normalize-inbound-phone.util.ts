// Meta Lead Ads (and some sheet exports) prefix phones with "p:" e.g. p:+201018999926
export const normalizeInboundPhone = (
  rawPhone: string | undefined,
): string | undefined => {
  if (!rawPhone?.trim()) {
    return undefined;
  }

  let phone = rawPhone.trim();

  phone = phone.replace(/^p:/i, '').trim();
  phone = phone.replace(/^tel:/i, '').trim();

  return phone.length > 0 ? phone : undefined;
};
