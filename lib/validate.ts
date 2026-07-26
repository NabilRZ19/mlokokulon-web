/**
 * Helper validasi input terpusat untuk API routes admin.
 */

export function isValidString(val: unknown, minLen = 1, maxLen = 255): val is string {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  return trimmed.length >= minLen && trimmed.length <= maxLen;
}

export function isValidEmail(val: unknown): val is string {
  if (typeof val !== "string") return false;
  const email = val.trim().toLowerCase();
  return email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidEnum<T extends string>(val: unknown, allowedValues: readonly T[]): val is T {
  if (typeof val !== "string") return false;
  return allowedValues.includes(val as T);
}

export function isValidUrl(val: unknown): boolean {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (!trimmed) return true; // Optional URL field
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    // Jalur relatif juga diizinkan jika disimpan sebagai path lokal
    return trimmed.startsWith("/");
  }
}

export function isValidDateStr(val: unknown): boolean {
  if (typeof val !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(val.trim());
}
