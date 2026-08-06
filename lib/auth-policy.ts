/**
 * Centralized tier authorization policy — PRD Bagian 9 (Hak Akses Admin).
 *
 * Tier hierarchy:
 *   1 = Super Admin (Kelurahan) — akses penuh
 *   2 = Admin Kelurahan         — kelola konten kelurahan, tidak bisa kelola user
 *   3 = Admin RW                — kelola konten RW-nya sendiri
 *
 * Gunakan fungsi-fungsi ini di route handler untuk cek otorisasi tier.
 * Jangan tersebar logika tier di masing-masing route.
 */

import { NextResponse } from "next/server";
import type { SessionPayload } from "./auth";

// ── Policy functions ──────────────────────────────────────────────────────────

/** Tier 1 & Tier 2: manajemen akun admin (tambah, edit, hapus, lihat semua) */
export const canManageUsers = (tier: number) => tier === 1 || tier === 2;

/**
 * Tier 1 & 2: kelola struktur organisasi kelurahan.
 * Tier 3 (Admin RW) tidak relevan dengan struktur kelurahan.
 */
export const canManageStruktur = (tier: number) => tier === 1 || tier === 2;

/**
 * Tier 1 & 3: kelola data wilayah RW.
 * Tier 1 = super admin bisa edit semua RW.
 * Tier 3 = admin RW bisa edit data RW-nya sendiri.
 * Tier 2 = admin kelurahan tidak mengelola wilayah RW secara langsung.
 */
export const canManageWilayah = (tier: number) => tier === 1 || tier === 3;

/**
 * Semua tier: bisa membuat/edit/hapus konten publik (berita, galeri, UMKM, potensi).
 * Meski semua tier diizinkan, fungsi ini tetap diekspor untuk konsistensi
 * dan kemudahan audit/perubahan di masa depan.
 */
export const canManageContent = (_tier: number) => true;

// ── Response helpers ──────────────────────────────────────────────────────────

/** Kembalikan 403 Forbidden dengan pesan yang informatif */
export function forbiddenResponse(requiredTiers?: number[]) {
  const hint = requiredTiers
    ? ` (memerlukan tier ${requiredTiers.join(" atau ")})`
    : "";
  return NextResponse.json(
    { error: `Akses ditolak. Anda tidak memiliki otorisasi untuk operasi ini${hint}.` },
    { status: 403 },
  );
}

/**
 * Helper gabungan: cek session ada dan tier sesuai policy.
 * Kembalikan `null` jika OK, atau `NextResponse` 401/403 yang siap di-return.
 *
 * TypeScript overloads memastikan:
 *   - Jika return `null`, caller tahu `session` pasti `SessionPayload` (non-null).
 *   - Ini menghilangkan kebutuhan `session!` atau casting di route handler.
 *
 * Contoh pemakaian:
 * ```ts
 * const session = await getSession();
 * const deny = requireTier(session, canManageStruktur, [1, 2]);
 * if (deny) return deny;
 * // Di sini TypeScript tahu session adalah SessionPayload (non-null)
 * ```
 */
export function requireTier(
  session: SessionPayload | null,
  policy: (tier: number) => boolean,
  requiredTiers?: number[],
): NextResponse | null {
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!policy(session.tier)) {
    return forbiddenResponse(requiredTiers);
  }
  return null;
}

/**
 * Type guard versi requireTier — narrowing session ke non-null setelah dipakai.
 * Gunakan ini ketika kamu perlu akses `session` setelah guard:
 *
 * ```ts
 * const session = await getSession();
 * if (!assertSession(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * // session sekarang SessionPayload (non-null)
 * ```
 */
export function assertSession(
  session: SessionPayload | null,
): session is SessionPayload {
  return session !== null;
}
