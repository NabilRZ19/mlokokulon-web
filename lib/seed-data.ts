import type { Berita, Galeri, KampungKb, Rw, StrukturKelurahan, Umkm } from "./types";

// ============================================================
// Data hardcode untuk halaman non-CMS (Profil Desa, Layanan, Kontak, Kampung KB)
// Sesuai PRD: kelurahan_profile, layanan, kontak_perangkat TIDAK ada di Firestore.
// Kampung KB awalnya didesain CMS/Firestore (PRD Bagian 5 & 10), tapi diubah ke hardcode
// atas keputusan user — konten programnya jarang berubah dan masih [DATA MENYUSUL] semua,
// jadi disamakan pola dengan 3 halaman hardcode lain. rw_ref tetap fetch live ke Firestore
// (koleksi `rw` tidak berubah), cuma konten program Kampung KB sendiri yang hardcode.
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

// Data resmi dari Banner Disdukcapil Kabupaten Wonogiri — Pelayanan 3 in 1 Akta Pencatatan Sipil & Kependudukan Gratis.
export const layananData: LayananItem[] = [
  {
    id: "akta-kelahiran-3in1",
    nama: "Akta Kelahiran, KK, dan KIA (Pelayanan 3 in 1)",
    deskripsi: "Pengurusan penerbitan Kutipan Akta Kelahiran sekaligus pembaruan Kartu Keluarga (KK) dan penerbitan Kartu Identitas Anak (KIA) baru.",
    syarat: [
      "Surat Keterangan Kelahiran dari Kelurahan/Desa dan Surat Kelahiran dari Dokter/Bidan Penolong.",
      "Foto copy Surat Nikah / Akta Perkawinan Orang Tua.",
      "Asli Kartu Keluarga (KK) Orang Tua (yang akan dicantumkan nama anak).",
      "Foto copy KTP Orang Tua.",
      "Foto copy KTP 2 (dua) orang Saksi.",
    ],
    kontakJabatan: "Kantor Kelurahan / Hotline",
  },
  {
    id: "akta-kematian-3in1",
    nama: "Akta Kematian, KK, dan KTP-el (Pelayanan 3 in 1)",
    deskripsi: "Pengurusan Akta Kematian sekaligus pembaruan status anggota keluarga pada Kartu Keluarga (KK) dan penyesuaian status KTP-el.",
    syarat: [
      "Surat Keterangan Kematian dari Rumah Sakit.",
      "Surat Kematian dari Desa/Kelurahan.",
      "Asli Kartu Keluarga (KK) dan KTP yang meninggal dunia.",
      "Kutipan Akta Kelahiran yang bersangkutan.",
      "Foto copy KTP 2 (dua) orang Saksi (berusia 21 tahun ke atas).",
      "Bagi Warga Keturunan: Melampirkan Surat Bukti Kewarganegaraan RI & Surat Bukti Ganti Nama (bila ada).",
      "Bagi WNA: Melampirkan foto copy Pasport / Dokumen Imigrasi & STMD dari POLRI.",
    ],
    kontakJabatan: "Kantor Kelurahan / Hotline",
  },
  {
    id: "akta-perkawinan-3in1",
    nama: "Akta Perkawinan, KK, dan KTP-el (Pelayanan 3 in 1)",
    deskripsi: "Pengurusan Akta Perkawinan (Non-Muslim) sekaligus pembaruan status Kartu Keluarga (KK) dan perubahan status perkawinan pada KTP-el.",
    syarat: [
      "Surat Keterangan dari Desa/Kelurahan diketahui Camat.",
      "Bukti Pemberkatan / Pengesahan Perkawinan dari Pemuka Agama masing-masing.",
      "Kutipan Akta Kelahiran Calon Mempelai.",
      "Asli KTP calon mempelai dan Kartu Keluarga (KK).",
      "Akta Perceraian / Akta Kematian bagi calon suami/istri yang pernah kawin.",
      "Izin Orang Tua bagi calon mempelai berumur kurang dari 21 tahun.",
      "Izin Pengadilan Negeri bagi calon mempelai pria < 19 tahun atau wanita < 16 tahun.",
      "Pas foto berdampingan ukuran 4 x 6 cm (berwarna) sebanyak 4 lembar.",
      "Surat Izin dari Komandan/Kepala bagi anggota TNI/POLRI.",
      "Surat Dispensasi dari Camat jika mendaftar kurang dari 10 hari kerja.",
      "Dua orang saksi yang memenuhi persyaratan.",
    ],
    kontakJabatan: "Kantor Kelurahan / Hotline",
  },
  {
    id: "pelayanan-akta-online",
    nama: "Pelayanan Akta & Administrasi Kependudukan Online",
    deskripsi: "Panduan pengurusan dokumen kependudukan secara mandiri via portal resmi Disdukcapil Kabupaten Wonogiri.",
    syarat: [
      "Akses website resmi Disdukcapil Wonogiri (dukcapil.wonogirikab.go.id/layananonline).",
      "Buat akun pendaftaran dengan nomor HP, NIK, password, dan captcha.",
      "Verifikasi akun melalui kode aktivasi SMS.",
      "Pilih jenis permohonan layanan (misal: Akta Kelahiran / Kematian / KK).",
      "Unggah (upload) dokumen persyaratan & Surat Tanggung Jawab Mutlak (SPTJM).",
      "Cek status pendaftaran online dan unduh/ambil dokumen setelah selesai diproses.",
    ],
    kontakJabatan: "Disdukcapil Wonogiri / Online",
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

// rw_ref merujuk id dokumen di koleksi `rw` (masih live-fetch via getRwById), RW 5 (Pencil) =
// Kampung KB. Data program riil dari dokumen resmi RW (ditandatangani Ketua, 24 Mei 2025) —
// bukan lagi [DATA MENYUSUL]. Catatan: item "Pendataan BPJS" di Pokja Perlindungan tertulis
// "BBJS" di dokumen asli, kemungkinan typo — perlu dikonfirmasi ulang ke RW.
export const kampungKbData: KampungKb = {
  rw_ref: "rw-05",
  nama_program: "Guyup Hanyawiji",
  ketua: "Mujiono, S.Pd.I., M.Pd.I.",
  deskripsi_program:
    "Program Kampung KB \"Guyup Hanyawiji\" di RW 05 (Pencil), diketuai oleh Mujiono, S.Pd.I., " +
    "M.Pd.I., dibentuk tahun 2025 dengan 8 kelompok kerja (Pokja) yang mencakup bidang " +
    "keagamaan, pendidikan, reproduksi, ekonomi, perlindungan, kasih sayang, sosial budaya, " +
    "dan pembinaan lingkungan.",
  pokja: [
    {
      nama: "Pokja Keagamaan",
      program: [
        "Pengajian 2 mingguan",
        "TPQ 3 kali 1 minggu",
        "Pengajian hari besar Islam",
        "Program sholat berjamaah di masjid",
        "Pengajian remaja",
        "Mengaji tadarus seminggu sekali",
        "Renovasi masjid",
      ],
    },
    {
      nama: "Pokja Pendidikan",
      program: [
        "Kampung literasi 1x seminggu",
        "Penyuluhan orang tua pentingnya literasi",
        "Les mata pelajaran",
        "Jalan sehat 1 bulan sekali",
      ],
    },
    {
      nama: "Pokja Reproduksi",
      program: [
        "Posyandu balita",
        "Posyandu lansia",
        "Posyandu remaja",
        "Penyuluhan KB PUS",
        "Penyuluhan reproduksi remaja",
      ],
    },
    {
      nama: "Pokja Ekonomi",
      program: [
        "Bimbingan produk unggulan",
        "Penanaman bibit sayuran",
        "Budi daya panili",
        "Pengembangan budi daya kakao/coklat",
        "Car Free Day",
        "Kelompencapir",
        "Pembuatan ecoprint",
      ],
    },
    {
      nama: "Pokja Perlindungan",
      program: [
        "Penyuluhan bahaya narkoba",
        "Perizinan orang punya hajat",
        "Penyuluhan KDRT",
        "Pendataan BPJS",
        "Pelayanan administrasi kependudukan",
      ],
    },
    {
      nama: "Pokja Kasih Sayang",
      program: [
        "Iuran kematian",
        "Dana sosial orang sakit",
        "Dasolin",
        "Pemberian makan tambahan lansia",
        "Pemberian makan tambahan balita",
      ],
    },
    {
      nama: "Pokja Sosial Budaya",
      program: [
        "Membentuk kelompok seni terbang",
        "Kelompok rebana ibu-ibu",
        "Menyelenggarakan lomba-lomba budaya",
      ],
    },
    {
      nama: "Pokja Pembinaan Lingkungan",
      program: [
        "Kerja bakti 2 minggu sekali",
        "Perapian pagar",
        "Penerangan jalan",
        "Penunjuk arah",
        "Penamaan gang jalan",
        "Pemanfaatan pekarangan",
        "Pembuatan jemplongan pekarangan",
      ],
    },
  ],
  foto_highlight_url: "/images/placeholder-photo.svg",
};

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
