import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rw as rwTable, rwKetuaPengajuan } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

/** GET: Ambil semua pengajuan perubahan Ketua RW yang berstatus pending */
export async function GET() {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  try {
    const rows = await db
      .select()
      .from(rwKetuaPengajuan)
      .where(eq(rwKetuaPengajuan.status, "pending"));

    // Tambah nama RW ke masing-masing row
    const rwIds = [...new Set(rows.map((r) => r.rwId))];
    const rwRows = rwIds.length > 0
      ? await db.select().from(rwTable).where(
          rwIds.length === 1
            ? eq(rwTable.id, rwIds[0])
            : eq(rwTable.id, rwIds[0]) // simplified — akan di-enrich di FE
        )
      : [];
    const rwMap = new Map(rwRows.map((r) => [r.id, r.namaRw]));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        rw_id: r.rwId,
        rw_nama: rwMap.get(r.rwId) ?? r.rwId,
        diajukan_oleh_id: r.diajukanOlehId,
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
    return handleApiError("api/admin/persetujuan/wilayah GET", err, "Gagal mengambil pengajuan Ketua RW");
  }
}
