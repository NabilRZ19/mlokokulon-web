import {
  boolean,
  date,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

// ID varchar (bukan auto-increment) buat entity yang sudah punya id string di lib/seed-data.ts
// ("rw-01", "berita-01", dst) — supaya seed data tidak perlu diubah, cuma cara nulisnya ke DB.

export const strukturKelurahan = mysqlTable("struktur_kelurahan", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  jabatan: varchar("jabatan", { length: 255 }).notNull(),
  fotoUrl: varchar("foto_url", { length: 512 }).notNull(),
  urutan: int("urutan").notNull(),
});

export const rw = mysqlTable("rw", {
  id: varchar("id", { length: 64 }).primaryKey(),
  namaRw: varchar("nama_rw", { length: 255 }).notNull(),
  cakupanDusun: varchar("cakupan_dusun", { length: 255 }).notNull(),
  jumlahRt: int("jumlah_rt").notNull(),
  isKampungKb: boolean("is_kampung_kb").notNull().default(false),
  potensi: text("potensi").notNull(),
  jumlahKk: int("jumlah_kk").notNull(),
  jumlahJiwa: int("jumlah_jiwa").notNull(),
  cakupanWilayahGeojson: text("cakupan_wilayah_geojson"),
});

// Child table — struktur_pengurus[] di lib/types.ts
export const rwPengurus = mysqlTable("rw_pengurus", {
  id: int("id").primaryKey().autoincrement(),
  rwId: varchar("rw_id", { length: 64 })
    .notNull()
    .references(() => rw.id, { onDelete: "cascade" }),
  nama: varchar("nama", { length: 255 }).notNull(),
  jabatan: varchar("jabatan", { length: 255 }).notNull(),
});

export const berita = mysqlTable("berita", {
  id: varchar("id", { length: 64 }).primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isi: text("isi").notNull(),
  // mode "string" biar tipe TS tetap string, sama kayak Berita.tanggal sebelumnya
  tanggal: date("tanggal", { mode: "string" }).notNull(),
  kategori: mysqlEnum("kategori", ["pengumuman", "kegiatan", "pembangunan"]).notNull(),
  cakupan: mysqlEnum("cakupan", ["kelurahan", "rw"]).notNull(),
  rwId: varchar("rw_id", { length: 64 }).references(() => rw.id),
  rwNama: varchar("rw_nama", { length: 255 }), // denormalisasi, PRD Bagian 7 poin 4
  gambarCoverUrl: varchar("gambar_cover_url", { length: 512 }).notNull(),
  penulis: varchar("penulis", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 64 }).notNull(),
});

// Child table — foto_tambahan[] di lib/types.ts
export const beritaFotoTambahan = mysqlTable("berita_foto_tambahan", {
  id: int("id").primaryKey().autoincrement(),
  beritaId: varchar("berita_id", { length: 64 })
    .notNull()
    .references(() => berita.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 512 }).notNull(),
});

export const galeri = mysqlTable("galeri", {
  id: varchar("id", { length: 64 }).primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  tipe: mysqlEnum("tipe", ["foto", "video"]).notNull(),
  urlMedia: varchar("url_media", { length: 512 }).notNull(),
  kategori: varchar("kategori", { length: 100 }),
  // Nullable — diisi kalau foto ini di-link dari form Berita (checkbox "tampilkan juga di
  // Galeri" saat upload, keputusan baru pasca migrasi ke SQL — lihat CLAUDE.md "Keputusan
  // yang Sudah Final"). null berarti diupload manual langsung ke Galeri seperti biasa.
  sumberBeritaId: varchar("sumber_berita_id", { length: 64 }).references(() => berita.id, {
    onDelete: "set null",
  }),
});

export const umkm = mysqlTable("umkm", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  kategori: varchar("kategori", { length: 100 }).notNull(),
  deskripsi: text("deskripsi").notNull(),
  linkGmaps: varchar("link_gmaps", { length: 512 }).notNull().default(""),
  kontak: varchar("kontak", { length: 100 }).notNull(),
  jamOperasional: varchar("jam_operasional", { length: 100 }).notNull(),
});

// Child table — produk_unggulan[] di lib/types.ts
export const umkmProdukUnggulan = mysqlTable("umkm_produk_unggulan", {
  id: int("id").primaryKey().autoincrement(),
  umkmId: varchar("umkm_id", { length: 64 })
    .notNull()
    .references(() => umkm.id, { onDelete: "cascade" }),
  produk: varchar("produk", { length: 255 }).notNull(),
});

// Child table — foto_urls[] di lib/types.ts
export const umkmFoto = mysqlTable("umkm_foto", {
  id: int("id").primaryKey().autoincrement(),
  umkmId: varchar("umkm_id", { length: 64 })
    .notNull()
    .references(() => umkm.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 512 }).notNull(),
});

export const adminUsers = mysqlTable("admin_users", {
  id: int("id").primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  tier: tinyint("tier").notNull(),
  createdBy: int("created_by"),
});
