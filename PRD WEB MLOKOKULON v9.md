# Product Requirements Document (PRD)
## Web Profil Kelurahan Mlokomanis Kulon

**Program:** KKN (Kuliah Kerja Nyata)
**Lokasi:** Kelurahan Mlokomanis Kulon, Wonogiri
**Versi Dokumen:** 9.0 (Revisi berdasarkan implementasi repository)
**Disusun oleh:** Nabil (Tim KKN)

---

## 0. Ringkasan Cepat (untuk AI Coding Assistant / Developer)

Ini adalah PRD web profil desa berbasis **Next.js (App Router, TypeScript) + Vercel**, mobile-first, untuk kebutuhan program KKN. Backend telah dimigrasi menggunakan **MySQL, Drizzle ORM, dan MinIO**. Baca dokumen lengkap sebelum mulai coding. Poin kunci:

- **10 halaman publik** + 1 panel admin (CMS) dengan sistem **3 tier akses**.
- **Tech stack sudah final:** Next.js (App Router) + TypeScript + Tailwind CSS v4 di frontend, di-hosting di **Vercel**. Backend menggunakan **MySQL di VPS milik teman**, diakses melalui **Drizzle ORM**.
- **Autentikasi Custom:** Menggunakan `bcryptjs` untuk hashing password, `jose` untuk JWT session, dan httpOnly cookie (`admin_session`), menggantikan Firebase Auth.
- **Storage:** Seluruh media disimpan di **MinIO (S3-compatible)** melalui `@aws-sdk/client-s3`, dengan upload melalui API server (`app/api/admin/upload/route.ts`).
- **Prioritas #1: mobile-first**, terutama untuk panel admin karena mayoritas admin mengelola konten dari HP. Urutan kerja layout: kerjakan desain/UI *desktop-first* untuk menyelesaikan fungsionalitas, lalu wajib lakukan *pass* optimasi khusus mobile di Fase 5.
- **Prioritas #2: performa & hemat kuota/resource** — koneksi internet daerah terbatas, jadi wajib SSG/ISR di halaman publik, kompresi gambar client-side (sebelum upload), dan zero real-time listener di panel admin.
- **Prioritas #3: low-maintenance & security sederhana** — target dikelola berkelanjutan; pembatasan akses per tier divalidasi di level aplikasi/UI (session JWT), bukan di level database.
- **Admin dibagi 3 tier** (bukan per divisi): Tier 1 Super Admin (tim dev & Sekretaris Kelurahan, akses penuh), Tier 2 Admin Kelurahan (Struktur Kelurahan + Berita/Galeri/UMKM), Tier 3 Admin RW (data RW + Berita/Galeri/UMKM). Tidak ada `rw_scope` di akun admin — Tier 3 bebas memilih RW mana yang ingin diedit langsung di form.
- **Konten yang jarang berubah di-hardcode di kode:** Profil Desa, Layanan, Kontak, dan **Kampung KB** (tidak dikelola lewat CMS).
- **Berita** punya cakupan wilayah berbentuk pilihan **"Kelurahan" atau "RW tertentu"** (klik salah satu di form input), dan halaman list berita bisa difilter berdasarkan cakupan yang sama.
- **Galeri:** Diisi lewat upload manual di CMS, atau secara **semi-otomatis lewat checkbox** saat menginput Berita.

---

## 1. Latar Belakang

Desa Mlokomanis Kulon saat ini belum memiliki media informasi digital resmi yang dapat diakses publik secara luas. Informasi mengenai profil, potensi, kegiatan, dan data desa masih tersebar secara manual (papan pengumuman, media sosial pribadi perangkat desa, dsb).

Sebagai bagian dari program KKN, tim mengusulkan pembangunan **website profil desa** sebagai media informasi terpusat, resmi, dan mudah diakses oleh siapa saja — baik warga, wisatawan, maupun pihak dinas/pemerintah terkait.

## 2. Tujuan (Goals)

