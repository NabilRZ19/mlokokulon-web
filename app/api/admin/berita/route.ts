import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { berita as beritaTable, beritaFotoTambahan, galeri as galeriTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

// Sesuai aturan bisnis: 1 berita = maks 1 foto headline + maks 4 foto tambahan
const MAX_FOTO_TAMBAHAN = 4;

// Buat slug dari judul: lowercase, replace spasi & karakter non-alfanumerik jadi dash
function makeSlug(judul: string): string {
  return judul
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    judul,
    isi,
    tanggal,
    kategori,
    cakupan,
    rw_id,
    rw_nama,
    gambar_cover_url,
    penulis,
    foto_tambahan = [],
    galeri_foto = [], // array: { url, judul, masukGaleri: true }
  } = body;

  // Validasi field wajib
  if (!judul || !isi || !tanggal || !kategori || !cakupan || !gambar_cover_url || !penulis) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const id = `berita-${randomUUID().slice(0, 8)}`;
  const slug = `${makeSlug(judul)}-${id.slice(-6)}`;

  // Insert berita utama
  await db.insert(beritaTable).values({
    id,
    judul,
    slug,
    isi,
    tanggal,
    kategori,
    cakupan,
    rwId: cakupan === "rw" ? (rw_id ?? null) : null,
    rwNama: cakupan === "rw" ? (rw_nama ?? null) : null,
    gambarCoverUrl: gambar_cover_url,
    penulis,
    createdBy: String(session.id),
  });

  // Insert foto tambahan (child table) — dibatasi maks MAX_FOTO_TAMBAHAN di sisi server
  const fotoTambahanLimited: string[] = (foto_tambahan as string[]).slice(0, MAX_FOTO_TAMBAHAN);
  if (fotoTambahanLimited.length > 0) {
    await db.insert(beritaFotoTambahan).values(
      fotoTambahanLimited.map((url) => ({ beritaId: id, url })),
    );
  }

  // Foto yang di-checklist "tampilkan di Galeri" → insert ke tabel galeri
  // (PRD: semi-otomatis lewat checkbox, sumberBeritaId diisi agar bisa dilacak asal-usulnya)
  const galeriInserts = galeri_foto.filter((f: { masukGaleri: boolean }) => f.masukGaleri);
  if (galeriInserts.length > 0) {
    await db.insert(galeriTable).values(
      galeriInserts.map((f: { url: string; judul: string }) => ({
        id: `galeri-${randomUUID().slice(0, 8)}`,
        judul: f.judul || judul,
        tipe: "foto" as const,
        urlMedia: f.url,
        kategori: kategori,
        sumberBeritaId: id,
      })),
    );
  }

  return NextResponse.json({ id, slug }, { status: 201 });
}
