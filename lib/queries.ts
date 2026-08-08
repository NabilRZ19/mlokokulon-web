import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "./db/client";
import {
  berita as beritaTable,
  beritaFotoTambahan,
  event as eventTable,
  galeri as galeriTable,
  layanan as layananTable,
  pengumuman as pengumumanTable,
  rw as rwTable,
  rwPengurus,
  strukturKelurahan,
  umkm as umkmTable,
  umkmFoto,
  umkmProdukUnggulan,
} from "./db/schema";
import type {
  Berita,
  EventItem,
  Galeri,
  Layanan,
  PengumumanItem,
  Rw,
  RwPengurus,
  StrukturKelurahan,
  Umkm,
  UmkmProdukUnggulan,
} from "./types";

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
    ketua_nama: row.ketuaNama ?? undefined,
    ketua_foto_url: row.ketuaFotoUrl ?? undefined,
    deskripsi_singkat: row.deskripsiSingkat ?? undefined,
    struktur_pengurus: pengurus.map((p) => ({
      nama: p.nama,
      jabatan: p.jabatan,
      kategori: (p.kategori as "rw" | "rt" | "organisasi") || "rw",
      organisasi: p.organisasi ?? undefined,
      icon: p.icon ?? undefined,
    })),
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

    const pengurusMap = new Map<string, Array<RwPengurus>>();
    for (const p of allPengurus) {
      const list = pengurusMap.get(p.rwId) ?? [];
      list.push({
        nama: p.nama,
        jabatan: p.jabatan,
        kategori: (p.kategori as "rw" | "rt" | "organisasi") || "rw",
        organisasi: p.organisasi ?? undefined,
        icon: p.icon ?? undefined,
      });
      pengurusMap.set(p.rwId, list);
    }

    return rows.map((row) => ({
      id: row.id,
      nama_rw: row.namaRw,
      cakupan_dusun: row.cakupanDusun,
      jumlah_rt: row.jumlahRt,
      is_kampung_kb: row.isKampungKb,
      ketua_nama: row.ketuaNama ?? undefined,
      ketua_foto_url: row.ketuaFotoUrl ?? undefined,
      deskripsi_singkat: row.deskripsiSingkat ?? undefined,
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
    video_url: row.videoUrl ?? undefined,
    video_title: row.videoTitle ?? undefined,
    penulis: row.penulis,
    created_by: row.createdBy,
    foto_tambahan: foto.map((f) => f.url),
    status: (row.status ?? "published") as Berita["status"],
    reviewer_note: row.reviewerNote ?? undefined,
    submitted_by_tier: row.submittedByTier ?? undefined,
    pengusul: row.pengusul ?? undefined,
  };
}

export async function getBeritaList(onlyPublished = true): Promise<Berita[]> {
  try {
    const query = db.select().from(beritaTable);
    const rows = onlyPublished
      ? await query.where(eq(beritaTable.status, "published")).orderBy(desc(beritaTable.tanggal))
      : await query.orderBy(desc(beritaTable.tanggal));

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
      video_url: row.videoUrl ?? undefined,
      video_title: row.videoTitle ?? undefined,
      penulis: row.penulis,
      created_by: row.createdBy,
      foto_tambahan: fotoMap.get(row.id) ?? [],
      status: (row.status ?? "published") as Berita["status"],
      reviewer_note: row.reviewerNote ?? undefined,
      submitted_by_tier: row.submittedByTier ?? undefined,
      pengusul: row.pengusul ?? undefined,
    }));
  } catch (err) {
    console.error("[queries] Error getBeritaList:", err);
    return [];
  }
}

export async function getBeritaBySlug(slug: string, allowUnpublished = false): Promise<Berita | null> {
  try {
    const rows = await db.select().from(beritaTable).where(eq(beritaTable.slug, slug)).limit(1);
    if (rows.length === 0) return null;
    const berita = await assembleBeritaSingle(rows[0]);
    if (!allowUnpublished && berita.status && berita.status !== "published") {
      return null;
    }
    return berita;
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
    produk_unggulan: produk.map((p) => ({ produk: p.produk, foto_url: p.fotoUrl })),
    jam_operasional: row.jamOperasional,
    lokasi: row.lokasi ?? undefined,
    foto_urls: foto.map((f) => f.url),
    foto_utama_url: row.fotoUtamaUrl,
    status: (row.status ?? "published") as Umkm["status"],
    created_by: row.createdBy ?? undefined,
    reviewer_note: row.reviewerNote ?? undefined,
    submitted_by_tier: row.submittedByTier ?? undefined,
    pengusul: row.pengusul ?? undefined,
  };
}