1. Menyediakan sumber informasi resmi dan terpusat mengenai Desa Mlokomanis Kulon.
2. Meningkatkan transparansi data kependudukan dan pemerintahan desa, hingga tingkat RW.
3. Mempromosikan potensi desa (UMKM, wisata, budaya) ke publik yang lebih luas.
4. Memudahkan warga/masyarakat umum menghubungi perangkat desa untuk keperluan administrasi.
5. Mengangkat **Kampung KB** sebagai program unggulan desa dengan visibilitas tinggi di website.
6. Menjadi warisan digital (deliverable) program KKN yang dapat dikelola berkelanjutan oleh perangkat desa & Karang Taruna setelah program selesai, dengan beban maintenance seminimal mungkin.

## 3. Target Pengguna

**Target utama: Umum / semua kalangan**, dengan beberapa segmen:
- **Warga desa** — mencari info pengumuman, struktur organisasi, kontak perangkat desa, info RW masing-masing.
- **Wisatawan/pengunjung luar** — mencari info potensi wisata, UMKM, galeri desa.
- **Pemerintah/dinas terkait** — mencari data statistik dan profil desa untuk keperluan administratif/pelaporan.
- **Masyarakat umum lain** — pencari informasi umum tentang desa (riset, kerja sama, dsb).

**Pengelola konten (sistem 3 tier):**
- **Tier 1 (Super Admin)** — tim dev & Sekretaris Kelurahan.
- **Tier 2 (Admin Kelurahan)** — mengelola data tingkat kelurahan + Berita/Galeri/UMKM.
- **Tier 3 (Admin RW)** — mengelola data RW ybs + Berita/Galeri/UMKM.

**Catatan penting:** Semua pengelola konten mayoritas mengakses **dari perangkat mobile**, sehingga desain CMS/admin panel wajib dioptimasi untuk mobile terlebih dahulu (mobile-first), baru desktop.

## 4. Ruang Lingkup (Scope)

### 4.1 Termasuk dalam scope:
- Website informasi/profil desa (statis untuk konten jarang berubah, dinamis untuk berita, galeri & UMKM), dibangun di atas **Next.js (App Router) + Vercel** (frontend/hosting) dan backend **MySQL + MinIO**.
- Konten dikelola melalui panel admin sederhana (CMS ringan), dioptimasi untuk pengelolaan dari HP, dengan sistem 3 tier akses yang disederhanakan — pembatasan per-RW cukup di level logic aplikasi/UI, bukan di DB.
- Halaman **Layanan**: informasi layanan yang bisa dilakukan di kelurahan + penghubung ke kontak perangkat terkait — konten di-hardcode di kode, diisi/diupdate langsung oleh tim dev saat konten sudah fixed.
- Halaman **Profil Desa** dan **Kampung KB**: konten di-hardcode di kode.
- Data & profil per-RW (statistik, struktur, potensi, berita terfilter, cakupan wilayah).
- Halaman & highlight khusus untuk **Kampung KB** sebagai program unggulan.
- Katalog UMKM & perusahaan, plus potensi lain yang mungkin ditambahkan ke daftar yang sama.
- Galeri diisi lewat upload manual ke CMS, atau semi-otomatis lewat checkbox dari form Berita.
- Berita bisa diinput oleh Tier 2 maupun Tier 3, dengan pilihan cakupan wilayah berupa toggle/klik "Kelurahan" atau "RW tertentu" di form input.
- Optimasi performa wajib diterapkan — zero real-time listener di admin, SSG/ISR di halaman publik, kompresi gambar client-side (WebP, maks 500KB) sebelum upload ke Storage, dan denormalisasi data secukupnya.

### 4.2 Tidak termasuk dalam scope (out of scope):
- Sistem pengajuan/pencetakan surat administrasi online (e-office).
- Sistem pembayaran/transaksi online.
- Aplikasi mobile native.
- Sistem login untuk warga (akun publik) — hanya ada login untuk admin/pengelola konten.
- Real-time listener (`onSnapshot`/socket) di panel admin — dilarang keras demi hemat resource.
- Penguncian akses ketat per-RW di level database (Row-Level Security) — pembatasan divalidasi di level aplikasi/UI (form & route guard) agar tetap sederhana dan mudah dirawat.

