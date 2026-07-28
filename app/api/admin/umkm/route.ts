import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { umkm as umkmTable, umkmFoto, umkmProdukUnggulan } from "@/lib/db/schema";
import { getUmkmList } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { isValidString, isValidUrl } from "@/lib/validate";

function makeSlug(nama: string): string {
  return nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getUmkmList();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      foto_utama_url = null,
    } = body;

    if (
      !isValidString(nama, 2, 255) ||
      !isValidString(kategori, 2, 100) ||
      !isValidString(deskripsi, 5, 10000) ||
      !isValidString(kontak, 3, 100) ||
      !isValidString(jam_operasional, 2, 100) ||
      !isValidUrl(link_gmaps)
    ) {
      return NextResponse.json({ error: "Input tidak valid atau field wajib belum diisi" }, { status: 400 });
    }

    const id = `umkm-${randomUUID().slice(0, 8)}`;
    const slug = `${makeSlug(nama)}-${id.slice(-6)}`;

    await db.insert(umkmTable).values({
      id,
      nama,
      slug,
      kategori,
      deskripsi,
      linkGmaps: link_gmaps,
      kontak,
      jamOperasional: jam_operasional,
      fotoUtamaUrl: foto_utama_url || null,
    });

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

    if (Array.isArray(foto_urls) && foto_urls.length > 0) {
      await db.insert(umkmFoto).values(
        foto_urls.map((url: string) => ({
          umkmId: id,
          url,
        }))
      );
    }

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/umkm] POST error:", err);
    return NextResponse.json({ error: "Gagal menambah UMKM" }, { status: 500 });
  }
}
