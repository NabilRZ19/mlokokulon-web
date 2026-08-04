import type { Berita, Galeri, KampungKb, Rw, RwPengurus, StrukturKelurahan, Umkm } from "./types";

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
  sejarah: "Kelurahan Mlokomanis Kulon dibentuk pada tahun 1981 sebagai wilayah administratif tingkat kelurahan di Kecamatan Ngadirojo, Kabupaten Wonogiri.",
  visi: "Mewujudkan Kabupaten Wonogiri yang Maju, Sejahtera, dan Berkelanjutan",
  misi: [
    "Meningkatkan kualitas sumber daya manusia yang berdaya saing, berkarakter, dan sehat.",
    "Meningkatkan pertumbuhan ekonomi daerah yang inklusif berbasis potensi lokal pertanian, UMKM, dan pariwisata.",
    "Meningkatkan pemerataan pembangunan infrastruktur wilayah yang berkualitas dan berwawasan lingkungan.",
    "Mewujudkan tata kelola pemerintahan yang bersih, efektif, transparan, dan akuntabel berbasis teknologi informasi.",
    "Meningkatkan ketahanan sosial budaya dan keharmonisan kehidupan masyarakat.",
  ],
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
    jabatan: "Hotline Kelurahan",
    nama: "Pelayanan Publik Kelurahan Mlokomanis Kulon",
    whatsapp: "085183184314",
    jamLayanan: "Senin–Kamis 07.00–15.30 WIB, Jumat 07.00–11.00 WIB",
  },
];