## 5. Daftar Halaman (Sitemap)

| No | Halaman | Route (usulan) | Ringkasan |
|----|---------|-----------------|-----------|
| 1 | **Beranda** | `/` | Landing page + teaser Kampung KB |
| 2 | **Profil Desa** | `/profil` | Sejarah, visi-misi, letak geografis (hardcode) |
| 3 | **Struktur Kelurahan** | `/struktur` | Struktur organisasi tingkat kelurahan (CMS) |
| 4 | **Wilayah Administratif** | `/wilayah` | Halaman utama: peta interaktif + list RW (CMS) |
| 5 | **Profil per RW** | `/wilayah/[rw-slug]` | Detail tiap RW (CMS) |
| 6 | **Kampung KB** | `/kampung-kb` | Halaman khusus program unggulan, highlight & link ke RW (hardcode) |
| 7 | **Layanan** | `/layanan` | Info layanan kelurahan + link kontak perangkat (hardcode) |
| 8 | **Berita & Pengumuman** | `/berita`, `/berita/[slug]` | List berita, filter berdasarkan cakupan wilayah (CMS) |
| 9 | **Galeri** | `/galeri` | Foto/video (CMS) |
| 10 | **UMKM & Potensi** | `/umkm`, `/umkm/[slug]` | Daftar & detail UMKM, perusahaan, potensi (CMS) |
| 11 | **Kontak** | `/kontak` | Kontak perangkat desa per jabatan (hardcode) |
| — | **Admin/CMS** | `/admin/*` | Panel login, 3-tier (Auth Custom JWT) |

## 6. Detail Konten per Halaman

### 6.1 Beranda
Urutan section (top to bottom, disusun berdasarkan prioritas & performa loading):
1. **Hero Banner** — nama desa, tagline, foto utama, CTA ("Lihat Profil" / "Hubungi Kami").
2. **Statistik Singkat + Potensi Utama** — angka ringkas (jumlah penduduk, KK, jumlah RW, luas wilayah) + 1-2 paragraf singkat potensi unggulan desa.
3. **🌟 Teaser Kampung KB** — section singkat/highlight khusus (foto, judul "Kampung Keluarga Berkualitas", 1-2 kalimat penjelasan, badge/label RW terkait) + tombol "Lihat Selengkapnya" ke halaman `/kampung-kb`.
4. **Berita Terbaru** — 3-4 kartu berita terbaru + tombol "Lihat Semua Berita".
5. **Galeri (Carousel)** — carousel foto/video singkat + tombol "Lihat Galeri Lengkap".
6. **Peta (Fixed/Statis)** — gambar/embed ringan menampilkan seluruh wilayah kelurahan (bukan versi interaktif penuh, agar loading cepat) + tombol ke "Wilayah Administratif".
7. **Footer** — kontak perangkat desa & sosial media.

### 6.2 Profil Desa *(konten di-hardcode di kode, bukan lewat CMS)*
- Sejarah desa — narasi teks + timeline/infografis singkat `[DATA MENYUSUL]`.
- Visi & misi `[DATA MENYUSUL]`.
- Letak geografis & batas wilayah.
- (link ke) Struktur Kelurahan.

### 6.3 Struktur Kelurahan *(CMS)*
- Bagan struktur organisasi tingkat kelurahan saja (Lurah, Sekdes, Kasi, dst).
- Data bisa diedit admin lewat CMS karena sewaktu-waktu bisa ada pergantian jabatan.
- Struktur tiap RW tidak ditampilkan di sini — ada di halaman profil masing-masing RW.

