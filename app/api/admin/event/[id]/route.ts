import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { event as eventTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageContent, [1, 2, 3, 4]);
  if (deny) return deny;

  const { id } = await params;
  try {
    const rows = await db.select().from(eventTable).where(eq(eventTable.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
    const r = rows[0];

    return NextResponse.json({
      id: r.id,
      judul: r.judul,
      slug: r.slug,
      deskripsi: r.deskripsi,
      tanggal_mulai: r.tanggalMulai,
      tanggal_selesai: r.tanggalSelesai,
      jam_mulai: r.jamMulai,
      lokasi: r.lokasi,
      gambar_cover_url: r.gambarCoverUrl,
      penulis: r.penulis,
      pengusul: r.pengusul,
      status: r.status,
      reviewer_note: r.reviewerNote,
      submitted_by_tier: r.submittedByTier,
      created_by: r.createdBy,
    });
  } catch (err) {
    return handleApiError("api/admin/event/[id] GET", err, "Gagal mengambil event");
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
    const {
      judul,
      slug,
      deskripsi,
      tanggal_mulai,
      tanggal_selesai,
      jam_mulai,
      lokasi,
      gambar_cover_url,
      penulis,
    } = body;

    const existing = await db.select().from(eventTable).where(eq(eventTable.id, id)).limit(1);
    if (existing.length === 0) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });

    const isTier34 = session?.tier === 3 || session?.tier === 4;
    const nextStatus = isTier34 ? "pending" : existing[0].status === "rejected" ? "published" : existing[0].status;

    await db
      .update(eventTable)
      .set({
        judul,
        slug,
        deskripsi,
        tanggalMulai: tanggal_mulai,
        tanggalSelesai: tanggal_selesai || null,
        jamMulai: jam_mulai || "08:00 WIB",
        lokasi,
        gambarCoverUrl: gambar_cover_url || null,
        penulis,
        status: nextStatus,
        pengusul: isTier34 ? session?.nama : existing[0].pengusul,
        submittedByTier: isTier34 ? session?.tier : existing[0].submittedByTier,
      })
      .where(eq(eventTable.id, id));

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (err) {
    return handleApiError("api/admin/event/[id] PUT", err, "Gagal memperbarui event");
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
    await db.delete(eventTable).where(eq(eventTable.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError("api/admin/event/[id] DELETE", err, "Gagal menghapus event");
  }
}
