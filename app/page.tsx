import Link from "next/link";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { SproutIcon } from "@/components/ui/icons";
import { getBeritaList, getGaleriList } from "@/lib/queries";
import { kampungKbData as kb, kelurahanProfileData as p } from "@/lib/seed-data";

export const revalidate = 3600;

const KATEGORI_LABEL: Record<string, string> = {
  pengumuman: "Pengumuman",
  kegiatan: "Kegiatan",
  pembangunan: "Pembangunan",
};

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
function IconUsers() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary shrink-0"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M17 8.5a2.5 2.5 0 1 0 0-5" />
      <path d="M21 20c0-2.8-1.8-5.2-4.3-5.9" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary shrink-0"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary shrink-0"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const quickLinks = [
  {
    href: "/profil",
    title: "Profil Desa",
    description: "Sejarah, visi-misi, letak geografis, dan batas wilayah kelurahan.",
  },
  {
    href: "/struktur",
    title: "Struktur Kelurahan",
    description: "Susunan organisasi pemerintahan tingkat kelurahan.",
  },
  {
    href: "/layanan",
    title: "Layanan",
    description: "Informasi layanan yang bisa diurus di kelurahan.",
  },
  {
    href: "/kontak",
    title: "Kontak",
    description: "Hubungi perangkat kelurahan sesuai jabatan.",
  },
];