### 6.4 Wilayah Administratif (Halaman Utama + Daftar RW)
- **Section utama: Peta Interaktif** menampilkan seluruh wilayah kelurahan (Leaflet.js, bila data GeoJSON tersedia).
- **Di bawah/samping peta: list/kisi seluruh RW** (nama RW, cakupan dusun, jumlah RT).
- RW yang berstatus **Kampung KB** diberi highlight/badge khusus di list ini juga.
- Klik satu RW → halaman profil RW (`/wilayah/[rw-slug]`), berisi:
  - Struktur organisasi RW tersebut (Ketua RW, RT, kader, dsb).
  - Statistik RW (tabel: jumlah KK, jumlah jiwa, dsb).
  - Potensi RW (jika ada potensi spesifik: UMKM, wisata lokal, dsb).
  - Berita/kegiatan yang terfilter khusus RW tersebut.
  - Cakupan wilayah RW (potongan peta/maps khusus area RW ybs).
  - Jika RW tsb adalah Kampung KB → tampilkan badge + link balik ke halaman `/kampung-kb`.

### 6.5 Kampung KB *(konten di-hardcode)*
Halaman dedicated untuk program unggulan **Kampung Keluarga Berkualitas**:
- Penjelasan umum program (apa itu Kampung KB, tujuannya) `[DATA MENYUSUL]`.
- Highlight RW yang menjadi lokasi Kampung KB (foto, nama RW).
- Ringkasan kegiatan/program yang berjalan di Kampung KB tsb (8 Pokja).
- **Link langsung ke halaman profil RW terkait** (`/wilayah/[rw-slug]`).
- **Section Galeri Kegiatan** yang melakukan reuse koleksi `galeri` dengan filter `kategori === "kampung-kb"`.

### 6.6 Layanan *(konten di-hardcode di kode, bukan lewat CMS)*
- Daftar layanan yang bisa dilakukan/diurus di kelurahan (misal: legalisir, surat pengantar, dsb — sebatas informasi, bukan pengajuan online).
- Tiap layanan terhubung ke kontak perangkat desa yang menangani (link ke `/kontak` atau langsung nomor WA terkait).
- Karena jarang berubah, halaman ini di-hardcode/SSG langsung di kode. Struktur/komponen dibangun dulu, isi konten diupdate menyusul lewat kode.

### 6.7 Berita & Pengumuman *(CMS)*
- List berita per kategori (mis. Pengumuman, Kegiatan, Pembangunan).
- **Cakupan wilayah:** tiap berita punya cakupan berupa pilihan **"Kelurahan"** atau **"RW tertentu"** — dipilih lewat toggle/klik di form input. Halaman list berita di publik bisa difilter berdasarkan cakupan ini.
- Detail berita: judul, isi, tanggal, kategori, gambar cover, penulis.
- Bisa dikelola oleh admin Tier 2 maupun Tier 3. Karena tidak ada `rw_scope` di akun admin, admin memilih sendiri cakupan tiap kali input berita.
- **Fitur Galeri Semi-Otomatis:** Saat admin meng-upload foto di form Berita, ada checkbox "tampilkan juga di Galeri".

### 6.8 Galeri *(CMS)*
Diisi lewat **upload manual langsung** ke Galeri lewat CMS, atau lewat checkbox form berita. Wajib diisi dengan judul/annotation per foto agar pengunjung paham konteks foto tsb.

### 6.9 Katalog UMKM & Potensi Lainnya *(CMS)*
List dikelompokkan per kategori usaha (mis. Kuliner, Kerajinan, Jasa, dll). Kategori bisa diperluas untuk mencakup potensi lain di luar UMKM (misal: wisata, komunitas, dsb) jika diperlukan.
Field per item (lengkap):
- Nama usaha/potensi, Kategori, Foto, Deskripsi singkat, Kontak, Lokasi (link GMaps), Produk unggulan, Jam operasional.

### 6.10 Kontak *(konten di-hardcode di kode, bukan lewat CMS)*
- Kontak perangkat desa per jabatan (nama, WhatsApp, jam layanan).
- Tidak ada sistem pengajuan surat — murni informasi kontak.
- Dijadikan rujukan dari halaman Layanan.

