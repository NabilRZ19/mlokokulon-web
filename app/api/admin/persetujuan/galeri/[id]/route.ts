import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galeri as galeriTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

/** GET: Ambil detail galeri pending tertentu untuk preview */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID galeri tidak valid" }, { status: 400 });

  try {
    const rows = await db.select().from(galeriTable).where(eq(galeriTable.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Media galeri tidak ditemukan" }, { status: 404 });
    const r = rows[0];

    return NextResponse.json({
      id: r.id,
      judul: r.judul,
      tipe: r.tipe,
      url_media: r.urlMedia,
      kategori: r.kategori,
      sumber_berita_id: r.sumberBeritaId,
      submitted_by_tier: r.submittedByTier,
      pengusul: r.pengusul,
      created_by: r.createdBy,
      status: r.status,
      reviewer_note: r.reviewerNote,
    });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/galeri/[id] GET", err, "Gagal mengambil detail galeri");
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
  if (!id) {
    return NextResponse.json({ error: "ID galeri tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, note = "" } = body as { action: "approve" | "reject"; note?: string };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action harus 'approve' atau 'reject'" }, { status: 400 });
    }

    const rows = await db.select().from(galeriTable).where(eq(galeriTable.id, id)).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Media galeri tidak ditemukan" }, { status: 404 });
    }
    if (rows[0].status !== "pending") {
      return NextResponse.json({ error: "Media ini tidak dalam status pending" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "published" : "rejected";

    await db
      .update(galeriTable)
      .set({ status: newStatus, reviewerNote: note.trim() || null })
      .where(eq(galeriTable.id, id));

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/galeri");

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/galeri/[id] PATCH", err, "Gagal memperbarui status galeri");
  }
}
