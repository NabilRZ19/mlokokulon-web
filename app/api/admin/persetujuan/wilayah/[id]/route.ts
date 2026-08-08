import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rw as rwTable, rwKetuaPengajuan } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

/** GET: Ambil detail pengajuan Ketua RW tertentu untuk preview */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  const pengajuanId = Number(id);
  if (isNaN(pengajuanId)) return NextResponse.json({ error: "ID pengajuan tidak valid" }, { status: 400 });

  try {
    const rows = await db
      .select({
        id: rwKetuaPengajuan.id,
        rw_id: rwKetuaPengajuan.rwId,
        diajukan_oleh_id: rwKetuaPengajuan.diajukanOlehId,
        diajukan_oleh_nama: rwKetuaPengajuan.diajukanOlehNama,
        pengusul: rwKetuaPengajuan.pengusul,
        ketua_nama_baru: rwKetuaPengajuan.ketuaNamaBaru,
        ketua_foto_url_baru: rwKetuaPengajuan.ketuaFotoUrlBaru,
        status: rwKetuaPengajuan.status,
        reviewer_note: rwKetuaPengajuan.reviewerNote,
        created_at: rwKetuaPengajuan.createdAt,
        rw_nama: rwTable.namaRw,
        ketua_nama_lama: rwTable.ketuaNama,
        ketua_foto_url_lama: rwTable.ketuaFotoUrl,
      })
      .from(rwKetuaPengajuan)
      .innerJoin(rwTable, eq(rwKetuaPengajuan.rwId, rwTable.id))
      .where(eq(rwKetuaPengajuan.id, pengajuanId))
      .limit(1);

    if (rows.length === 0) return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    return handleApiError("api/admin/persetujuan/wilayah/[id] GET", err, "Gagal mengambil detail pengajuan");
  }
}

/** PATCH: Setujui atau tolak pengajuan perubahan Ketua RW */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  const pengajuanId = Number(id);
  if (isNaN(pengajuanId)) {
    return NextResponse.json({ error: "ID pengajuan tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, note = "" } = body as { action: "approve" | "reject"; note?: string };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action harus 'approve' atau 'reject'" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(rwKetuaPengajuan)
      .where(eq(rwKetuaPengajuan.id, pengajuanId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }
    if (rows[0].status !== "pending") {
      return NextResponse.json({ error: "Pengajuan ini sudah diproses" }, { status: 400 });
    }

    const pengajuan = rows[0];
    const newStatus = action === "approve" ? "approved" : "rejected";

    await db
      .update(rwKetuaPengajuan)
      .set({
        status: newStatus,
        reviewerNote: note.trim() || null,
        reviewedAt: new Date(),
      })
      .where(eq(rwKetuaPengajuan.id, pengajuanId));

    // Jika disetujui, terapkan perubahan ke tabel rw
    if (action === "approve") {
      await db
        .update(rwTable)
        .set({
          ketuaNama: pengajuan.ketuaNamaBaru,
          ketuaFotoUrl: pengajuan.ketuaFotoUrlBaru ?? null,
        })
        .where(eq(rwTable.id, pengajuan.rwId));
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/wilayah");

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/wilayah/[id] PATCH", err, "Gagal memproses pengajuan Ketua RW");
  }
}
