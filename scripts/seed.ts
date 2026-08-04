import { readFileSync } from "fs";
import { resolve } from "path";
import { inArray } from "drizzle-orm";

async function main() {
  // tsx tidak otomatis load .env.local seperti Next.js — load manual dulu
  // sebelum import lib/db/client (yang baca process.env saat di-import).
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line.includes("=") || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx);
    const value = line.slice(idx + 1).replace(/^"|"$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }

  const { db } = await import("../lib/db/client");
  const {
    strukturKelurahan,
    rw,
    rwPengurus,
    berita,
    beritaFotoTambahan,
    galeri,
    umkm,
    umkmProdukUnggulan,
    umkmFoto,
  } = await import("../lib/db/schema");
  const { strukturKelurahanSeed, rwSeed, beritaSeed, galeriSeed, umkmSeed } = await import(
    "../lib/seed-data"
  );

  console.log("Seeding MySQL (VPS) dengan Proteksi Data CMS Admin...");

  // 1. Target ID khusus Seed (agar data custom yang dibuat via CMS admin TIDAK PERNAH terhapus)
  const seedStrukturIds = strukturKelurahanSeed.map((s) => s.id);
  const seedRwIds = rwSeed.map((r) => r.id);
  const seedGaleriIds = galeriSeed.map((g) => g.id);
  const seedUmkmIds = umkmSeed.map((u) => u.id);

  // 2. Hapus HANYA data seed lama (Child dulu baru Parent), simpan data custom CMS warga/admin
  if (seedRwIds.length > 0) {
    await db.delete(rwPengurus).where(inArray(rwPengurus.rwId, seedRwIds));
    await db.delete(rw).where(inArray(rw.id, seedRwIds));
  }
  if (seedUmkmIds.length > 0) {
    await db.delete(umkmProdukUnggulan).where(inArray(umkmProdukUnggulan.umkmId, seedUmkmIds));
    await db.delete(umkmFoto).where(inArray(umkmFoto.umkmId, seedUmkmIds));
    await db.delete(umkm).where(inArray(umkm.id, seedUmkmIds));
  }
  if (seedStrukturIds.length > 0) {
    await db.delete(strukturKelurahan).where(inArray(strukturKelurahan.id, seedStrukturIds));
  }
  if (seedGaleriIds.length > 0) {
    await db.delete(galeri).where(inArray(galeri.id, seedGaleriIds));
  }

  // 3. Reseed Struktur Kelurahan
  await db.insert(strukturKelurahan).values(
    strukturKelurahanSeed.map((s) => ({
      id: s.id,
      nama: s.nama,
      jabatan: s.jabatan,
      fotoUrl: s.foto_url,
      urutan: s.urutan,
    })),
  );
  console.log(`  ✓ struktur_kelurahan: ${strukturKelurahanSeed.length} data seed diperbarui`);

  // 4. Reseed RW & Pengurus
  await db.insert(rw).values(
    rwSeed.map((r) => ({
      id: r.id,
      namaRw: r.nama_rw,
      cakupanDusun: r.cakupan_dusun,
      jumlahRt: r.jumlah_rt,
      isKampungKb: r.is_kampung_kb,
      potensi: r.potensi,
      jumlahKk: r.statistik.jumlah_kk,
      jumlahJiwa: r.statistik.jumlah_jiwa,
      cakupanWilayahGeojson: r.cakupan_wilayah_geojson ?? null,
    })),
  );
  const rwPengurusRows = rwSeed.flatMap((r) =>
    r.struktur_pengurus.map((p) => ({ rwId: r.id, nama: p.nama, jabatan: p.jabatan })),
  );
  if (rwPengurusRows.length > 0) await db.insert(rwPengurus).values(rwPengurusRows);
  console.log(`  ✓ rw: ${rwSeed.length} data seed diperbarui (+ ${rwPengurusRows.length} rw_pengurus)`);

  // 5. Proteksi Berita: Hanya tulis berita seed jika tabel berita kosong (berita lama/CMS 100% aman)
  const existingBerita = await db.select().from(berita);
  if (existingBerita.length === 0) {
    await db.insert(berita).values(
      beritaSeed.map((b) => ({
        id: b.id,
        judul: b.judul,
        slug: b.slug,
        isi: b.isi,
        tanggal: b.tanggal,
        kategori: b.kategori,
        cakupan: b.cakupan,
        rwId: b.rw_id ?? null,
        rwNama: b.rw_nama ?? null,
        gambarCoverUrl: b.gambar_cover_url,
        penulis: b.penulis,
        createdBy: b.created_by,
      })),
    );
    const beritaFotoRows = beritaSeed.flatMap((b) =>
      b.foto_tambahan.map((url) => ({ beritaId: b.id, url })),
    );
    if (beritaFotoRows.length > 0) await db.insert(beritaFotoTambahan).values(beritaFotoRows);
    console.log(`  ✓ berita: ${beritaSeed.length} data seed diawal ditulis`);
  } else {
    console.log(`  🔒 berita: ${existingBerita.length} berita CMS/warga dipertahankan penuh (aman)`);
  }

  // 6. Reseed Galeri
  await db.insert(galeri).values(
    galeriSeed.map((g) => ({
      id: g.id,
      judul: g.judul,
      tipe: g.tipe,
      urlMedia: g.url_media,
      kategori: g.kategori ?? null,
    })),
  );
  console.log(`  ✓ galeri: ${galeriSeed.length} data seed diperbarui`);

  // 7. Reseed UMKM
  await db.insert(umkm).values(
    umkmSeed.map((u) => ({
      id: u.id,
      nama: u.nama,
      slug: u.slug,
      kategori: u.kategori,
      deskripsi: u.deskripsi,
      linkGmaps: u.link_gmaps,
      kontak: u.kontak,
      jamOperasional: u.jam_operasional,
      lokasi: u.lokasi ?? null,
      fotoUtamaUrl: u.foto_utama_url ?? null,
    })),
  );
  const umkmProdukRows = umkmSeed.flatMap((u) =>
    u.produk_unggulan.map((p) => ({ umkmId: u.id, produk: p.produk, fotoUrl: p.foto_url })),
  );
  if (umkmProdukRows.length > 0) await db.insert(umkmProdukUnggulan).values(umkmProdukRows);
  const umkmFotoRows = umkmSeed.flatMap((u) => u.foto_urls.map((url) => ({ umkmId: u.id, url })));
  if (umkmFotoRows.length > 0) await db.insert(umkmFoto).values(umkmFotoRows);
  console.log(
    `  ✓ umkm: ${umkmSeed.length} data seed diperbarui (+ ${umkmProdukRows.length} produk, ${umkmFotoRows.length} foto)`,
  );

  console.log("\n🎉 Seeding selesai dengan aman. Data CMS buatan Admin/Warga terproteksi penuh.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed gagal:", err);
    process.exit(1);
  });
