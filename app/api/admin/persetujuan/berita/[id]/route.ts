import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { berita as beritaTable, beritaFotoTambahan as beritaFotoTambahanTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

/** GET: Ambil detail berita pending tertentu untuk preview */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });

  try {
    const rows = await db.select().from(beritaTable).where(eq(beritaTable.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    const r = rows[0];

    // Ambil foto tambahan dari DB
    const fotoTambahanRows = await db
      .select()
      .from(beritaFotoTambahanTable)
      .where(eq(beritaFotoTambahanTable.beritaId, id));

    return NextResponse.json({
      id: r.id,
      judul: r.judul,
      slug: r.slug,
      isi: r.isi,
      kategori: r.kategori,
      cakupan: r.cakupan,
      rw_id: r.rwId,
      rw_nama: r.rwNama,
      penulis: r.penulis,
      tanggal: r.tanggal,
      gambar_cover_url: r.gambarCoverUrl,
      video_url: r.videoUrl,
      video_title: r.videoTitle,
      foto_tambahan: fotoTambahanRows.map((f) => f.url),
      submitted_by_tier: r.submittedByTier,
      pengusul: r.pengusul,
      created_by: r.createdBy,
      status: r.status,
      reviewer_note: r.reviewerNote,
    });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/berita/[id] GET", err, "Gagal mengambil detail berita");
  }
}

/** PATCH: Setujui (published) atau tolak (rejected) berita pending */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, note = "" } = body as { action: "approve" | "reject"; note?: string };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action harus 'approve' atau 'reject'" }, { status: 400 });
    }

    // Pastikan berita ada dan berstatus pending
    const rows = await db.select().from(beritaTable).where(eq(beritaTable.id, id)).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    }
    if (rows[0].status !== "pending") {
      return NextResponse.json({ error: "Berita ini tidak dalam status pending" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "published" : "rejected";

    await db
      .update(beritaTable)
      .set({
        status: newStatus,
        reviewerNote: note.trim() || null,
      })
      .where(eq(beritaTable.id, id));

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/berita/[id] PATCH", err, "Gagal memperbarui status berita");
  }
}
