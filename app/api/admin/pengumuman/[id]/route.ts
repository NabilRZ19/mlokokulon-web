import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pengumuman as pengumumanTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

function cleanDate(val: any): string {
  if (!val) return new Date().toISOString().split("T")[0];
  if (typeof val === "string") return val.split("T")[0];
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return String(val);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageContent, [1, 2, 3, 4]);
  if (deny) return deny;

  const { id } = await params;
  try {
    const rows = await db.select().from(pengumumanTable).where(eq(pengumumanTable.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 });
    const r = rows[0];

    return NextResponse.json({
      id: r.id,
      judul: r.judul,
      slug: r.slug,
      target_pengumuman: r.targetPengumuman,
      isi: r.isi,
      tanggal: r.tanggal instanceof Date ? r.tanggal.toISOString().split("T")[0] : String(r.tanggal),
      gambar_cover_url: r.gambarCoverUrl,
      penulis: r.penulis,
      pengusul: r.pengusul,
      status: r.status,
      reviewer_note: r.reviewerNote,
      submitted_by_tier: r.submittedByTier,
      created_by: r.createdBy,
    });
  } catch (err) {
    return handleApiError("api/admin/pengumuman/[id] GET", err, "Gagal mengambil pengumuman");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageContent, [1, 2, 3, 4]);
  if (deny) return deny;

  const { id } = await params;
  try {
    const body = await request.json();
    const { judul, slug, target_pengumuman, isi, tanggal, gambar_cover_url, penulis } = body;

    const existing = await db.select().from(pengumumanTable).where(eq(pengumumanTable.id, id)).limit(1);
    if (existing.length === 0) return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 });

    const isTier34 = session?.tier === 3 || session?.tier === 4;
    const nextStatus = isTier34 ? "pending" : existing[0].status === "rejected" ? "published" : existing[0].status;
    const cleanTanggal = cleanDate(tanggal);

    await db
      .update(pengumumanTable)
      .set({
        judul,
        slug,
        targetPengumuman: target_pengumuman || "Seluruh Warga Kelurahan",
        isi,
        tanggal: cleanTanggal as any,
        gambarCoverUrl: gambar_cover_url || null,
        penulis,
        status: nextStatus,
        pengusul: isTier34 ? session?.nama : existing[0].pengusul,
        submittedByTier: isTier34 ? session?.tier : existing[0].submittedByTier,
      })
      .where(eq(pengumumanTable.id, id));

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (err) {
    return handleApiError("api/admin/pengumuman/[id] PUT", err, "Gagal memperbarui pengumuman");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageContent, [1, 2, 3, 4]);
  if (deny) return deny;

  const { id } = await params;
  try {
    await db.delete(pengumumanTable).where(eq(pengumumanTable.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError("api/admin/pengumuman/[id] DELETE", err, "Gagal menghapus pengumuman");
  }
}