## 7. Non-Functional Requirements

- **Mobile-first & Urutan Pengerjaan:** Desain/bangun UI-UX dikerjakan *desktop-first* untuk menyelesaikan layout standar dan fungsionalitas, baru setelah semua komponen selesai secara fungsional, lakukan *pass* optimasi khusus untuk mobile di Fase 5. Target akhir tetap wajib mobile-friendly.
- **Performa (koneksi internet terbatas):**
  - Static Site Generation/ISR (Next.js) untuk halaman publik.
  - Kompresi gambar otomatis + format WebP (`next/image` untuk render, `browser-image-compression` untuk kompresi sebelum upload).
  - Lazy loading gambar/video.
  - Leaflet.js untuk peta interaktif.
  - Pagination pada berita, UMKM, & galeri.
- **Aturan Optimasi (kritikal, wajib diikuti):**
  1. **Zero real-time di panel admin.** Fetch-once untuk ambil data. Setiap tabel/daftar data di CMS wajib punya komponen "Muat Ulang Data" manual sebagai pengganti auto-refresh.
  2. **SSG/ISR untuk halaman publik.** Halaman publik wajib pakai Next.js caching, **bukan** fetch DB langsung dari browser client. Fetch dilakukan lewat `lib/queries.ts` di server component.
  3. **Kompresi gambar wajib di sisi client sebelum upload.** Semua gambar dikompresi di browser (pakai `browser-image-compression` — WebP, maks 500KB) sebelum dikirim ke `app/api/admin/upload/route.ts` → MinIO.
  4. **Denormalisasi data secukupnya.** Field yang sering dibutuhkan bersamaan disimpan langsung (contoh: `berita.rw_nama` disalin dari `rw.nama_rw` saat submit), supaya tidak perlu JOIN query berkali-kali. Konsekuensinya: kalau nama RW berubah, salinan nama di dokumen berita lama tidak otomatis ikut berubah — ini trade-off yang disengaja, bukan bug.
- **Low-maintenance & Security:**
  - Guard tier di level aplikasi (session JWT + route guard), bukan di level DB. Tidak ada row-level security ketat per-RW.
  - Konten yang jarang berubah di-hardcode/SSG di kode.

## 8. Rekomendasi Navbar

Struktur usulan:
    Beranda
    Pemerintahan ▾
      ├── Profil Desa (sejarah, visi-misi, letak geografis)
      └── Struktur Organisasi
    Wilayah Administratif       (langsung ke halaman peta interaktif + list RW)
    ⭐ Kampung KB                (highlight/badge khusus — warna beda dari menu lain)
    Layanan
    Berita
    UMKM & Potensi
    Kontak

**Saran untuk isi dropdown "Pemerintahan":**
- Cukup 2 item (Profil Desa & Struktur Organisasi) agar ringkas di mobile dropdown — menggabungkan sejarah/visi-misi/geografis ke dalam satu halaman "Profil Desa" (sudah sesuai Bagian 6.2).
- Jika nanti ada kebutuhan tambahan (mis. "Dasar Hukum/Regulasi Desa"), bisa ditambah sebagai item ke-3.

**Saran penempatan highlight Kampung KB:**
- Ditempatkan sebagai **item navbar tersendiri** (bukan submenu Wilayah Administratif) dengan styling berbeda (badge, warna aksen, atau ikon bintang) — supaya benar-benar menonjol sebagai program unggulan, sesuai permintaan.
- Alternatif jika navbar dirasa terlalu penuh di mobile: taruh di dalam dropdown "Wilayah Administratif" tapi tetap dengan badge mencolok.

**Mobile (hamburger menu):** struktur sama seperti di atas ditampilkan sebagai accordion/list vertikal. Kampung KB tetap ditonjolkan dengan badge meskipun masuk hamburger menu.

