import type { Berita, Galeri, KampungKb, Rw, StrukturKelurahan, Umkm } from "./types";

// ============================================================
// Data hardcode untuk halaman non-CMS (Profil Desa, Layanan, Kontak)
// Sesuai PRD: kelurahan_profile, layanan, kontak_perangkat TIDAK ada di Firestore.
// ============================================================

export interface KelurahanProfileData {
  nama: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  kodeKemendagri: string;
  terbentuk: number;
  sejarah: string;
  visi: string;
  misi: string[];
  geografis: {
    koordinat: string;
    elevasiMdpl: number;
    iklim: string;
    curahHujanMm: number;
    bulanHujan: number;
    tanah: string;
    kemiringanDerajat: number;
  };
  batasWilayah: {
    utara: string;
    timur: string;
    selatan: string;
    barat: string;
  };
  administratif: {
    jumlahKk: number;
    jumlahRw: number;
    jumlahRt: number;
    jumlahDusun: number;
  };
  demografi: {
    totalJiwa: number;
    lakiLaki: number;
    perempuan: number;
  };
  potensi: {
    pertanian: { komoditas: string; luasHektare: number; hasilTonPerHektare: number }[];
    peternakan: { jenis: string; jumlah: number }[];
    catatanEkonomi: string;
  };
}

// Data riil dari riset Wikipedia + JSON acuan user (lihat docs/PROGRESS.md untuk sumber).
// sejarah & visi-misi belum ada datanya — tetap placeholder [DATA MENYUSUL].
export const kelurahanProfileData: KelurahanProfileData = {
  nama: "Mlokomanis Kulon",
  kecamatan: "Ngadirojo",
  kabupaten: "Wonogiri",
  provinsi: "Jawa Tengah",
  kodePos: "57681",
  kodeKemendagri: "33.12.13.1009",
  terbentuk: 1981,
  sejarah: "[DATA MENYUSUL] — narasi sejarah desa & timeline akan dilengkapi tim KKN.",
  visi: "[DATA MENYUSUL] — visi kelurahan akan dilengkapi setelah konfirmasi pihak kelurahan.",
  misi: ["[DATA MENYUSUL]"],
  geografis: {
    koordinat: "7°47'25\" LS, 110°59'43\" BT",
    elevasiMdpl: 485,
    iklim: "Tropis muson, 2 musim",
    curahHujanMm: 916,
    bulanHujan: 8,
    tanah: "Merah, tekstur lempung",
    kemiringanDerajat: 1.04,
  },
  batasWilayah: {
    utara: "Kelurahan Kasihan",
    timur: "Desa Mlokomanis Wetan",
    selatan: "Desa Ngadirojo Lor",
    barat: "Desa Ngadirojo Lor",
  },
  administratif: {
    jumlahKk: 1212,
    jumlahRw: 10,
    jumlahRt: 21,
    jumlahDusun: 10,
  },
  demografi: {
    totalJiwa: 3689,
    lakiLaki: 1811,
    perempuan: 1878,
  },
  potensi: {
    pertanian: [
      { komoditas: "Jagung", luasHektare: 170, hasilTonPerHektare: 4.5 },
      { komoditas: "Padi Sawah", luasHektare: 100, hasilTonPerHektare: 5.0 },
    ],
    peternakan: [
      { jenis: "Sapi", jumlah: 667 },
      { jenis: "Ayam Kampung", jumlah: 4975 },
      { jenis: "Bebek", jumlah: 1540 },
      { jenis: "Kambing", jumlah: 820 },
    ],
    catatanEkonomi:
      "Mayoritas penduduk bekerja sebagai petani. Lahan pertanian mengandalkan musim hujan; sebagian warga usia produktif merantau ke kota besar (Jakarta, Bandung, Batam) karena keterbatasan lahan subur.",
  },
};

export interface LayananItem {
  id: string;
  nama: string;
  deskripsi: string;
  syarat: string[];
  kontakJabatan: string; // rujukan ke kontakPerangkatData
}

