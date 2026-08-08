/**
 * Centralized tier authorization policy — PRD Bagian 9 (Hak Akses Admin).
 *
 * Tier hierarchy:
 *   1 = Super Admin (Kelurahan) — akses penuh
 *   2 = Admin Kelurahan         — kelola konten kelurahan, tidak bisa kelola user
 *   3 = Admin RW                — kelola konten RW-nya sendiri, perlu approval Tier 1/2
 *   4 = Admin Kampung KB        — setara Tier 3 + speciality kelola Kampung KB, perlu approval
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
 * Cek apakah `actorTier` boleh menetapkan/menyentuh akun dengan `targetTier`.
 * Hanya Tier 1 yang boleh membuat, mengedit, atau menghapus akun Tier 1 —
 * mencegah Tier 2 (Admin Kelurahan) eskalasi diri sendiri atau akun lain
 * jadi Super Admin, atau mengambil alih/menghapus akun Super Admin lain.
 */
export const canAssignTier = (actorTier: number, targetTier: number) =>
  targetTier !== 1 || actorTier === 1;

/**
 * Tier 1 & 2: kelola struktur organisasi kelurahan.
 * Tier 3 & 4 (Admin RW / Kampung KB) tidak relevan dengan struktur kelurahan.
 */
export const canManageStruktur = (tier: number) => tier === 1 || tier === 2;

/**
 * Tier 1, 2, 3 & 4: kelola data wilayah RW.
 * Tier 1 & 2 = super admin & admin kelurahan bisa edit semua RW.
 * Tier 3 = admin RW bisa edit data RW-nya sendiri (selain Ketua RW yang perlu approval).
 * Tier 4 = admin Kampung KB bisa edit data wilayah RW-nya.
 */
export const canManageWilayah = (tier: number) => tier === 1 || tier === 2 || tier === 3 || tier === 4;

/**
 * Semua tier: bisa membuat/edit/hapus konten publik (berita, galeri, UMKM, layanan).
 * Tier 3 & 4: konten yang dibuat perlu approval dari Tier 1 atau 2 sebelum published.
 */
export const canManageContent = (_tier: number) => true;

/**
 * Tier 1 & 2 & 4: kelola halaman Kampung KB.
 * Tier 4 (Admin Kampung KB) adalah specialty tier untuk mengelola Kampung KB.
 */
export const canManageKampungKb = (tier: number) => tier === 1 || tier === 2 || tier === 4;

/**
 * Apakah konten yang dibuat oleh tier ini perlu approval?
 * Tier 3 (Admin RW) dan Tier 4 (Admin Kampung KB) perlu approval dari Tier 1/2.
 */
export const needsApproval = (tier: number) => tier === 3 || tier === 4;

/**
 * Apakah tier ini bisa menyetujui/menolak konten?
 * Hanya Tier 1 (Super Admin) dan Tier 2 (Admin Kelurahan) yang bisa approve.
 */
export const canApproveContent = (tier: number) => tier === 1 || tier === 2;

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
