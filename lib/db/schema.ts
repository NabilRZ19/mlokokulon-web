import {
  boolean,
  date,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

export type ContentStatus = "draft" | "pending" | "published" | "rejected";

// ID varchar (bukan auto-increment) buat entity yang sudah punya id string di lib/seed-data.ts
// ("rw-01", "berita-01", dst) — supaya seed data tidak perlu diubah, cuma cara nulisnya ke DB.

export const strukturKelurahan = mysqlTable("struktur_kelurahan", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  jabatan: varchar("jabatan", { length: 255 }).notNull(),
  fotoUrl: varchar("foto_url", { length: 512 }).notNull(),
  urutan: int("urutan").notNull(),
}, (table) => [
  index("struktur_kelurahan_urutan_idx").on(table.urutan),
]);

export const rw = mysqlTable("rw", {
  id: varchar("id", { length: 64 }).primaryKey(),
  namaRw: varchar("nama_rw", { length: 255 }).notNull(),
  cakupanDusun: varchar("cakupan_dusun", { length: 255 }).notNull(),
  jumlahRt: int("jumlah_rt").notNull(),
  isKampungKb: boolean("is_kampung_kb").notNull().default(false),
  ketuaNama: varchar("ketua_nama", { length: 255 }),
  ketuaFotoUrl: varchar("ketua_foto_url", { length: 512 }),
  deskripsiSingkat: text("deskripsi_singkat"),
  potensi: text("potensi").notNull(),
  jumlahKk: int("jumlah_kk").notNull(),
  jumlahJiwa: int("jumlah_jiwa").notNull(),
  cakupanWilayahGeojson: text("cakupan_wilayah_geojson"),
}, (table) => [
  index("rw_nama_rw_idx").on(table.namaRw),
]);

// Tabel pengajuan perubahan Ketua RW oleh Tier 3/4 — memerlukan persetujuan Tier 1/2
export const rwKetuaPengajuan = mysqlTable("rw_ketua_pengajuan", {
  id: int("id").primaryKey().autoincrement(),
  rwId: varchar("rw_id", { length: 64 }).notNull().references(() => rw.id, { onDelete: "cascade" }),
  diajukanOlehId: int("diajukan_oleh_id").notNull(),
  diajukanOlehNama: varchar("diajukan_oleh_nama", { length: 255 }).notNull(),
  pengusul: varchar("pengusul", { length: 255 }).notNull(),
  ketuaNamaBaru: varchar("ketua_nama_baru", { length: 255 }).notNull(),
  ketuaFotoUrlBaru: varchar("ketua_foto_url_baru", { length: 512 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull().default("pending"),
  reviewerNote: text("reviewer_note"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => [
  index("rw_ketua_pengajuan_rw_id_idx").on(table.rwId),
  index("rw_ketua_pengajuan_status_idx").on(table.status),
]);

// Child table — struktur_pengurus[] di lib/types.ts
export const rwPengurus = mysqlTable("rw_pengurus", {
  id: int("id").primaryKey().autoincrement(),
  rwId: varchar("rw_id", { length: 64 })
    .notNull()
    .references(() => rw.id, { onDelete: "cascade" }),
  nama: varchar("nama", { length: 255 }).notNull(),
  jabatan: varchar("jabatan", { length: 255 }).notNull(),
  kategori: varchar("kategori", { length: 64 }).notNull().default("rw"),
  organisasi: varchar("organisasi", { length: 255 }),
  icon: varchar("icon", { length: 64 }).default("users"),
}, (table) => [
  index("rw_pengurus_rw_id_idx").on(table.rwId),
]);

export const berita = mysqlTable("berita", {
  id: varchar("id", { length: 64 }).primaryKey(),
  judul: varchar("judul", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  isi: text("isi").notNull(),
  // mode "string" biar tipe TS tetap string, sama kayak Berita.tanggal sebelumnya
  tanggal: date("tanggal", { mode: "string" }).notNull(),
  kategori: mysqlEnum("kategori", ["pengumuman", "kegiatan", "pembangunan", "berita", "kampung-kb"]).notNull(),
  cakupan: mysqlEnum("cakupan", ["kelurahan", "rw"]).notNull(),
  rwId: varchar("rw_id", { length: 64 }).references(() => rw.id, { onDelete: "set null" }),
  rwNama: varchar("rw_nama", { length: 255 }), // denormalisasi, PRD Bagian 7 poin 4
  gambarCoverUrl: varchar("gambar_cover_url", { length: 512 }).notNull(),
  videoUrl: varchar("video_url", { length: 512 }),
  videoTitle: varchar("video_title", { length: 255 }),
  penulis: varchar("penulis", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 64 }).notNull(),
  // Approval workflow — default 'published' agar data lama tetap tampil
  status: mysqlEnum("status", ["draft", "pending", "published", "rejected"]).notNull().default("published"),
  reviewerNote: text("reviewer_note"),
  submittedByTier: tinyint("submitted_by_tier"),
  pengusul: varchar("pengusul", { length: 255 }),
}, (table) => [
  index("berita_tanggal_idx").on(table.tanggal),
  index("berita_rw_id_idx").on(table.rwId),
  index("berita_status_idx").on(table.status),
]);

// Child table — foto_tambahan[] di lib/types.ts
export const beritaFotoTambahan = mysqlTable("berita_foto_tambahan", {
  id: int("id").primaryKey().autoincrement(),
  beritaId: varchar("berita_id", { length: 64 })
    .notNull()
    .references(() => berita.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 512 }).notNull(),
}, (table) => [
  index("berita_foto_tambahan_berita_id_idx").on(table.beritaId),
]);

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
  // Approval workflow
  status: mysqlEnum("status", ["draft", "pending", "published", "rejected"]).notNull().default("published"),
  createdBy: varchar("created_by", { length: 64 }),
  reviewerNote: text("reviewer_note"),
  submittedByTier: tinyint("submitted_by_tier"),
  pengusul: varchar("pengusul", { length: 255 }),
}, (table) => [
  index("galeri_judul_idx").on(table.judul),
  index("galeri_sumber_berita_id_idx").on(table.sumberBeritaId),
  index("galeri_status_idx").on(table.status),
]);

export const umkm = mysqlTable("umkm", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  kategori: varchar("kategori", { length: 100 }).notNull(),
  deskripsi: text("deskripsi").notNull(),
  linkGmaps: varchar("link_gmaps", { length: 512 }).notNull().default(""),
  kontak: varchar("kontak", { length: 100 }).notNull(),
  jamOperasional: varchar("jam_operasional", { length: 100 }).notNull(),
  lokasi: varchar("lokasi", { length: 255 }),
  fotoUtamaUrl: varchar("foto_utama_url", { length: 512 }),
  // Approval workflow
  status: mysqlEnum("status", ["draft", "pending", "published", "rejected"]).notNull().default("published"),
  createdBy: varchar("created_by", { length: 64 }),
  reviewerNote: text("reviewer_note"),
  submittedByTier: tinyint("submitted_by_tier"),
  pengusul: varchar("pengusul", { length: 255 }),
}, (table) => [
  index("umkm_nama_idx").on(table.nama),
  index("umkm_status_idx").on(table.status),
]);