// [DATA MENYUSUL] — daftar layanan spesifik belum fixed, ini contoh struktur/dummy.
export const layananData: LayananItem[] = [
  {
    id: "surat-pengantar-ktp",
    nama: "Surat Pengantar KTP/KK",
    deskripsi: "Pengantar untuk pembuatan atau perubahan data KTP dan Kartu Keluarga.",
    syarat: ["Fotokopi KK", "Fotokopi KTP lama (jika ada)", "Surat pengantar RT/RW"],
    kontakJabatan: "Staff Kelurahan",
  },
  {
    id: "surat-domisili",
    nama: "Surat Keterangan Domisili",
    deskripsi: "Keterangan tempat tinggal untuk keperluan administrasi lain.",
    syarat: ["Fotokopi KTP", "Surat pengantar RT/RW"],
    kontakJabatan: "Staff Kelurahan",
  },
  {
    id: "surat-tidak-mampu",
    nama: "Surat Keterangan Tidak Mampu (SKTM)",
    deskripsi: "Keterangan untuk keperluan bantuan sosial, pendidikan, atau kesehatan.",
    syarat: ["Fotokopi KK & KTP", "Surat pengantar RT/RW"],
    kontakJabatan: "Sekretaris Kelurahan",
  },
];

export interface KontakPerangkatItem {
  jabatan: string;
  nama: string;
  whatsapp: string;
  jamLayanan: string;
}

// [DATA MENYUSUL] — kontak riil perangkat belum ada, ini dummy struktur.
export const kontakPerangkatData: KontakPerangkatItem[] = [
  {
    jabatan: "Lurah",
    nama: "(Nama Lurah — Dummy)",
    whatsapp: "0800-0000-0001",
    jamLayanan: "Senin–Jumat, 08.00–15.00",
  },
  {
    jabatan: "Sekretaris Kelurahan",
    nama: "(Nama Sekretaris — Dummy)",
    whatsapp: "0800-0000-0002",
    jamLayanan: "Senin–Jumat, 08.00–15.00",
  },
  {
    jabatan: "Staff Kelurahan",
    nama: "(Nama Staff — Dummy)",
    whatsapp: "0800-0000-0003",
    jamLayanan: "Senin–Jumat, 08.00–15.00",
  },
];

// ============================================================
// Seed data untuk Firestore (koleksi CMS: struktur_kelurahan, rw, kampung_kb,
// berita, galeri, umkm). ID dokumen deterministik supaya npm run db:seed idempotent.
// ============================================================

export const strukturKelurahanSeed: StrukturKelurahan[] = [
  { id: "struktur-01", nama: "(Nama Lurah — Dummy)", jabatan: "Lurah", foto_url: "/images/placeholder-avatar.svg", urutan: 1 },
  { id: "struktur-02", nama: "(Nama Sekretaris — Dummy)", jabatan: "Sekretaris Kelurahan", foto_url: "/images/placeholder-avatar.svg", urutan: 2 },
  { id: "struktur-03", nama: "(Nama Staff — Dummy)", jabatan: "Staff Kelurahan", foto_url: "/images/placeholder-avatar.svg", urutan: 3 },
];

// 10 dusun riil dijadikan basis 10 RW. jumlah_rt (total 21) & statistik KK/jiwa (total
// 1212 KK / 3689 jiwa) dibagi proporsional. struktur_pengurus & potensi tetap dummy.
// RW 5 (Pencil) = Kampung KB, dikonfirmasi user (bukan dummy).
const dusunList = [
  "Bulurejo",
  "Pocung",
  "Bonagung",
  "Tempuran",
  "Pencil",
  "Jaten",
  "Pondok",
  "Ngasinan",
  "Soko Lor",
  "Soko Kidul",
];
const rtPerRw = [2, 2, 2, 2, 2, 2, 2, 2, 2, 3]; // total 21
const kkPerRw = [121, 121, 121, 121, 121, 121, 121, 121, 122, 122]; // total 1212
const jiwaPerRw = [369, 369, 369, 369, 369, 369, 369, 369, 369, 368]; // total 3689
const KAMPUNG_KB_INDEX = 4; // RW 5 = Pencil

export const rwSeed: Rw[] = dusunList.map((nama, i) => ({
  id: `rw-${String(i + 1).padStart(2, "0")}`,
  nama_rw: `RW ${String(i + 1).padStart(2, "0")} — ${nama}`,
  cakupan_dusun: nama,
  jumlah_rt: rtPerRw[i],
  is_kampung_kb: i === KAMPUNG_KB_INDEX,
  struktur_pengurus: [
    { nama: `(Ketua RW ${nama} — Dummy)`, jabatan: "Ketua RW" },
    { nama: `(Sekretaris RW ${nama} — Dummy)`, jabatan: "Sekretaris" },
  ],
  statistik: {
    jumlah_kk: kkPerRw[i],
    jumlah_jiwa: jiwaPerRw[i],
  },
  potensi: "[DATA MENYUSUL] — potensi spesifik RW ini belum dikonfirmasi.",
}));

