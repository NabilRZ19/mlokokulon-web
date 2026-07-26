import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { berita as beritaTable, beritaFotoTambahan } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });
  }

  try {
    await db.delete(beritaFotoTambahan).where(eq(beritaFotoTambahan.beritaId, id));
    await db.delete(beritaTable).where(eq(beritaTable.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/berita/id] DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus berita" }, { status: 500 });
  }
}
