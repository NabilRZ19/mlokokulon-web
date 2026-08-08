export type ContentStatus = "draft" | "pending" | "published" | "rejected";

export interface StrukturKelurahan {
  id: string;
  nama: string;
  jabatan: string;
  foto_url: string;
  urutan: number;
}

export interface RwPengurus {
  nama: string;
  jabatan: string;
  kategori?: "rw" | "rt" | "organisasi";
  organisasi?: string;
  icon?: string;
}

export interface RwStatistik {
  jumlah_kk: number;
  jumlah_jiwa: number;
  [key: string]: number;
}

export interface Rw {
  id: string;
  nama_rw: string;
  cakupan_dusun: string;
  jumlah_rt: number;
  is_kampung_kb: boolean;
  ketua_nama?: string;
  ketua_foto_url?: string;
  deskripsi_singkat?: string;
  struktur_pengurus: RwPengurus[];
  statistik: RwStatistik;
  potensi: string;
  cakupan_wilayah_geojson?: string;
}

export interface RwKetuaPengajuan {
  id: number;
  rw_id: string;
  rw_nama?: string;
  diajukan_oleh_id: number;
  diajukan_oleh_nama: string;
  pengusul: string;
  ketua_nama_baru: string;
  ketua_foto_url_baru?: string;
  status: "pending" | "approved" | "rejected";
  reviewer_note?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface KampungKbPokja {
  nama: string;
  ketua: string;
  anggota: string;
  program: string[];
}

export interface KampungKbPengurusInti {
  jabatan: string;
  nama: string;
}

export interface KampungKb {
  rw_ref: string;
  nama_program: string;
  ketua: string;
  deskripsi_program: string;
  sk_tahun: string;
  fungsi: string[];
  pengurus_inti: KampungKbPengurusInti[];
  pokja: KampungKbPokja[];
  foto_highlight_url: string;
}

export type BeritaKategori = "pengumuman" | "kegiatan" | "pembangunan" | "berita" | "kampung-kb";
export type BeritaCakupan = "kelurahan" | "rw";

export interface Berita {
  id: string;
  judul: string;
  slug: string;
  isi: string;
  tanggal: string; // ISO date
  kategori: BeritaKategori;
  cakupan: BeritaCakupan;
  rw_id?: string;
  rw_nama?: string; // denormalisasi dari rw.nama_rw saat submit
  gambar_cover_url: string;
  video_url?: string;
  video_title?: string;
  penulis: string;
  created_by: string;
  foto_tambahan: string[];
  // Approval workflow
  status?: ContentStatus;
  reviewer_note?: string;
  submitted_by_tier?: number;
  pengusul?: string;
}

export type GaleriTipe = "foto" | "video";

export interface Galeri {
  id: string;
  judul: string;
  tipe: GaleriTipe;
  url_media: string;
  kategori?: string;
  // Diisi kalau foto ini di-link dari form Berita (bukan upload manual langsung ke Galeri).
  sumber_berita_id?: string;
  // Approval workflow
  status?: ContentStatus;
  created_by?: string;
  reviewer_note?: string;
  submitted_by_tier?: number;
  pengusul?: string;
}

export interface UmkmProdukUnggulan {
  produk: string;
  foto_url: string | null;
}

export interface Umkm {
  id: string;
  nama: string;
  slug: string;
  kategori: string;
  deskripsi: string;
  link_gmaps: string;
  kontak: string;
  produk_unggulan: UmkmProdukUnggulan[];
  jam_operasional: string;
  lokasi?: string | null;
  foto_urls: string[];
  foto_utama_url: string | null;
  // Approval workflow
  status?: ContentStatus;
  created_by?: string;
  reviewer_note?: string;
  submitted_by_tier?: number;
  pengusul?: string;
}

/** Tier 4 = Admin Kampung KB (setara Tier 3 dengan speciality Kampung KB) */
export type AdminTier = 1 | 2 | 3 | 4;

export interface AdminUser {
  uid: string;
  nama: string;
  tier: AdminTier;
  rw_id?: string;
  created_by: string;
}

export interface Layanan {
  id: string;
  nama: string;
  kategori: string;
  deskripsi: string;
  persyaratan: string[];
  prosedur: string[];
  waktu_proses: string;
  biaya: string;
  kontak_penanggung_jawab?: string;
  urutan?: number;
}