// Child table — produk_unggulan[] di lib/types.ts
export const umkmProdukUnggulan = mysqlTable("umkm_produk_unggulan", {
  id: int("id").primaryKey().autoincrement(),
  umkmId: varchar("umkm_id", { length: 64 })
    .notNull()
    .references(() => umkm.id, { onDelete: "cascade" }),
  produk: varchar("produk", { length: 255 }).notNull(),
  fotoUrl: varchar("foto_url", { length: 512 }),
}, (table) => [
  index("umkm_produk_unggulan_umkm_id_idx").on(table.umkmId),
]);

// Child table — foto_urls[] di lib/types.ts
export const umkmFoto = mysqlTable("umkm_foto", {
  id: int("id").primaryKey().autoincrement(),
  umkmId: varchar("umkm_id", { length: 64 })
    .notNull()
    .references(() => umkm.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 512 }).notNull(),
}, (table) => [
  index("umkm_foto_umkm_id_idx").on(table.umkmId),
]);

export const adminUsers = mysqlTable("admin_users", {
  id: int("id").primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  tier: tinyint("tier").notNull(),
  rwId: varchar("rw_id", { length: 64 }), // diisi untuk Tier 3 & Tier 4
  createdBy: int("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  lastLogin: timestamp("last_login"),
});

export const layanan = mysqlTable("layanan", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  kategori: varchar("kategori", { length: 100 }).notNull().default("Administrasi"),
  deskripsi: text("deskripsi").notNull(),
  persyaratan: json("persyaratan").$type<string[]>().notNull(),
  prosedur: json("prosedur").$type<string[]>().notNull(),
  waktuProses: varchar("waktu_proses", { length: 128 }).notNull().default("1 Hari Kerja"),
  biaya: varchar("biaya", { length: 128 }).notNull().default("Gratis"),
  kontakPenanggungJawab: varchar("kontak_penanggung_jawab", { length: 255 }),
  urutan: int("urutan").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("layanan_urutan_idx").on(table.urutan),
]);

export const pengaturanKampungKb = mysqlTable("pengaturan_kampung_kb", {
  id: varchar("id", { length: 64 }).primaryKey().default("default"),
  rwRef: varchar("rw_ref", { length: 64 }).notNull().default("rw-05"),
  namaProgram: varchar("nama_program", { length: 255 }).notNull(),
  ketua: varchar("ketua", { length: 255 }).notNull(),
  deskripsiProgram: text("deskripsi_program").notNull(),
  skTahun: varchar("sk_tahun", { length: 64 }),
  fungsi: json("fungsi").$type<string[]>(),
  pengurusInti: json("pengurus_inti").$type<any[]>(),
  pokja: json("pokja").$type<any[]>(),
  fotoHighlightUrl: varchar("foto_highlight_url", { length: 512 }),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
