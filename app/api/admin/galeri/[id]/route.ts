import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galeri as galeriTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { isValidEnum, isValidString, isValidUrl } from "@/lib/validate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID galeri tidak valid" }, { status: 400 });
  }

  try {
    const rows = await db
      .select()
      .from(galeriTable)
      .where(eq(galeriTable.id, id))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Item galeri tidak ditemukan" }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      id: row.id,
      judul: row.judul,
      tipe: row.tipe,
      url_media: row.urlMedia,
      kategori: row.kategori ?? "umum",
      sumber_berita_id: row.sumberBeritaId ?? null,
    });
  } catch (err) {
    console.error("[api/admin/galeri/id] GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data galeri" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID galeri tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { judul, tipe, url_media, kategori } = body;

    if (
      !isValidString(judul, 3, 255) ||
      !isValidEnum(tipe, ["foto", "video"] as const) ||
      !isValidUrl(url_media)
    ) {
      return NextResponse.json(
        { error: "Input tidak valid (judul, tipe foto/video, dan URL media wajib diisi)" },
        { status: 400 }
      );
    }

    await db
      .update(galeriTable)
      .set({
        judul,
        tipe,
        urlMedia: url_media,
        kategori: kategori || null,
      })
      .where(eq(galeriTable.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/galeri/id] PUT error:", err);
    return NextResponse.json({ error: "Gagal memperbarui item galeri" }, { status: 500 });
  }
}

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
    return NextResponse.json({ error: "ID galeri tidak valid" }, { status: 400 });
  }

  try {
    await db.delete(galeriTable).where(eq(galeriTable.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/galeri/id] DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus item galeri" }, { status: 500 });
  }
}
