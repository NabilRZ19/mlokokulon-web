import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { berita as beritaTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

/** GET: Ambil semua berita berstatus 'pending' untuk Tier 1 & 2 */
export async function GET() {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  try {
    const rows = await db
      .select()
      .from(beritaTable)
      .where(eq(beritaTable.status, "pending"));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        judul: r.judul,
        slug: r.slug,
        kategori: r.kategori,
        cakupan: r.cakupan,
        rw_nama: r.rwNama,
        penulis: r.penulis,
        tanggal: r.tanggal,
        gambar_cover_url: r.gambarCoverUrl,
        submitted_by_tier: r.submittedByTier,
        pengusul: r.pengusul,
        created_by: r.createdBy,
        status: r.status,
      }))
    );
  } catch (err) {
    return handleApiError("api/admin/persetujuan/berita GET", err, "Gagal mengambil berita pending");
  }
}
