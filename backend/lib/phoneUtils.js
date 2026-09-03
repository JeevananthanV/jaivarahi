// backend/lib/phoneUtils.js
/**
 * Normalizes a phone number to standard Indian mobile format (+91XXXXXXXXXX) or valid international format.
 * Strips whitespace, special characters, and handles leading zeros or 91 prefixes.
 */
export const normalizePhone = (phone = "") => {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D+/g, "").replace(/^0+/, "");
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
  if (cleaned.length > 10) return `+${cleaned}`;
  return cleaned ? `+${cleaned}` : "";
};

export const isValidPhone = (phone = "") => {
  const normalized = normalizePhone(phone);
  return /^\+91[6-9]\d{9}$/.test(normalized);
};

export default { normalizePhone, isValidPhone };
