import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
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
  try {
    const rows = await db.select().from(strukturKelurahan).orderBy(asc(strukturKelurahan.urutan));
    return rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      jabatan: r.jabatan,
      foto_url: r.fotoUrl,
      urutan: r.urutan,
    }));
  } catch (err) {
    console.error("[queries] Error getStrukturKelurahan:", err);
    return [];
  }
}

async function assembleRwSingle(row: typeof rwTable.$inferSelect): Promise<Rw> {
  let pengurus: Array<typeof rwPengurus.$inferSelect> = [];
  try {
    pengurus = await db.select().from(rwPengurus).where(eq(rwPengurus.rwId, row.id));
  } catch (err) {
    console.error(`[queries] Error fetch rw_pengurus for ${row.id}:`, err);
  }

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
  try {
    const rows = await db.select().from(rwTable).orderBy(asc(rwTable.namaRw));
    if (rows.length === 0) return [];

    const rwIds = rows.map((r) => r.id);
    let allPengurus: Array<typeof rwPengurus.$inferSelect> = [];
    try {
      allPengurus = await db
        .select()
        .from(rwPengurus)
        .where(inArray(rwPengurus.rwId, rwIds));
    } catch (err) {
      console.error("[queries] Error batch fetch rw_pengurus:", err);
    }

    const pengurusMap = new Map<string, Array<{ nama: string; jabatan: string }>>();
    for (const p of allPengurus) {
      const list = pengurusMap.get(p.rwId) ?? [];
      list.push({ nama: p.nama, jabatan: p.jabatan });
      pengurusMap.set(p.rwId, list);
    }

    return rows.map((row) => ({
      id: row.id,
      nama_rw: row.namaRw,
      cakupan_dusun: row.cakupanDusun,
      jumlah_rt: row.jumlahRt,
      is_kampung_kb: row.isKampungKb,
      struktur_pengurus: pengurusMap.get(row.id) ?? [],
      statistik: { jumlah_kk: row.jumlahKk, jumlah_jiwa: row.jumlahJiwa },
      potensi: row.potensi,
      cakupan_wilayah_geojson: row.cakupanWilayahGeojson ?? undefined,
    }));
  } catch (err) {
    console.error("[queries] Error getRwList:", err);
    return [];
  }
}

export async function getRwById(id: string): Promise<Rw | null> {
  try {
    const rows = await db.select().from(rwTable).where(eq(rwTable.id, id)).limit(1);
    if (rows.length === 0) return null;
    return assembleRwSingle(rows[0]);
  } catch (err) {
    console.error(`[queries] Error getRwById for ${id}:`, err);
    return null;
  }
}

async function assembleBeritaSingle(row: typeof beritaTable.$inferSelect): Promise<Berita> {
  let foto: Array<typeof beritaFotoTambahan.$inferSelect> = [];
  try {
    foto = await db
      .select()
      .from(beritaFotoTambahan)
      .where(eq(beritaFotoTambahan.beritaId, row.id));
  } catch (err) {
    console.error(`[queries] Error fetch berita_foto_tambahan for ${row.id}:`, err);
  }

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
  try {
    const rows = await db.select().from(beritaTable).orderBy(desc(beritaTable.tanggal));
    if (rows.length === 0) return [];

    const beritaIds = rows.map((r) => r.id);
    let allFoto: Array<typeof beritaFotoTambahan.$inferSelect> = [];
    try {
      allFoto = await db
        .select()
        .from(beritaFotoTambahan)
        .where(inArray(beritaFotoTambahan.beritaId, beritaIds));
    } catch (err) {
      console.error("[queries] Error batch fetch berita_foto_tambahan:", err);
    }

    const fotoMap = new Map<string, string[]>();
    for (const f of allFoto) {
      const list = fotoMap.get(f.beritaId) ?? [];
      list.push(f.url);
      fotoMap.set(f.beritaId, list);
    }

    return rows.map((row) => ({
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
      foto_tambahan: fotoMap.get(row.id) ?? [],
    }));
  } catch (err) {
    console.error("[queries] Error getBeritaList:", err);
    return [];
  }
}