// rw_ref merujuk id dokumen di koleksi `rw` (masih live-fetch via getRwById), RW 5 (Pencil) =
// Kampung KB. Data program riil dari dokumen resmi RW (ditandatangani Ketua, 24 Mei 2025) —
// bukan lagi [DATA MENYUSUL]. Catatan: item "Pendataan BPJS" di Pokja Perlindungan tertulis
// "BBJS" di dokumen asli, kemungkinan typo — perlu dikonfirmasi ulang ke RW.
// Nama program, sk_tahun, fungsi, pengurus_inti, dan ketua/anggota tiap Pokja bersumber dari
// SK Kepala Kelurahan Mlokomanis Kulon Nomor [belum diisi di dokumen] Tahun 2023 tentang
// Pembentukan Kampung Keluarga Berkualitas "Guyub Hanyawiji" (Lampiran I & Diktum KEDUA).
export const kampungKbData: KampungKb = {
  rw_ref: "rw-05",
  nama_program: "Guyub Hanyawiji",
  ketua: "Mujiono, S.Pd.I., M.Pd.I.",
  deskripsi_program:
    "Kampung Keluarga Berkualitas (Kampung KB) \"Guyub Hanyawiji\" berpusat di RW 05 (Pencil) Kelurahan Mlokomanis Kulon. Berdasarkan amanat Instruksi Presiden (Inpres) No. 3 Tahun 2022 dan BKKBN RI, Kampung KB diselenggarakan sebagai wadah integrasi dan konvergensi pemberdayaan keluarga dalam seluruh dimensinya—meliputi penyediaan data kependudukan (iBangga), penguatan pola asuh anak & remaja, percepatan penurunan stunting, peningkatan ekonomi keluarga sejahtera, serta penataan pemukiman sehat.",
  sk_tahun: "2023",
  fungsi: [
    "Penyediaan Data Keluarga & Dokumen Kependudukan: Pengelolaan data mikro keluarga (iBangga & RKI) sebagai basis intervensi pembangunan kelurahan terpadu.",
    "Peningkatan Kesehatan Reproduksi & Pelayanan KB: Perluasan jangkauan dan kualitas pelayanan Keluarga Berencana bagi Pasangan Usia Subur (PUS) serta rujukan kesehatan ibu-anak.",
    "Perubahan Perilaku & Pengasuhan Keluarga (Stunting): Penguatan ketahanan dan pola asuh keluarga melalui Bina Keluarga Balita (BKB), Bina Keluarga Remaja (BKR), dan Bina Keluarga Lansia (BKL).",
    "Pemberdayaan Ekonomi Keluarga Sejahtera: Peningkatan pendapatan keluarga melalui kelompok UPPKA (Usaha Peningkatan Pendapatan Keluarga Akseptor) dan potensi ekonomi lokal.",
    "Penataan Lingkungan Pemukiman & Ketahanan Pangan: Penggalangan Gerakan Masyarakat Hidup Sehat (GERMAS), penataan sanitasi, dan pelestarian lingkungan pemukiman hijau.",
    "Penguatan Nilai Sosial Budaya & Keharmonisan Warga: Pemeliharaan ketahanan moral, keagamaan, serta nilai gotong royong dalam kehidupan bermasyarakat.",
  ],
  pengurus_inti: [
    { jabatan: "Penanggung Jawab", nama: "Yulis Triyanto" },
    { jabatan: "Penasehat", nama: "Sulasno, S.E." },
    { jabatan: "Ketua POKJA", nama: "Mujiono, S.Pd.I., M.Pd.I." },
    { jabatan: "Wakil Ketua POKJA", nama: "Sutrisno" },
    { jabatan: "Sekretaris 1", nama: "Kaswati" },
    { jabatan: "Sekretaris 2", nama: "Yuliyanti, S.Pd." },
    { jabatan: "Bendahara 1", nama: "Giyani" },
    { jabatan: "Bendahara 2", nama: "Suhartini" },
  ],
  pokja: [
    {
      nama: "Pokja Keagamaan",
      ketua: "Sukasno",
      anggota: "Suyamto",
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
      ketua: "Nanang Adi Saputra, S.Pd",
      anggota: "Indra Hermawan, S.Pd",
      program: [
        "Kampung literasi 1x seminggu",
        "Penyuluhan orang tua pentingnya literasi",
        "Les mata pelajaran",
        "Jalan sehat 1 bulan sekali",
      ],
    },
    {
      nama: "Pokja Reproduksi",
      ketua: "Yuni Widayati",
      anggota: "Tunggal Fitri",
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
      ketua: "Indra Purwaningsih",
      anggota: "Sri Utami",
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
      ketua: "Warsito",
      anggota: "Suyanto",
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
      ketua: "Putri Wijayanti",
      anggota: "Sugiyanti",
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
      ketua: "Triyanto",
      anggota: "Siswadi",
      program: [
        "Membentuk kelompok seni terbang",
        "Kelompok rebana ibu-ibu",
        "Menyelenggarakan lomba-lomba budaya",
      ],
    },
    {
      nama: "Pokja Pembinaan Lingkungan",
      ketua: "Yatno",
      anggota: "Marlan",
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
  foto_highlight_url: "/api/media/mlokokulon/media/47e4e67c-7c08-4666-bce6-d5dc95c1db49.webp",
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

const deskripsiRwMap: Record<string, string> = {
  "rw-01": "Lingkungan Bulurejo merupakan wilayah administratif RW 1 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Bulurejo berbatasan dengan Lingkungan Soko Lor di sebelah utara, Kelurahan Mlokomanis Wetan di sebelah timur, Lingkungan Soko Kidul di sebelah selatan, serta Lingkungan Pencil di sebelah barat.",
  "rw-02": "Lingkungan Pocung merupakan wilayah administratif RW 2 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Pocung berbatasan dengan Lingkungan Bon Agung di sebelah utara, Lingkungan Soko Kidul di sebelah timur, Kelurahan Ngadirojo Lor di sebelah selatan, serta Kelurahan Ngadirojo Lor di sebelah barat.",
  "rw-03": "Lingkungan Bon Agung merupakan wilayah administratif RW 3 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Bon Agung berbatasan dengan Lingkungan Tempuran di sebelah utara, Lingkungan Soko Kidul di sebelah timur, Lingkungan Pocung di sebelah selatan, serta Kelurahan Ngadirojo Lor di sebelah barat.",
  "rw-04": "Lingkungan Tempuran merupakan wilayah administratif RW 4 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Tempuran berbatasan dengan Lingkungan Pencil di sebelah utara, Lingkungan Bon Agung di sebelah selatan, Lingkungan Soko Kidul di sebelah timur, serta Kelurahan Ngadirojo Lor di sebelah barat.",
  "rw-05": "Lingkungan Pencil merupakan wilayah administratif RW 5 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Selain menjadi kawasan permukiman masyarakat, Lingkungan Pencil juga merupakan lokasi Kantor Kelurahan Mlokomanis Kulon yang menjadi pusat penyelenggaraan pemerintahan dan pelayanan kepada masyarakat. Secara administratif, Lingkungan Pencil berbatasan dengan Lingkungan Jaten di sebelah utara, Lingkungan Soko Lor dan Lingkungan Bulurejo di sebelah timur, Lingkungan Tempuran di sebelah selatan, serta Kelurahan Ngadirojo Lor di sebelah barat.",
  "rw-06": "Lingkungan Jaten merupakan wilayah administratif RW 6 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Jaten berbatasan dengan Kelurahan Kasihan di sebelah utara, Lingkungan Pondok di sebelah timur, Lingkungan Pencil di sebelah selatan, serta Kelurahan Ngadirojo Lor di sebelah barat.",
  "rw-07": "Lingkungan Pondok merupakan wilayah administratif RW 7 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Pondok berbatasan dengan Kelurahan Kasihan di sebelah utara, Lingkungan Ngasinan di sebelah timur, Lingkungan Soko Lor di sebelah selatan, serta Lingkungan Jaten di sebelah barat.",
  "rw-08": "Lingkungan Ngasinan merupakan wilayah administratif RW 8 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Ngasinan berbatasan dengan Kelurahan Kasihan di sebelah utara, Kelurahan Mlokomanis Wetan di sebelah timur, Lingkungan Soko Lor di sebelah selatan, serta Lingkungan Pondok di sebelah barat.",
  "rw-09": "Lingkungan Soko Lor merupakan wilayah administratif RW 9 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Soko Lor berbatasan dengan Lingkungan Pondok di sebelah utara, Lingkungan Ngasinan di sebelah timur, Lingkungan Bulurejo di sebelah selatan, serta Lingkungan Pencil di sebelah barat.",
  "rw-10": "Lingkungan Soko Kidul merupakan wilayah administratif RW 10 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Soko Kidul berbatasan dengan Lingkungan Soko Lor dan Lingkungan Bulurejo di sebelah utara, Kelurahan Mlokomanis Wetan di sebelah timur, Kelurahan Ngadirojo Kidul di sebelah selatan, serta Lingkungan Bon Agung dan Lingkungan Tempuran di sebelah barat.",
};

const pengurusRwMap: Record<string, RwPengurus[]> = {
  "rw-03": [
    { nama: "Widodo", jabatan: "Ketua RW 03" },
    { nama: "Narti", jabatan: "Sekretaris RW 03" },
    { nama: "Drs. Sutarno", jabatan: "Bendahara RW 03" },
    { nama: "Untung", jabatan: "Ketua RT 01" },
    { nama: "Katinem", jabatan: "Sekretaris RT 01" },
    { nama: "Warni", jabatan: "Bendahara RT 01" },
    { nama: "Sunardi", jabatan: "Ketua RT 02" },
    { nama: "Marsudi", jabatan: "Sekretaris RT 02" },
    { nama: "Jalu Asmoro", jabatan: "Bendahara RT 02" },
    { nama: "Usman Catur", jabatan: "Ketua Karang Taruna Bakti Remaja" },
    { nama: "Marsudi", jabatan: "Sekretaris Karang Taruna Bakti Remaja" },
    { nama: "Yekti Utami", jabatan: "Bendahara Karang Taruna Bakti Remaja" },
  ],
  "rw-04": [
    { nama: "Suwandi", jabatan: "Ketua RW 04" },
    { nama: "Minut Sumarsih", jabatan: "Sekretaris RW 04" },
    { nama: "Syukur Rahmadi", jabatan: "Bendahara RW 04" },
    { nama: "Slamet", jabatan: "Ketua RT 01" },
    { nama: "Syukur Rahmadi", jabatan: "Sekretaris RT 01" },
    { nama: "Lilik Tri Kurniawan", jabatan: "Bendahara RT 01" },
    { nama: "Katino", jabatan: "Ketua RT 02" },
    { nama: "Puji Hastuti", jabatan: "Sekretaris RT 02" },
    { nama: "Katino", jabatan: "Bendahara RT 02" },
    { nama: "Suwandi", jabatan: "Ketua Kelompok Tani Pendowo" },
    { nama: "Puji Hastuti", jabatan: "Sekretaris Kelompok Tani Pendowo" },
    { nama: "Taman", jabatan: "Bendahara Kelompok Tani Pendowo" },
    { nama: "Mustofa", jabatan: "Ketua Karang Taruna REDHOSIN" },
    { nama: "Rudi", jabatan: "Wakil Karang Taruna REDHOSIN" },
    { nama: "Putri Amilus & Dwi Waluyo", jabatan: "Sekretaris Karang Taruna REDHOSIN" },
    { nama: "Erni", jabatan: "Bendahara Karang Taruna REDHOSIN" },
  ],
  "rw-05": [
    { nama: "Mujiono, S.Pd.I., M.Pd.I.", jabatan: "Ketua RW 05" },
    { nama: "Sri Mulato", jabatan: "Sekretaris RW 05" },
    { nama: "Nanang Adi Saputro, S.Pd.", jabatan: "Bendahara RW 05" },
    { nama: "Yatno", jabatan: "Ketua RT 01" },
    { nama: "Marlan", jabatan: "Sekretaris RT 01" },
    { nama: "Slamet", jabatan: "Bendahara RT 01" },
    { nama: "Sutrisno", jabatan: "Ketua RT 02" },
    { nama: "Wawan", jabatan: "Sekretaris RT 02" },
    { nama: "Triyanto", jabatan: "Bendahara RT 02" },
  ],
  "rw-06": [
    { nama: "Lissawitri", jabatan: "Ketua RW 06" },
    { nama: "Kardi", jabatan: "Ketua RT 01" },
    { nama: "Nur Diansyah", jabatan: "Ketua RT 02" },
  ],
  "rw-08": [
    { nama: "Suman", jabatan: "Ketua RW Ngasinan" },
    { nama: "Parmanto", jabatan: "Sekretaris RW Ngasinan" },
    { nama: "Suparno", jabatan: "Bendahara RW Ngasinan" },
  ],
  "rw-09": [
    { nama: "Sulardi", jabatan: "Ketua RW 09" },
    { nama: "Tukiman", jabatan: "Ketua RT 01" },
    { nama: "Aref Samsudin", jabatan: "Ketua RT 02" },
    { nama: "Muhajir", jabatan: "Sekretaris RW 09" },
    { nama: "Warijo", jabatan: "Bendahara RW 09" },
  ],
};

const statistikKkMap: Record<string, number> = {
  "rw-03": 130,
  "rw-04": 90,
  "rw-05": 105,
  "rw-06": 90,
  "rw-09": 108,
};

const statistikJiwaMap: Record<string, number> = {
  "rw-03": 362,
  "rw-04": 263,
  "rw-05": 316,
  "rw-06": 351,
  "rw-08": 441,
  "rw-09": 274,
};

const potensiMap: Record<string, string> = {
  "rw-04": "Akademi Voli + Akademi Bola",
  "rw-05": "Kampung KB",
};

export const rwSeed: Rw[] = dusunList.map((nama, i) => {
  const id = `rw-${String(i + 1).padStart(2, "0")}`;
  return {
    id,
    nama_rw: `RW ${String(i + 1).padStart(2, "0")} (${nama})`,
    cakupan_dusun: nama,
    jumlah_rt: rtPerRw[i],
    is_kampung_kb: i === KAMPUNG_KB_INDEX,
    deskripsi_singkat: deskripsiRwMap[id],
    struktur_pengurus: pengurusRwMap[id] || [
      { nama: "Data belum diberikan oleh pihak terkait", jabatan: "Ketua RW" },
      { nama: "Data belum diberikan oleh pihak terkait", jabatan: "Sekretaris" },
    ],
    statistik: {
      jumlah_kk: statistikKkMap[id] ?? kkPerRw[i],
      jumlah_jiwa: statistikJiwaMap[id] ?? jiwaPerRw[i],
    },
    potensi: potensiMap[id] ?? "Data belum diberikan oleh pihak terkait",
  };
});

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
    rw_nama: "RW 05 (Pencil)",
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
    produk_unggulan: [
      { produk: "Keripik Singkong Original", foto_url: null },
      { produk: "Keripik Singkong Balado", foto_url: null },
    ],
    jam_operasional: "08.00–16.00",
    foto_urls: ["/images/placeholder-photo.svg"],
    foto_utama_url: "/images/placeholder-photo.svg",
  },
  {
    id: "umkm-02",
    nama: "Contoh UMKM: Anyaman Bambu Pak Joyo (Dummy)",
    slug: "contoh-umkm-anyaman-bambu-pak-joyo",
    kategori: "Kerajinan",
    deskripsi: "Contoh data UMKM dummy untuk keperluan pengembangan.",
    link_gmaps: "",
    kontak: "0800-0000-1002",
    produk_unggulan: [
      { produk: "Tampah", foto_url: null },
      { produk: "Besek", foto_url: null },
    ],
    jam_operasional: "07.00–15.00",
    foto_urls: ["/images/placeholder-photo.svg"],
    foto_utama_url: "/images/placeholder-photo.svg",
  },
];
