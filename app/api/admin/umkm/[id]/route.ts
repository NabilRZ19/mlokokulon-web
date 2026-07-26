import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { umkm as umkmTable, umkmFoto, umkmProdukUnggulan } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

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
    return NextResponse.json({ error: "ID UMKM tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      nama,
      kategori,
      deskripsi,
      link_gmaps = "",
      kontak,
      jam_operasional,
      produk_unggulan = [],
      foto_urls = [],
    } = body;

    if (!nama || !kategori || !deskripsi || !kontak || !jam_operasional) {
      return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    await db
      .update(umkmTable)
      .set({
        nama,
        kategori,
        deskripsi,
        linkGmaps: link_gmaps,
        kontak,
        jamOperasional: jam_operasional,
      })
      .where(eq(umkmTable.id, id));

    // Re-insert child tables
    await db.delete(umkmProdukUnggulan).where(eq(umkmProdukUnggulan.umkmId, id));
    if (Array.isArray(produk_unggulan) && produk_unggulan.length > 0) {
      await db.insert(umkmProdukUnggulan).values(
        produk_unggulan
          .filter((p: string) => p.trim().length > 0)
          .map((produk: string) => ({
            umkmId: id,
            produk: produk.trim(),
          }))
      );
    }

    await db.delete(umkmFoto).where(eq(umkmFoto.umkmId, id));
    if (Array.isArray(foto_urls) && foto_urls.length > 0) {
      await db.insert(umkmFoto).values(
        foto_urls.map((url: string) => ({
          umkmId: id,
          url,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/umkm/id] PUT error:", err);
    return NextResponse.json({ error: "Gagal memperbarui UMKM" }, { status: 500 });
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
    return NextResponse.json({ error: "ID UMKM tidak valid" }, { status: 400 });
  }

  try {
    await db.delete(umkmProdukUnggulan).where(eq(umkmProdukUnggulan.umkmId, id));
    await db.delete(umkmFoto).where(eq(umkmFoto.umkmId, id));
    await db.delete(umkmTable).where(eq(umkmTable.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/umkm/id] DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus UMKM" }, { status: 500 });
  }
}