export async function getBeritaBySlug(slug: string): Promise<Berita | null> {
  try {
    const rows = await db.select().from(beritaTable).where(eq(beritaTable.slug, slug)).limit(1);
    if (rows.length === 0) return null;
    return assembleBeritaSingle(rows[0]);
  } catch (err) {
    console.error(`[queries] Error getBeritaBySlug for ${slug}:`, err);
    return null;
  }
}

async function assembleUmkmSingle(row: typeof umkmTable.$inferSelect): Promise<Umkm> {
  let produk: Array<typeof umkmProdukUnggulan.$inferSelect> = [];
  let foto: Array<typeof umkmFoto.$inferSelect> = [];

  try {
    [produk, foto] = await Promise.all([
      db.select().from(umkmProdukUnggulan).where(eq(umkmProdukUnggulan.umkmId, row.id)),
      db.select().from(umkmFoto).where(eq(umkmFoto.umkmId, row.id)),
    ]);
  } catch (err) {
    console.error(`[queries] Error fetch umkm child tables for ${row.id}:`, err);
  }

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
  try {
    const rows = await db.select().from(umkmTable).orderBy(asc(umkmTable.nama));
    if (rows.length === 0) return [];

    const umkmIds = rows.map((r) => r.id);
    let allProduk: Array<typeof umkmProdukUnggulan.$inferSelect> = [];
    let allFoto: Array<typeof umkmFoto.$inferSelect> = [];

    try {
      [allProduk, allFoto] = await Promise.all([
        db.select().from(umkmProdukUnggulan).where(inArray(umkmProdukUnggulan.umkmId, umkmIds)),
        db.select().from(umkmFoto).where(inArray(umkmFoto.umkmId, umkmIds)),
      ]);
    } catch (err) {
      console.error("[queries] Error batch fetch umkm child tables:", err);
    }

    const produkMap = new Map<string, string[]>();
    for (const p of allProduk) {
      const list = produkMap.get(p.umkmId) ?? [];
      list.push(p.produk);
      produkMap.set(p.umkmId, list);
    }

    const fotoMap = new Map<string, string[]>();
    for (const f of allFoto) {
      const list = fotoMap.get(f.umkmId) ?? [];
      list.push(f.url);
      fotoMap.set(f.umkmId, list);
    }

    return rows.map((row) => ({
      id: row.id,
      nama: row.nama,
      slug: row.slug,
      kategori: row.kategori,
      deskripsi: row.deskripsi,
      link_gmaps: row.linkGmaps,
      kontak: row.kontak,
      produk_unggulan: produkMap.get(row.id) ?? [],
      jam_operasional: row.jamOperasional,
      foto_urls: fotoMap.get(row.id) ?? [],
    }));
  } catch (err) {
    console.error("[queries] Error getUmkmList:", err);
    return [];
  }
}

export async function getUmkmBySlug(slug: string): Promise<Umkm | null> {
  try {
    const rows = await db.select().from(umkmTable).where(eq(umkmTable.slug, slug)).limit(1);
    if (rows.length === 0) return null;
    return assembleUmkmSingle(rows[0]);
  } catch (err) {
    console.error(`[queries] Error getUmkmBySlug for ${slug}:`, err);
    return null;
  }
}

export async function getGaleriList(): Promise<Galeri[]> {
  try {
    const rows = await db.select().from(galeriTable).orderBy(asc(galeriTable.judul));
    return rows.map((r) => ({
      id: r.id,
      judul: r.judul,
      tipe: r.tipe,
      url_media: r.urlMedia,
      kategori: r.kategori ?? undefined,
      sumber_berita_id: r.sumberBeritaId ?? undefined,
    }));
  } catch (err) {
    console.error("[queries] Error getGaleriList:", err);
    return [];
  }
}