export async function getUmkmList(onlyPublished = true): Promise<Umkm[]> {
  try {
    const query = db.select().from(umkmTable);
    const rows = onlyPublished
      ? await query.where(eq(umkmTable.status, "published")).orderBy(asc(umkmTable.nama))
      : await query.orderBy(asc(umkmTable.nama));

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

    const produkMap = new Map<string, UmkmProdukUnggulan[]>();
    for (const p of allProduk) {
      const list = produkMap.get(p.umkmId) ?? [];
      list.push({ produk: p.produk, foto_url: p.fotoUrl });
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
      lokasi: row.lokasi ?? undefined,
      foto_urls: fotoMap.get(row.id) ?? [],
      foto_utama_url: row.fotoUtamaUrl,
      status: (row.status ?? "published") as Umkm["status"],
      created_by: row.createdBy ?? undefined,
      reviewer_note: row.reviewerNote ?? undefined,
      submitted_by_tier: row.submittedByTier ?? undefined,
      pengusul: row.pengusul ?? undefined,
    }));
  } catch (err) {
    console.error("[queries] Error getUmkmList:", err);
    return [];
  }
}

export async function getUmkmBySlug(slug: string, allowUnpublished = false): Promise<Umkm | null> {
  try {
    const rows = await db.select().from(umkmTable).where(eq(umkmTable.slug, slug)).limit(1);
    if (rows.length === 0) return null;
    const umkm = await assembleUmkmSingle(rows[0]);
    if (!allowUnpublished && umkm.status && umkm.status !== "published") {
      return null;
    }
    return umkm;
  } catch (err) {
    console.error(`[queries] Error getUmkmBySlug for ${slug}:`, err);
    return null;
  }
}

export async function getGaleriList(onlyPublished = true): Promise<Galeri[]> {
  try {
    const query = db.select().from(galeriTable);
    const rows = onlyPublished
      ? await query.where(eq(galeriTable.status, "published")).orderBy(asc(galeriTable.judul))
      : await query.orderBy(asc(galeriTable.judul));

    return rows.map((r) => ({
      id: r.id,
      judul: r.judul,
      tipe: r.tipe,
      url_media: r.urlMedia,
      kategori: r.kategori ?? undefined,
      sumber_berita_id: r.sumberBeritaId ?? undefined,
      status: (r.status ?? "published") as Galeri["status"],
      created_by: r.createdBy ?? undefined,
      reviewer_note: r.reviewerNote ?? undefined,
      submitted_by_tier: r.submittedByTier ?? undefined,
      pengusul: r.pengusul ?? undefined,
    }));
  } catch (err) {
    console.error("[queries] Error getGaleriList:", err);
    return [];
  }
}

export async function getLayananList(): Promise<Layanan[]> {
  try {
    const rows = await db.select().from(layananTable).orderBy(asc(layananTable.urutan));
    return rows.map((r) => ({
      id: r.id,
      nama: r.nama,
      kategori: r.kategori,
      deskripsi: r.deskripsi,
      persyaratan: Array.isArray(r.persyaratan) ? r.persyaratan : [],
      prosedur: Array.isArray(r.prosedur) ? r.prosedur : [],
      waktu_proses: r.waktuProses,
      biaya: r.biaya,
      kontak_penanggung_jawab: r.kontakPenanggungJawab ?? undefined,
      urutan: r.urutan,
    }));
  } catch (err) {
    console.error("[queries] Error getLayananList:", err);
    return [];
  }
}

export async function getLayananById(id: string): Promise<Layanan | null> {
  try {
    const rows = await db.select().from(layananTable).where(eq(layananTable.id, id)).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      nama: r.nama,
      kategori: r.kategori,
      deskripsi: r.deskripsi,
      persyaratan: Array.isArray(r.persyaratan) ? r.persyaratan : [],
      prosedur: Array.isArray(r.prosedur) ? r.prosedur : [],
      waktu_proses: r.waktuProses,
      biaya: r.biaya,
      kontak_penanggung_jawab: r.kontakPenanggungJawab ?? undefined,
      urutan: r.urutan,
    };
  } catch (err) {
    console.error(`[queries] Error getLayananById for ${id}:`, err);
    return null;
  }
}

