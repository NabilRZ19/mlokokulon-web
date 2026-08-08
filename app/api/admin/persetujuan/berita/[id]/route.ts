import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { berita as beritaTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

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