## 9. Tech Stack (Final)

| Layer | Pilihan |
|-------|---------|
| Frontend Framework | Next.js (App Router) + TypeScript |
| Styling | **Tailwind CSS v4** |
| Hosting/Deploy | **Vercel** (auto-deploy dari GitHub) |
| Backend DB | **MySQL (di VPS milik teman)**, diakses lewat **Drizzle ORM** (`mysql2`, `drizzle-kit`) |
| File Storage | **MinIO (S3 Compatible)** (di VPS yang sama) lewat `@aws-sdk/client-s3` |
| Authentication | **Custom Auth** (`bcryptjs`, `jose` JWT, Cookie `admin_session`) |
| Peta | Leaflet.js + GeoJSON (dari QGIS) |
| Domain | Konvensional (`.com`/`.my.id`/dll — bukan `.desa.id`) |

### Detail Implementasi Backend (MySQL)

- **Database & ORM:** Relasional MySQL. Dipilihnya Drizzle ORM karena query builder-nya secara struktural cuma bisa menghasilkan parameterized SQL (lebih aman dari SQL injection) dan ringan.
- **Model relasi:** Foreign Key relasional. Array di types di-normalisasi menjadi tabel *child*, lalu direkonstruksi via JOIN query.
- **Kontrol akses 3-tier:** `getSession()` cuma cek user login & tier-nya. Tidak ada pembatasan RW mana yang boleh diedit tier mana di level DB.
- **Integrasi API & Storage:** Upload gambar via server API (`app/api/admin/upload/route.ts`) ke MinIO.

## 10. Struktur Data (MySQL)

Struktur data menggunakan tabel relasional melalui Drizzle ORM. `lib/types.ts` adalah source of truth shape data; array di typescript dinormalisasi jadi child table di DB, tapi di-JOIN & dirakit ulang di `lib/queries.ts` menjadi shape yang sama.

`kelurahan_profile`, `layanan`, `kontak_perangkat`, dan `kampung_kb` TIDAK ada di MySQL — hardcode di kode frontend (`lib/seed-data.ts`).

Struktur Entity:
- **struktur_kelurahan:** id, nama, jabatan, foto_url, urutan
- **rw:** id, nama_rw, cakupan_dusun, jumlah_rt, is_kampung_kb, potensi, jumlah_kk, jumlah_jiwa, cakupan_wilayah_geojson
- **rw_pengurus** *(child, FK rw_id):* nama, jabatan
- **berita:** id, judul, slug, isi, tanggal, kategori(enum), cakupan(enum: kelurahan|rw), rw_id(FK nullable), rw_nama(denormalisasi), gambar_cover_url, penulis, created_by
- **berita_foto_tambahan** *(child, FK berita_id):* url
- **galeri:** id, judul, tipe(enum foto|video), url_media, kategori, sumber_berita_id(FK nullable ke berita, diisi kalau di-link dari form Berita)
- **umkm:** id, nama, slug, kategori, deskripsi, link_gmaps, kontak, jam_operasional
- **umkm_produk_unggulan** *(child, FK umkm_id):* produk
- **umkm_foto** *(child, FK umkm_id):* url
- **admin_users:** id, nama, email, password_hash, tier(1|2|3), created_by

**Catatan:** `rw_nama` pada `berita` disimpan berdampingan (denormalisasi) agar tidak perlu query JOIN tambahan terus-menerus.

## 11. Struktur Admin — 3 Tier

Bukan dibagi per divisi, tapi berdasarkan **tingkat akses (tier)**:

| Tier | Pemegang | Akses |
|------|----------|-------|
| **Tier 1 — Super Admin** | Tim dev (KKN) & Sekretaris Kelurahan | Akses penuh ke semua data & fitur, termasuk kelola akun admin lain |
| **Tier 2 — Admin Kelurahan** | Ditentukan kelurahan | CRUD Berita, Galeri, UMKM + edit Struktur Kelurahan |
| **Tier 3 — Admin RW** | Ditentukan per RW | CRUD Berita, Galeri, UMKM + edit data RW — RW mana yang diedit dipilih langsung di UI, tidak ada `rw_scope` di akun yang membatasi |

