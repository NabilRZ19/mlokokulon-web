import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rwKetuaPengajuan } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageWilayah, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

/**
 * POST: Tier 3/4 mengajukan perubahan Ketua RW untuk RW tertentu.
 * Disimpan ke tabel rw_ketua_pengajuan dengan status 'pending'.
 */
export async function POST(request: Request) {
  const session = await getSession();
  const deny = requireTier(session, canManageWilayah, [1, 3, 4]);
  if (deny) return deny;

  try {
    const body = await request.json();
    const { rw_id, pengusul, ketua_nama_baru, ketua_foto_url_baru } = body;

    if (!rw_id || typeof rw_id !== "string") {
      return NextResponse.json({ error: "ID RW wajib diisi" }, { status: 400 });
    }
    if (!ketua_nama_baru || typeof ketua_nama_baru !== "string" || !ketua_nama_baru.trim()) {
      return NextResponse.json({ error: "Nama Ketua RW baru wajib diisi" }, { status: 400 });
    }
    const finalPengusul = (pengusul && typeof pengusul === "string" && pengusul.trim())
      ? pengusul.trim()
      : session!.nama;

    await db.insert(rwKetuaPengajuan).values({
      rwId: rw_id,
      diajukanOlehId: session!.id,
      diajukanOlehNama: session!.nama,
      pengusul: finalPengusul,
      ketuaNamaBaru: ketua_nama_baru.trim(),
      ketuaFotoUrlBaru: typeof ketua_foto_url_baru === "string" && ketua_foto_url_baru.trim()
        ? ketua_foto_url_baru.trim()
        : null,
      status: "pending",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return handleApiError("api/admin/wilayah/ketua-pengajuan POST", err, "Gagal mengajukan perubahan Ketua RW");
  }
}

/** GET: Ambil semua pengajuan yang pernah dibuat (untuk history) */
export async function GET(request: Request) {
  const session = await getSession();
  const deny = requireTier(session, canManageWilayah, [1, 3, 4]);
  if (deny) return deny;

  try {
    const url = new URL(request.url);
    const rwId = url.searchParams.get("rw_id");

    let rows;
    if (rwId) {
      rows = await db
        .select()
        .from(rwKetuaPengajuan)
        .where(eq(rwKetuaPengajuan.rwId, rwId));
    } else {
      rows = await db.select().from(rwKetuaPengajuan);
    }

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        rw_id: r.rwId,
        diajukan_oleh_nama: r.diajukanOlehNama,
        pengusul: r.pengusul,
        ketua_nama_baru: r.ketuaNamaBaru,
        ketua_foto_url_baru: r.ketuaFotoUrlBaru,
        status: r.status,
        reviewer_note: r.reviewerNote,
        created_at: r.createdAt,
      }))
    );
  } catch (err) {
    return handleApiError("api/admin/wilayah/ketua-pengajuan GET", err, "Gagal mengambil riwayat pengajuan");
  }
}