export default async function Home() {
  const [beritaAll, galeriAll] = await Promise.all([getBeritaList(), getGaleriList()]);

  // Tampilkan 3 berita terbaru di homepage
  const beritaTerbaru = beritaAll.slice(0, 3);

  // Tampilkan hingga 6 galeri foto saja di homepage
  const galeritTampil = galeriAll.filter((g) => g.tipe === "foto").slice(0, 6);

  // Pilih 4 pokja paling beragam untuk teaser
  const pokjaTeaser = kb.pokja.slice(0, 4);

  return (
    <div className="bg-background">
      {/* ── 1. Hero (Biru Gradasi Signature) ─────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0f172a] via-primary to-[#1e3a8a] py-20 text-white sm:py-28">
        {/* Ambient Radial Background Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md shadow-sm mb-3">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span>Website Resmi Pemerintah Kelurahan</span>
          </div>

          <h1 className="mt-2 max-w-3xl font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            Kelurahan {p.nama}
          </h1>

          <p className="mt-4 max-w-2xl font-sans text-base text-blue-100/90 sm:text-lg leading-relaxed">
            Kecamatan {p.kecamatan}, Kabupaten {p.kabupaten}, {p.provinsi}. Media informasi resmi
            dan terpusat untuk warga, masyarakat umum, serta pihak dinas terkait.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/profil"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-all hover:bg-blue-50 hover:shadow"
            >
              Lihat Profil Desa →
            </Link>
            <Link
              href="/kontak"
              className="rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Gambaran Umum Kelurahan (Statistik Demografi Improved) ─────── */}
      <section className="border-b border-border bg-card py-16 shadow-xs">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Data Demografi &amp; Wilayah
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl mt-1">
              Gambaran Umum Kelurahan
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2 leading-relaxed">
              Ringkasan statistik kependudukan dan pembagian wilayah administratif di Kelurahan Mlokomanis Kulon.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Kartu 1: Total Penduduk */}
            <Card className="flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <IconUsers />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Penduduk</p>
                <p className="font-heading text-2xl font-extrabold text-foreground mt-0.5">
                  {p.demografi.totalJiwa.toLocaleString("id-ID")} <span className="text-xs font-normal text-muted-foreground">Jiwa</span>
                </p>
                <p className="text-[11px] font-medium text-primary mt-0.5">
                  {p.demografi.lakiLaki.toLocaleString("id-ID")} L / {p.demografi.perempuan.toLocaleString("id-ID")} P
                </p>
              </div>
            </Card>

            {/* Kartu 2: Kepala Keluarga */}
            <Card className="flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <IconHome />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kepala Keluarga</p>
                <p className="font-heading text-2xl font-extrabold text-foreground mt-0.5">
                  {p.administratif.jumlahKk.toLocaleString("id-ID")} <span className="text-xs font-normal text-muted-foreground">KK</span>
                </p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  Rata-rata 3 jiwa / KK
                </p>
              </div>
            </Card>

            {/* Kartu 3: Rukun Warga (RW) */}
            <Card className="flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <IconBuilding />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rukun Warga (RW)</p>
                <p className="font-heading text-2xl font-extrabold text-foreground mt-0.5">
                  {p.administratif.jumlahRw} <span className="text-xs font-normal text-muted-foreground">Wilayah</span>
                </p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  {p.administratif.jumlahDusun} Dusun Administratif
                </p>
              </div>
            </Card>

            {/* Kartu 4: Rukun Tetangga (RT) */}
            <Card className="flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <IconMapPin />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rukun Tetangga (RT)</p>
                <p className="font-heading text-2xl font-extrabold text-foreground mt-0.5">
                  {p.administratif.jumlahRt} <span className="text-xs font-normal text-muted-foreground">RT</span>
                </p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  Tersebar di 10 Dusun
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── 3. Teaser Kampung KB (Gradasi Emerald Khusus Section Program Unggulan) ── */}
      <section className="relative overflow-hidden border-y border-emerald-900/30 bg-gradient-to-br from-[#022c22] via-[#065f46] to-[#0f172a] py-16 text-white">
        {/* Ambient Emerald Background Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 space-y-8">
          {/* Section Header */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md">
              <SproutIcon className="h-4 w-4 text-emerald-300" />
              <span>Program Unggulan Kelurahan</span>
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl mt-1">
              Kampung KB &ldquo;{kb.nama_program}&rdquo;
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-emerald-100/90 mt-2">
              Program unggulan pembinaan keluarga berkualitas di RW 05 Dusun Pencil untuk memajukan potensi, kesehatan, dan kesejahteraan warga desa.
            </p>
          </div>

          {/* Headline Photo Placeholder */}
          <div className="group relative overflow-hidden rounded-xl border border-emerald-200/30 bg-card/95 shadow-lg">
            <img
              src={kb.foto_highlight_url}
              alt={`Kampung KB ${kb.nama_program}`}
              className="h-56 w-full object-cover sm:h-72 lg:h-80 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <p className="absolute bottom-0 left-0 right-0 p-4 text-xs font-semibold text-white translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 drop-shadow-md">
              Dokumentasi kegiatan program unggulan Kampung KB &ldquo;{kb.nama_program}&rdquo;
            </p>
          </div>

          {/* Judul List Pokja & Tombol CTA */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pt-2">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                Kelompok Kerja
              </span>
              <h3 className="font-heading text-lg font-extrabold text-white sm:text-xl">
                Daftar Kelompok Kerja (Pokja)
              </h3>
            </div>
            <Link
              href="/kampung-kb"
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-200 backdrop-blur-md shadow-xs transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 sm:self-auto"
            >
              Lihat Pokja Lainnya →
            </Link>
          </div>

          {/* Pokja Grid Teaser Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pokjaTeaser.map((pokja, idx) => (
              <Card
                key={pokja.nama}
                className="flex flex-col justify-between gap-3 p-5 bg-card/95 backdrop-blur-md border-emerald-200/20 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-heading text-sm font-bold text-accent">
                      {idx + 1}
                    </span>
                    <h3 className="font-heading text-sm font-bold text-foreground">{pokja.nama}</h3>
                  </div>
                  <ul className="mt-3 space-y-1 border-t border-border pt-3">
                    {pokja.program.slice(0, 3).map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-0.5 shrink-0 text-accent">•</span>
                        {item}
                      </li>
                    ))}
                    {pokja.program.length > 3 && (
                      <li className="text-xs font-semibold text-accent">
                        +{pokja.program.length - 3} program lainnya
                      </li>
                    )}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Berita Terbaru (Biru Gradasi Signature Pembeda Section) ───── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0f172a] via-primary to-[#1e3a8a] py-16 text-white">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                Informasi &amp; Warta
              </span>
              <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl mt-1">
                Berita dan Pengumuman
              </h2>
              <p className="text-sm text-blue-100/80 max-w-xl mt-2 leading-relaxed">
                Informasi terkini, pengumuman resmi, dan kabar warta kegiatan pembangunan di lingkungan Kelurahan Mlokomanis Kulon.
              </p>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md shadow-xs transition-all duration-300 hover:bg-white hover:text-primary hover:border-white hover:shadow-md hover:-translate-y-0.5 sm:self-auto shrink-0"
            >
              Lihat Semua Berita →
            </Link>
          </div>

          {beritaTerbaru.length === 0 ? (
            <p className="mt-10 text-sm text-blue-100/80">
              Belum ada berita. Konten akan segera hadir.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {beritaTerbaru.map((b) => (
                <Link key={b.id} href={`/berita/${b.slug}`}>
                  <Card
                    padded={false}
                    className="h-full overflow-hidden border-white/20 bg-card text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                  >
                    <img
                      src={b.gambar_cover_url}
                      alt={b.judul}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BeritaBadge kategori={b.kategori} />
                        <span>
                          {new Date(b.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="mt-2 font-heading font-semibold text-foreground line-clamp-2">
                        {b.judul}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {b.cakupan === "kelurahan" ? "Kelurahan" : b.rw_nama}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Galeri Kegiatan ───────────────────────────────────────────── */}
      {galeritTampil.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Dokumentasi Media
              </span>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl mt-1">
                Galeri Kegiatan
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mt-2 leading-relaxed">
                Dokumentasi visual rangkaian acara, kegiatan kemasyarakatan, dan program kerja kelurahan.
              </p>
            </div>
            <Link
              href="/galeri"
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary shadow-xs transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:-translate-y-0.5 sm:self-auto shrink-0"
            >
              Lihat Galeri Lengkap →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {galeritTampil.map((g) => (
              <Link
                key={g.id}
                href="/galeri"
                className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <img
                  src={g.url_media}
                  alt={g.judul}
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="absolute bottom-0 left-0 right-0 translate-y-2 p-3 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {g.judul}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Peta (Biru Gradasi Signature Pembeda Section) ──────────────── */}
      <section className="relative overflow-hidden border-t border-border bg-gradient-to-br from-[#0f172a] via-primary to-[#1e3a8a] py-16 text-white">
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
              Lokasi &amp; Geografis
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl mt-1">
              Peta Wilayah Kelurahan
            </h2>
            <p className="text-sm text-blue-100/80 max-w-xl mt-2 leading-relaxed">
              Visualisasi dan pemetaan cakupan batas wilayah administratif Kelurahan Mlokomanis Kulon.
            </p>
          </div>

          <MapPlaceholder
            title="Peta Kelurahan"
            label="Gambar/embed ringan seluruh wilayah kelurahan akan tampil di sini — menunggu data GeoJSON."
          />
        </div>
      </section>

      {/* ── 7. Quick Links ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Navigasi Cepat
          </span>
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl mt-1">
            Jelajahi Website
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mt-2 leading-relaxed">
            Pintasan navigasi langsung menuju halaman utama profil desa, struktur organisasi, layanan publik, dan informasi kontak.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
            >
              <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