export const kampungKbSeed: KampungKb & { id: string } = {
  id: "kampung-kb-01",
  rw_ref: "rw-05",
  deskripsi_program:
    "[DATA MENYUSUL] — penjelasan program Kampung KB menunggu konfirmasi Pak RW 05 (Pencil).",
  kegiatan_unggulan: ["[DATA MENYUSUL]"],
  foto_highlight_url: "/images/placeholder-photo.svg",
};

export const beritaSeed: Berita[] = [
  {
    id: "berita-01",
    judul: "Contoh Berita: Kerja Bakti Bersih Desa",
    slug: "contoh-berita-kerja-bakti-bersih-desa",
    isi: "Ini adalah contoh berita dummy untuk keperluan pengembangan. Isi berita sesungguhnya akan diisi admin lewat CMS.",
    tanggal: "2026-07-01",
    kategori: "kegiatan",
    cakupan: "kelurahan",
    gambar_cover_url: "/images/placeholder-photo.svg",
    penulis: "Admin Kelurahan (Dummy)",
    created_by: "dummy-admin",
    foto_tambahan: [],
  },
  {
    id: "berita-02",
    judul: "Contoh Berita: Pengumuman Jadwal Posyandu",
    slug: "contoh-berita-pengumuman-jadwal-posyandu",
    isi: "Ini adalah contoh berita dummy untuk keperluan pengembangan.",
    tanggal: "2026-06-20",
    kategori: "pengumuman",
    cakupan: "rw",
    rw_id: "rw-05",
    rw_nama: "RW 05 — Pencil",
    gambar_cover_url: "/images/placeholder-photo.svg",
    penulis: "Admin RW 05 (Dummy)",
    created_by: "dummy-admin",
    foto_tambahan: [],
  },
  {
    id: "berita-03",
    judul: "Contoh Berita: Progres Pembangunan Jalan Dusun",
    slug: "contoh-berita-progres-pembangunan-jalan-dusun",
    isi: "Ini adalah contoh berita dummy untuk keperluan pengembangan.",
    tanggal: "2026-06-10",
    kategori: "pembangunan",
    cakupan: "kelurahan",
    gambar_cover_url: "/images/placeholder-photo.svg",
    penulis: "Admin Kelurahan (Dummy)",
    created_by: "dummy-admin",
    foto_tambahan: [],
  },
];

export const galeriSeed: Galeri[] = [
  { id: "galeri-01", judul: "Contoh Foto Balai Kelurahan (Dummy)", tipe: "foto", url_media: "/images/placeholder-photo.svg", kategori: "umum" },
  { id: "galeri-02", judul: "Contoh Foto Kegiatan Warga (Dummy)", tipe: "foto", url_media: "/images/placeholder-photo.svg", kategori: "kegiatan" },
  { id: "galeri-03", judul: "Contoh Foto Kampung KB (Dummy)", tipe: "foto", url_media: "/images/placeholder-photo.svg", kategori: "kampung-kb" },
];

export const umkmSeed: Umkm[] = [
  {
    id: "umkm-01",
    nama: "Contoh UMKM: Keripik Singkong Bu Sri (Dummy)",
    slug: "contoh-umkm-keripik-singkong-bu-sri",
    kategori: "Kuliner",
    deskripsi: "Contoh data UMKM dummy untuk keperluan pengembangan.",
    link_gmaps: "",
    kontak: "0800-0000-1001",
    produk_unggulan: ["Keripik Singkong Original", "Keripik Singkong Balado"],
    jam_operasional: "08.00–16.00",
    foto_urls: ["/images/placeholder-photo.svg"],
  },
  {
    id: "umkm-02",
    nama: "Contoh UMKM: Anyaman Bambu Pak Joyo (Dummy)",
    slug: "contoh-umkm-anyaman-bambu-pak-joyo",
    kategori: "Kerajinan",
    deskripsi: "Contoh data UMKM dummy untuk keperluan pengembangan.",
    link_gmaps: "",
    kontak: "0800-0000-1002",
    produk_unggulan: ["Tampah", "Besek"],
    jam_operasional: "07.00–15.00",
    foto_urls: ["/images/placeholder-photo.svg"],
  },
];
