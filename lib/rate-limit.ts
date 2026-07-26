/**
 * In-memory rate limiter sederhana.
 *
 * Desain sengaja tidak pakai Redis/external store karena:
 * - Skala deployment: satu instance (single-server Vercel/VPS)
 * - Tidak perlu persist antar restart — proteksi tetap jalan selama server hidup
 *
 * Jika di masa depan scale ke multi-instance, ganti dengan upstash/ratelimit + Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // epoch ms
}

// Map per-IP. Di-clear otomatis saat window habis (lazy cleanup saat request berikutnya).
const store = new Map<string, RateLimitEntry>();

/** Bersihkan entry yang sudah expire — dijalankan secara periodik saat ada request masuk */
function pruneExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitOptions {
  /** Jumlah maksimal request dalam window (default: 5) */
  limit?: number;
  /** Lama window dalam detik (default: 900 = 15 menit) */
  windowSeconds?: number;
}

export interface RateLimitResult {
  /** true jika request sudah melewati batas */
  limited: boolean;
  /** Sisa percobaan yang tersedia */
  remaining: number;
  /** Epoch detik kapan window reset (untuk header Retry-After) */
  resetAt: number;
}

/**
 * Cek apakah identifier (IP / email) sudah mencapai batas rate limit.
 * Setiap panggilan akan mencatat satu hit ke counter.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const limit = options.limit ?? 5;
  const windowMs = (options.windowSeconds ?? 900) * 1000;
  const now = Date.now();

  // Lazy cleanup ~10% of the time untuk jaga memory
  if (Math.random() < 0.1) pruneExpired();

  const existing = store.get(identifier);

  if (!existing || now > existing.resetAt) {
    // Window baru atau sudah expired — reset
    const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, entry);
    return {
      limited: false,
      remaining: limit - 1,
      resetAt: Math.ceil(entry.resetAt / 1000),
    };
  }

  // Masih dalam window yang sama
  existing.count += 1;

  const limited = existing.count > limit;
  const remaining = Math.max(0, limit - existing.count);

  return {
    limited,
    remaining,
    resetAt: Math.ceil(existing.resetAt / 1000),
  };
}
