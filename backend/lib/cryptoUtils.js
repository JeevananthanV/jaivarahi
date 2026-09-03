import crypto from "crypto";

export const safeCompare = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const generateSecureToken = (bytes = 3) => crypto.randomBytes(bytes).toString("hex").toUpperCase();
