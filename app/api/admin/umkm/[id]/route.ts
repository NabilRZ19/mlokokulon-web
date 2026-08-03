import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { umkm as umkmTable, umkmFoto, umkmProdukUnggulan } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

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
    return NextResponse.json({ error: "ID UMKM tidak valid" }, { status: 400 });
  }

  try {
    const rows = await db
      .select()
      .from(umkmTable)
      .where(eq(umkmTable.id, id))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "UMKM tidak ditemukan" }, { status: 404 });
    }

    const row = rows[0];
    const [produk, foto] = await Promise.all([
      db.select().from(umkmProdukUnggulan).where(eq(umkmProdukUnggulan.umkmId, id)),
      db.select().from(umkmFoto).where(eq(umkmFoto.umkmId, id)),
    ]);

    return NextResponse.json({
      id: row.id,
      nama: row.nama,
      slug: row.slug,
      kategori: row.kategori,
      deskripsi: row.deskripsi,
      link_gmaps: row.linkGmaps,
      kontak: row.kontak,
      jam_operasional: row.jamOperasional,
      lokasi: row.lokasi ?? null,
      foto_utama_url: row.fotoUtamaUrl ?? null,
      produk_unggulan: produk.map((p) => ({ produk: p.produk, foto_url: p.fotoUrl ?? null })),
      foto_urls: foto.map((f) => f.url),
    });
  } catch (err) {
    console.error("[api/admin/umkm/id] GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data UMKM" }, { status: 500 });
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
      lokasi = null,
      produk_unggulan = [],
      foto_urls = [],
      foto_utama_url = null,
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
        lokasi: lokasi || null,
        fotoUtamaUrl: foto_utama_url || null,
      })
      .where(eq(umkmTable.id, id));

    // Re-insert child tables
    await db.delete(umkmProdukUnggulan).where(eq(umkmProdukUnggulan.umkmId, id));
    if (Array.isArray(produk_unggulan) && produk_unggulan.length > 0) {
      await db.insert(umkmProdukUnggulan).values(
        produk_unggulan
          .filter((p: { produk: string }) => p.produk.trim().length > 0)
          .map((p: { produk: string; foto_url: string | null }) => ({
            umkmId: id,
            produk: p.produk.trim(),
            fotoUrl: p.foto_url || null,
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
