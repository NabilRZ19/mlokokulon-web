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
  struktur_pengurus: RwPengurus[];
  statistik: RwStatistik;
  potensi: string;
  cakupan_wilayah_geojson?: string;
}

export interface KampungKb {
  rw_ref: string;
  deskripsi_program: string;
  kegiatan_unggulan: string[];
  foto_highlight_url: string;
}

export type BeritaKategori = "pengumuman" | "kegiatan" | "pembangunan";
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
  penulis: string;
  created_by: string;
  foto_tambahan: string[];
}

export type GaleriTipe = "foto" | "video";

export interface Galeri {
  id: string;
  judul: string;
  tipe: GaleriTipe;
  url_media: string;
  kategori?: string;
}

export interface Umkm {
  id: string;
  nama: string;
  slug: string;
  kategori: string;
  deskripsi: string;
  link_gmaps: string;
  kontak: string;
  produk_unggulan: string[];
  jam_operasional: string;
  foto_urls: string[];
}

export type AdminTier = 1 | 2 | 3;

export interface AdminUser {
  uid: string;
  nama: string;
  tier: AdminTier;
  created_by: string;
}
