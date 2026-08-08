import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { event as eventTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
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
      submitted_by_tier: r.submittedByTier,
      pengusul: r.pengusul,
      created_by: r.createdBy,
      status: r.status,
      reviewer_note: r.reviewerNote,
    });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/event/[id] GET", err, "Gagal mengambil detail event");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  try {
    const body = await request.json();
    const { action, note = "" } = body as { action: "approve" | "reject"; note?: string };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action harus 'approve' atau 'reject'" }, { status: 400 });
    }

    const rows = await db.select().from(eventTable).where(eq(eventTable.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });

    const newStatus = action === "approve" ? "published" : "rejected";

    await db
      .update(eventTable)
      .set({ status: newStatus, reviewerNote: note.trim() || null })
      .where(eq(eventTable.id, id));

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/event/[id] PATCH", err, "Gagal memperbarui persetujuan event");
  }
}
