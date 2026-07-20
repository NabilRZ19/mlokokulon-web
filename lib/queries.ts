import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "./db/client";
import {
  berita as beritaTable,
  beritaFotoTambahan,
  galeri as galeriTable,
  rw as rwTable,
  rwPengurus,
  strukturKelurahan,
  umkm as umkmTable,
  umkmFoto,
  umkmProdukUnggulan,
} from "./db/schema";
import type { Berita, Galeri, Rw, StrukturKelurahan, Umkm } from "./types";

// Fetch server-side (Drizzle + MySQL VPS) untuk halaman publik SSG/ISR — halaman publik tidak
// boleh fetch DB langsung dari client browser. Shape return tetap sama persis dengan lib/types.ts
// lama (era Firestore) — child table di-JOIN & dirakit ulang di sini biar ~15 halaman yang sudah
// dibangun tidak perlu diubah sama sekali.

export async function getStrukturKelurahan(): Promise<StrukturKelurahan[]> {
  const rows = await db.select().from(strukturKelurahan).orderBy(asc(strukturKelurahan.urutan));
  return rows.map((r) => ({
    id: r.id,
    nama: r.nama,
    jabatan: r.jabatan,
    foto_url: r.fotoUrl,
    urutan: r.urutan,
  }));
}

async function assembleRw(row: typeof rwTable.$inferSelect): Promise<Rw> {
  const pengurus = await db.select().from(rwPengurus).where(eq(rwPengurus.rwId, row.id));
  return {
    id: row.id,
    nama_rw: row.namaRw,
    cakupan_dusun: row.cakupanDusun,
    jumlah_rt: row.jumlahRt,
    is_kampung_kb: row.isKampungKb,
    struktur_pengurus: pengurus.map((p) => ({ nama: p.nama, jabatan: p.jabatan })),
    statistik: { jumlah_kk: row.jumlahKk, jumlah_jiwa: row.jumlahJiwa },
    potensi: row.potensi,
    cakupan_wilayah_geojson: row.cakupanWilayahGeojson ?? undefined,
  };
}

export async function getRwList(): Promise<Rw[]> {
  const rows = await db.select().from(rwTable).orderBy(asc(rwTable.namaRw));
  return Promise.all(rows.map(assembleRw));
}

export async function getRwById(id: string): Promise<Rw | null> {
  const rows = await db.select().from(rwTable).where(eq(rwTable.id, id)).limit(1);
  if (rows.length === 0) return null;
  return assembleRw(rows[0]);
}

async function assembleBerita(row: typeof beritaTable.$inferSelect): Promise<Berita> {
  const foto = await db
    .select()
    .from(beritaFotoTambahan)
    .where(eq(beritaFotoTambahan.beritaId, row.id));
  return {
    id: row.id,
    judul: row.judul,
    slug: row.slug,
    isi: row.isi,
    tanggal: row.tanggal,
    kategori: row.kategori,
    cakupan: row.cakupan,
    rw_id: row.rwId ?? undefined,
    rw_nama: row.rwNama ?? undefined,
    gambar_cover_url: row.gambarCoverUrl,
    penulis: row.penulis,
    created_by: row.createdBy,
    foto_tambahan: foto.map((f) => f.url),
  };
}

export async function getBeritaList(): Promise<Berita[]> {
  const rows = await db.select().from(beritaTable).orderBy(desc(beritaTable.tanggal));
  return Promise.all(rows.map(assembleBerita));
}

export async function getBeritaBySlug(slug: string): Promise<Berita | null> {
  const rows = await db.select().from(beritaTable).where(eq(beritaTable.slug, slug)).limit(1);
  if (rows.length === 0) return null;
  return assembleBerita(rows[0]);
}

async function assembleUmkm(row: typeof umkmTable.$inferSelect): Promise<Umkm> {
  const [produk, foto] = await Promise.all([
    db.select().from(umkmProdukUnggulan).where(eq(umkmProdukUnggulan.umkmId, row.id)),
    db.select().from(umkmFoto).where(eq(umkmFoto.umkmId, row.id)),
  ]);
  return {
    id: row.id,
    nama: row.nama,
    slug: row.slug,
    kategori: row.kategori,
    deskripsi: row.deskripsi,
    link_gmaps: row.linkGmaps,
    kontak: row.kontak,
    produk_unggulan: produk.map((p) => p.produk),
    jam_operasional: row.jamOperasional,
    foto_urls: foto.map((f) => f.url),
  };
}

export async function getUmkmList(): Promise<Umkm[]> {
  const rows = await db.select().from(umkmTable).orderBy(asc(umkmTable.nama));
  return Promise.all(rows.map(assembleUmkm));
}

export async function getUmkmBySlug(slug: string): Promise<Umkm | null> {
  const rows = await db.select().from(umkmTable).where(eq(umkmTable.slug, slug)).limit(1);
  if (rows.length === 0) return null;
  return assembleUmkm(rows[0]);
}

export async function getGaleriList(): Promise<Galeri[]> {
  const rows = await db.select().from(galeriTable).orderBy(asc(galeriTable.judul));
  return rows.map((r) => ({
    id: r.id,
    judul: r.judul,
    tipe: r.tipe,
    url_media: r.urlMedia,
    kategori: r.kategori ?? undefined,
    sumber_berita_id: r.sumberBeritaId ?? undefined,
  }));
}