**Catatan:**
- Siapa pun bisa mengisi Tier 2/3, tidak terikat institusi tertentu.
- Karena tidak ada field `rw_scope`, pembatasan wilayah terjadi di level UI saat edit data RW (pilih RW dari list).

### 11.1 Implementasi Kontrol Akses (Custom JWT Auth)

Validasi lewat payload JWT session (`lib/auth.ts`):
- Akses route CMS untuk CRUD `berita`, `galeri`, `umkm`, `rw`: izinkan jika `tier in [1,2,3]`.
- Akses edit `struktur_kelurahan`: izinkan jika `tier in [1,2]`.
- Akses manajemen `admin_users`: izinkan hanya jika `tier == 1`.
- Semua form diproteksi lewat UI, pembatasan DB Row-Level tidak diterapkan (*by design*).

## 12. Development / Build Plan

### Fase 0 — Setup Project
- Init Next.js (App Router, TypeScript) + Tailwind CSS v4.
- Setup MySQL VPS + MinIO.
- Setup environment variables.

### Fase 1 — Data Layer & Static Pages
- Tulis schema `lib/db/schema.ts` dan eksekusi `scripts/seed.ts` (idempotent).
- Bangun halaman hardcode: Profil Desa, Layanan, Kontak, **Kampung KB** (konten dari kode, isi menyusul jika belum fixed).
- Bangun halaman Struktur Kelurahan (data dari DB).

### Fase 2 — Halaman Dinamis Publik
- Beranda (rakit semua section sesuai Bagian 6.1, termasuk teaser Kampung KB).
- Berita, Wilayah Administratif, UMKM, Galeri.
- **Pastikan semua halaman di atas pakai SSG/ISR (Next.js caching), fetch server-side via `lib/queries.ts`**.

### Fase 3 — Panel Admin/CMS + Sistem 3-Tier
- Login admin (Custom auth bcryptjs + JWT).
- Implementasi validasi akses di level route/UI berdasarkan tier.
- CRUD CMS untuk Berita (dengan opsi checkbox ke Galeri).
- CRUD Galeri (upload manual).
- CRUD UMKM, Struktur Kelurahan, Edit RW.
- Integrasi `browser-image-compression` ke `app/api/admin/upload/route.ts`.
- Komponen tombol "Muat Ulang Data" di tabel CMS.

### Fase 4 — Peta Interaktif (opsional)
- Integrasi Leaflet.js dengan GeoJSON batas wilayah kelurahan & per-RW.

### Fase 5 — Optimasi Performa & Testing
- Audit performa (Lighthouse), implementasi *lazy loading*.
- Lakukan pass optimasi *mobile* untuk semua layout.
- Pastikan tidak ada fetch client-side ke DB langsung.

### Fase 6 — Deployment & Serah Terima
- Deploy final ke Vercel (production).
- Buat dokumentasi penggunaan CMS.
- Serah terima akun Super Admin (`superadmin@mlokokulon-ngadirojo.com`).

## 13. Struktur Folder (Usulan, Next.js App Router)