// ── Event Mendatang ────────────────────────────────────────────────────────
export async function getEventList(onlyPublished = true): Promise<EventItem[]> {
  try {
    const query = db.select().from(eventTable);
    const rows = onlyPublished
      ? await query.where(eq(eventTable.status, "published")).orderBy(asc(eventTable.tanggalMulai))
      : await query.orderBy(asc(eventTable.tanggalMulai));

    return rows.map((r) => ({
      id: r.id,
      judul: r.judul,
      slug: r.slug,
      deskripsi: r.deskripsi,
      tanggal_mulai: r.tanggalMulai instanceof Date ? r.tanggalMulai.toISOString().split("T")[0] : String(r.tanggalMulai),
      tanggal_selesai: r.tanggalSelesai ? (r.tanggalSelesai instanceof Date ? r.tanggalSelesai.toISOString().split("T")[0] : String(r.tanggalSelesai)) : null,
      jam_mulai: r.jamMulai,
      lokasi: r.lokasi,
      gambar_cover_url: r.gambarCoverUrl ?? null,
      penulis: r.penulis,
      pengusul: r.pengusul ?? undefined,
      status: r.status,
      reviewer_note: r.reviewerNote ?? undefined,
      submitted_by_tier: r.submittedByTier ?? undefined,
      created_by: r.createdBy,
    }));
  } catch (err) {
    console.error("[queries] Error getEventList:", err);
    return [];
  }
}

export async function getEventBySlug(slug: string, onlyPublished = true): Promise<EventItem | null> {
  try {
    const rows = await db.select().from(eventTable).where(eq(eventTable.slug, slug)).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    if (onlyPublished && r.status !== "published") return null;

    return {
      id: r.id,
      judul: r.judul,
      slug: r.slug,
      deskripsi: r.deskripsi,
      tanggal_mulai: r.tanggalMulai instanceof Date ? r.tanggalMulai.toISOString().split("T")[0] : String(r.tanggalMulai),
      tanggal_selesai: r.tanggalSelesai ? (r.tanggalSelesai instanceof Date ? r.tanggalSelesai.toISOString().split("T")[0] : String(r.tanggalSelesai)) : null,
      jam_mulai: r.jamMulai,
      lokasi: r.lokasi,
      gambar_cover_url: r.gambarCoverUrl ?? null,
      penulis: r.penulis,
      pengusul: r.pengusul ?? undefined,
      status: r.status,
      reviewer_note: r.reviewerNote ?? undefined,
      submitted_by_tier: r.submittedByTier ?? undefined,
      created_by: r.createdBy,
    };
  } catch (err) {
    console.error(`[queries] Error getEventBySlug for ${slug}:`, err);
    return null;
  }
}

// ── Pengumuman ─────────────────────────────────────────────────────────────
export async function getPengumumanList(onlyPublished = true): Promise<PengumumanItem[]> {
  try {
    const query = db.select().from(pengumumanTable);
    const rows = onlyPublished
      ? await query.where(eq(pengumumanTable.status, "published")).orderBy(desc(pengumumanTable.tanggal))
      : await query.orderBy(desc(pengumumanTable.tanggal));

    return rows.map((r) => ({
      id: r.id,
      judul: r.judul,
      slug: r.slug,
      target_pengumuman: r.targetPengumuman,
      isi: r.isi,
      tanggal: r.tanggal instanceof Date ? r.tanggal.toISOString().split("T")[0] : String(r.tanggal),
      gambar_cover_url: r.gambarCoverUrl ?? null,
      penulis: r.penulis,
      pengusul: r.pengusul ?? undefined,
      status: r.status,
      reviewer_note: r.reviewerNote ?? undefined,
      submitted_by_tier: r.submittedByTier ?? undefined,
      created_by: r.createdBy,
    }));
  } catch (err) {
    console.error("[queries] Error getPengumumanList:", err);
    return [];
  }
}

export async function getPengumumanBySlug(slug: string, onlyPublished = true): Promise<PengumumanItem | null> {
  try {
    const rows = await db.select().from(pengumumanTable).where(eq(pengumumanTable.slug, slug)).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    if (onlyPublished && r.status !== "published") return null;

    return {
      id: r.id,
      judul: r.judul,
      slug: r.slug,
      target_pengumuman: r.targetPengumuman,
      isi: r.isi,
      tanggal: r.tanggal instanceof Date ? r.tanggal.toISOString().split("T")[0] : String(r.tanggal),
      gambar_cover_url: r.gambarCoverUrl ?? null,
      penulis: r.penulis,
      pengusul: r.pengusul ?? undefined,
      status: r.status,
      reviewer_note: r.reviewerNote ?? undefined,
      submitted_by_tier: r.submittedByTier ?? undefined,
      created_by: r.createdBy,
    };
  } catch (err) {
    console.error(`[queries] Error getPengumumanBySlug for ${slug}:`, err);
    return null;
  }
}