Struktur Direktori:
    /app
      /page.tsx                       → Beranda
      /profil/page.tsx
      /struktur/page.tsx
      /wilayah/page.tsx                → peta interaktif + list RW
      /wilayah/[slug]/page.tsx
      /kampung-kb/page.tsx
      /layanan/page.tsx
      /berita/page.tsx
      /berita/[slug]/page.tsx
      /galeri/page.tsx
      /umkm/page.tsx
      /umkm/[slug]/page.tsx
      /kontak/page.tsx
      /api/admin/upload/route.ts       → Server action / endpoint MinIO
      /admin/login/page.tsx
      /admin/*                         → CMS Pages
    /components
      /layout (Navbar, Footer, MobileNav)
      /ui (Card, Badge, Carousel, Table, Pagination, RefreshButton, dll)
      /admin (Form components untuk CMS)
    /lib
      /db
        /schema.ts                     → Drizzle MySQL schema
        /client.ts                     → Drizzle client init
      /auth.ts                         → bcryptjs & JWT utilities
      /session.ts                      → Cookie admin_session
      /storage.ts                      → AWS SDK S3 client helper
      /queries.ts                      → Fetch and JOIN utilities
      /image-compression.ts            → browser-image-compression wrapper
      /types.ts                        → Source of truth shape TypeScript
      /seed-data.ts                    → Data hardcode
    /public
      /images                          → Aset statis UI
    /drizzle                             → Drizzle migrations
    /scripts
      /seed.ts                         → DB Seed script
      /create-admin.ts                 → Admin generator

## 14. Success Metrics

- Website berhasil live dan dapat diakses publik sebelum program KKN berakhir.
- Admin Tier 2 & Tier 3 dapat mengelola Berita, Galeri, dan UMKM secara mandiri dari HP tanpa bantuan tim KKN.
- Admin Tier 3 dapat memilih & mengedit data RW yang diinginkan dengan lancar melalui UI, tanpa bergantung pada scope di akun.
- Server VPS stabil karena tidak ada query real-time dan halaman publik berbasis SSG.
- Halaman Kampung KB tampil menonjol dan mudah ditemukan (navbar & beranda).
- Dokumentasi penggunaan CMS tersedia untuk tiap tier.

## 15. Risiko & Asumsi

| Risiko | Mitigasi |
|--------|----------|
| Uptime backend bergantung pada ketersediaan VPS MySQL/MinIO milik teman | Pastikan ada mekanisme *backup server/cron* berkala. |
| Data GIS/peta belum jelas sumber & formatnya | Peta interaktif dibuat nice-to-have, jika perlu gunakan *placeholder*. |
| Data per-RW & detail Kampung KB belum lengkap | Pakai placeholder `[DATA MENYUSUL]`, update kemudian secara bertahap. |
| Konten hardcode (Profil, Layanan, Kontak, Kampung KB) perlu deploy ulang untuk diubah | Trade-off yang disengaja karena kontennya jarang berubah; diedit dev lewat kode. |
| Traffic publik berpotensi menekan VPS | Wajib SSG/ISR di semua halaman publik, dilarang fetch DB langsung dari client. |
| Admin lupa mengompres gambar | Kompresi wajib berjalan otomatis di client (`browser-image-compression`) sebelum POST ke server. |
| Tier 3 secara teknis bisa mengedit RW mana pun | Trade-off yang disengaja demi kesederhanaan development. Mengandalkan kepercayaan internal Karang Taruna. |
| Data ter-denormalisasi (`rw_nama` di berita) tidak otomatis berubah jika RW master diubah | Trade-off disengaja demi hemat beban query (menghindari JOIN). Didokumentasikan agar tidak dianggap bug. |
| Fitur checkbox Galeri pada Berita membuat galeri berantakan (spam foto) | Admin harus teliti dan mengikuti panduan CMS saat mencentang opsi foto ke Galeri. |

## 16. Stakeholders

- **Tim KKN** — pengembang & penyusun konten awal, sekaligus Tier 1 (Super Admin).
- **Sekretaris Kelurahan** — Tier 1 (Super Admin) setelah serah terima.
- **Admin Kelurahan (Tier 2)** — pengelola data tingkat kelurahan, Berita, Galeri, UMKM.
- **Admin RW (Tier 3)** — pengelola data RW masing-masing (bisa Karang Taruna, kader RW, atau pihak lain yang ditunjuk), Berita, Galeri, UMKM.
- **Ketua RW** — sumber data profil, struktur, dan status Kampung KB per RW.
- **Dosen Pembimbing Lapangan (DPL)** — supervisi program.
- **Warga & pengunjung** — pengguna akhir (*end user*).