import type { Metadata } from "next";
import Link from "next/link";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Carousel } from "@/components/ui/Carousel";
import { MapWilayah } from "@/components/ui/MapWilayah";
import { Reveal } from "@/components/ui/Reveal";
import { KampungKbIcon, SproutIcon } from "@/components/ui/icons";
import { getPublicImageUrl } from "@/lib/image-url";
import { getKampungKbStoreAsync } from "@/lib/kampung-kb-store";
import { getBeritaList, getEventList, getGaleriList, getPengumumanList } from "@/lib/queries";
import { kelurahanProfileData as p } from "@/lib/seed-data";
import { SITE_NAME, pageOpenGraph } from "@/lib/seo";

export const revalidate = 3600; // ISR 1 jam

// Foto kantor kelurahan di MinIO
const heroFotoUrl = getPublicImageUrl("media/kantorkelurahan.png");

const description =
  "Website resmi Kelurahan Mlokomanis Kulon, Kecamatan Ngadirojo, Kabupaten Wonogiri — info layanan publik, berita terbaru, wilayah RW, UMKM, dan program Kampung KB.";

export const metadata: Metadata = {
  description,
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({ title: SITE_NAME, description, url: "/" }),
};

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
    title: "Profil Kelurahan",
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
  const kb = await getKampungKbStoreAsync();
  const [beritaAll, galeriAll, pengumumanAll, eventAll] = await Promise.all([
    getBeritaList(),
    getGaleriList(),
    getPengumumanList(),
    getEventList(),
  ]);

  // Tampilkan hingga 3 pengumuman terbaru di homepage
  const pengumumanTerbaru = pengumumanAll.slice(0, 3);

  // Tampilkan hingga 3 event mendatang di homepage
  const eventTerdekat = eventAll.slice(0, 3);

  // Tampilkan hingga 9 berita di carousel homepage (3 slide × 3 card)
  const beritaTerbaru = beritaAll.slice(0, 9);

  // Tampilkan hingga 9 galeri foto di carousel (3 slide × 3 item)
  const galeritTampil = galeriAll.filter((g) => g.tipe === "foto").slice(0, 9);

  // Pilih 4 pokja paling beragam untuk teaser
  const pokjaTeaser = kb.pokja.slice(0, 4);

  return (
    <div className="bg-background">
      {/* ── 1. Hero (Biru Gradasi Signature — Page Load Animation) ────────── */}
      <Reveal mode="load" duration={0.65} distance={24}>
        <section className="relative overflow-hidden border-b border-border py-20 text-white sm:py-28">
          {/* Foto Kantor Kelurahan — background penuh */}
          <img
            src={heroFotoUrl}
            alt="Kantor Kelurahan Mlokomanis Kulon"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Overlay gelap biar teks putih tetap terbaca */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/90 via-primary/80 to-[#1e3a8a]/70" />

          <div className="relative z-10 mx-auto max-w-6xl px-4">
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
                Lihat Profil Kelurahan →
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
      </Reveal>

      {/* ── 2. Gambaran Umum Kelurahan (Scroll Reveal) ─────────────── */}
      <Reveal mode="scroll" duration={0.6}>
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
      </Reveal>

      {/* ── 3. Peta Wilayah Kelurahan (Scroll Reveal — Berada Tepat di Bawah Gambaran Umum) ── */}
      <Reveal mode="scroll" duration={0.6}>
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0f172a] via-primary to-[#1e3a8a] py-16 text-white">
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-blue-200 backdrop-blur-md">
                <IconMapPin />
                <span>Geografis &amp; Pemetaan Wilayah</span>
              </div>
              <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl mt-1">
                Peta Wilayah Kelurahan Mlokomanis Kulon
              </h2>
              <p className="text-sm text-blue-100/90 max-w-2xl leading-relaxed">
                Batas Administrasi &amp; Sebaran Sarana. Visualisasi pemetaan interaktif cakupan wilayah, kantor pemerintahan, sarana publik, serta sebaran 10 dusun di Kelurahan Mlokomanis Kulon.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/20 shadow-xl">
              <MapWilayah height="500px" />
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── 3. Teaser Kampung KB (Scroll Reveal) ────────────────────────── */}
      <Reveal mode="scroll" duration={0.6}>
        <section className="relative overflow-hidden border-y border-emerald-900/30 bg-gradient-to-br from-[#022c22] via-[#065f46] to-[#0f172a] py-16 text-white">
          {/* Ambient Emerald Background Glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 space-y-8">
            {/* Section Header (Sesuai Halaman Kampung KB) */}
            <div className="max-w-3xl space-y-4">
              {/* Eyebrow Badge Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md shadow-sm">
                <KampungKbIcon className="h-4 w-4 shrink-0 text-emerald-300 fill-emerald-300/20" />
                <span>Inpres No. 3 Tahun 2022 · BKKBN RI</span>
              </div>

              {/* Title */}
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
                Kampung KB &ldquo;{kb.nama_program}&rdquo;
              </h2>

              {/* Subtitle / Description */}
              <p className="font-sans text-base text-emerald-100/90 sm:text-lg leading-relaxed max-w-2xl text-justify">
                Wadah konvergensi dan integrasi pemberdayaan keluarga dalam seluruh dimensinya—berdasarkan Instruksi Presiden No. 3 Tahun 2022 dan BKKBN RI guna meningkatkan kualitas SDM, ketahanan keluarga, serta lingkungan pemukiman sehat di Kelurahan Mlokomanis Kulon.
              </p>
            </div>

            {/* Headline Card Sesuai Halaman Kampung KB */}
            <div className="overflow-hidden rounded-2xl border border-emerald-300/30 bg-card text-foreground shadow-xl">
              <div className="grid lg:grid-cols-12 items-stretch">
                <div className="relative overflow-hidden bg-muted group lg:col-span-6 min-h-[260px] sm:min-h-[300px]">
                  <img
                    src={getPublicImageUrl(kb.foto_highlight_url)}
                    alt={`Kampung KB ${kb.nama_program}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <p className="absolute bottom-0 left-0 right-0 p-4 text-xs font-semibold text-white drop-shadow-md">
                    Dokumentasi kegiatan program unggulan Kampung KB &ldquo;{kb.nama_program}&rdquo;
                  </p>
                </div>

                <div className="p-6 sm:p-8 lg:col-span-6 space-y-4 flex flex-col justify-between bg-gradient-to-br from-card via-emerald-50/20 to-card">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-2xs">
                      <KampungKbIcon className="h-3.5 w-3.5 text-emerald-700 fill-emerald-700/20" />
                      <span>Percontohan: RW 05 Pencil</span>
                    </div>

                    <h3 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl leading-tight">
                      Kampung KB &ldquo;{kb.nama_program}&rdquo;
                    </h3>

                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Ketua Pelaksana: <span className="text-foreground font-extrabold">{kb.ketua}</span>
                    </p>

                    <p className="text-xs text-muted-foreground leading-relaxed text-justify line-clamp-4 sm:line-clamp-none">
                      {kb.deskripsi_program}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-600 shrink-0">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      SK Kelurahan Tahun {kb.sk_tahun}
                    </span>
                    <Link
                      href="/kampung-kb"
                      className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </div>
              </div>
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
              {pokjaTeaser.map((pokja: any, idx: number) => (
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
                      {pokja.program.slice(0, 3).map((item: string) => (
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
      </Reveal>

      {/* ── 4. Pengumuman Penting (Scroll Reveal — Di Atas Berita) ─────────────── */}
      <Reveal mode="scroll" duration={0.6}>
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-slate-900/5 via-card to-amber-500/5 py-16 shadow-2xs">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary backdrop-blur-md">
                  <span>Informasi Resmi Kelurahan</span>
                </div>
                <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl mt-1">
                  Pengumuman Penting
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Pengumuman dan himbauan resmi terbaru bagi seluruh warga dan kelembagaan di Kelurahan Mlokomanis Kulon.
                </p>
              </div>
              <Link
                href="/pengumuman"
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary shadow-xs transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:-translate-y-0.5 sm:self-auto shrink-0"
              >
                Lihat Semua Pengumuman →
              </Link>
            </div>

            {pengumumanTerbaru.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-xs text-muted-foreground">
                Belum ada pengumuman baru yang diterbitkan.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-3">
                {pengumumanTerbaru.map((p) => {
                  const d = new Date(p.tanggal);
                  const day = isNaN(d.getTime()) ? "15" : d.getDate().toString().padStart(2, "0");
                  const month = isNaN(d.getTime()) ? "AGU" : d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();

                  return (
                    <Link
                      key={p.id}
                      href={`/pengumuman/${p.slug}`}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:bg-card"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300 shadow-2xs">
                            Target: {p.target_pengumuman}
                          </span>
                          <span className="text-[11px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                            {day} {month}
                          </span>
                        </div>
                        <h3 className="font-heading text-base font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {p.judul}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {p.isi}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-border/60 mt-4 text-xs font-bold text-primary group-hover:underline flex items-center justify-between">
                        <span>Baca Rincian Pengumuman</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* ── 5. Berita Terbaru (Scroll Reveal) ─────────────────────────────── */}
      <Reveal mode="scroll" duration={0.6}>
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0b1329] via-[#1e3a8a] to-[#0f172a] py-20 text-white">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 space-y-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                  Informasi &amp; Warta Kelurahan
                </span>
                <h2 className="font-heading text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl leading-tight">
                  Berita Kelurahan
                </h2>
                <p className="text-sm sm:text-base text-blue-100/80 leading-relaxed">
                  Kabar warta kegiatan pembangunan, agenda publik, dan cerita warga di lingkungan Kelurahan Mlokomanis Kulon.
                </p>
              </div>
              <Link
                href="/berita"
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md shadow-xs transition-all duration-300 hover:bg-white hover:text-primary hover:border-white hover:shadow-lg hover:-translate-y-0.5 sm:self-auto shrink-0"
              >
                Lihat Semua Berita →
              </Link>
            </div>

            {beritaTerbaru.length === 0 ? (
              <p className="text-sm text-blue-100/80">
                Belum ada berita. Konten akan segera hadir.
              </p>
            ) : (
              <div>
                <Carousel
                  autoplay
                  autoplayInterval={5500}
                  itemsPerSlide={3}
                  colsMobile={1}
                  colsSm={3}
                  dotVariant="light"
                  items={beritaTerbaru.map((b) => (
                    <Link key={b.id} href={`/berita/${b.slug}`}>
                      <Card
                        padded={false}
                        className="group h-full overflow-hidden border-white/20 bg-card text-foreground transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-2xl"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                          <img
                            src={getPublicImageUrl(b.gambar_cover_url)}
                            alt={b.judul}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5 flex flex-col justify-between h-[calc(100%-11rem)]">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <BeritaBadge kategori={b.kategori} />
                              <span>
                                {new Date(b.tanggal).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <h3 className="font-heading font-bold text-foreground text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                              {b.judul}
                            </h3>
                          </div>
                          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{b.cakupan === "kelurahan" ? "Kelurahan" : b.rw_nama}</span>
                            <span className="font-bold text-primary group-hover:underline">Baca selengkapnya →</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                />
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* ── 6. Event Mendatang (Scroll Reveal — Di Bawah Berita) ─────────── */}
      <Reveal mode="scroll" duration={0.6}>
        <section className="relative overflow-hidden border-b border-border bg-card py-16 shadow-2xs">
          <div className="mx-auto max-w-6xl px-4 space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-2xs backdrop-blur-md">
                  <span>Agenda Kelurahan</span>
                </div>
                <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl mt-1">
                  Event Mendatang
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Jadwal acara, pelatihan, dan kegiatan kemasyarakatan yang akan berlangsung dalam waktu dekat.
                </p>
              </div>
              <Link
                href="/event"
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-white sm:self-auto shrink-0 shadow-2xs"
              >
                Lihat Agenda Lengkap →
              </Link>
            </div>

            {eventTerdekat.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-xs text-muted-foreground">
                Belum ada agenda event mendatang.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-3">
                {eventTerdekat.map((ev) => {
                  const d = new Date(ev.tanggal_mulai);
                  const day = isNaN(d.getTime()) ? "15" : d.getDate().toString().padStart(2, "0");
                  const month = isNaN(d.getTime()) ? "AGU" : d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();

                  return (
                    <div
                      key={ev.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-center shrink-0 shadow-2xs">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">{month}</span>
                            <span className="font-heading text-xl font-extrabold text-primary leading-none my-0.5">{day}</span>
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full line-clamp-1">
                            📍 {ev.lokasi}
                          </span>
                        </div>
                        <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {ev.judul}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {ev.deskripsi}
                        </p>
                      </div>
                      <div className="p-5 pt-0">
                        <Link
                          href={`/event/${ev.slug}`}
                          className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all shadow-2xs"
                        >
                          <span>Rincian Event</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* ── 7. Galeri Kegiatan (Scroll Reveal — Biru Signature) ─────────────── */}
      {galeritTampil.length > 0 && (
        <Reveal mode="scroll" duration={0.6}>
          <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0b1329] via-[#1e3a8a] to-[#0f172a] py-16 text-white">
            {/* Ambient Glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative mx-auto max-w-6xl px-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                    Dokumentasi Media
                  </span>
                  <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl mt-1">
                    Galeri Kegiatan
                  </h2>
                  <p className="text-sm text-blue-100/80 mt-2 leading-relaxed">
                    Dokumentasi visual rangkaian acara, kegiatan kemasyarakatan, dan program kerja kelurahan.
                  </p>
                </div>
                <Link
                  href="/galeri"
                  className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md shadow-xs transition-all duration-300 hover:bg-white hover:text-primary hover:border-white hover:shadow-md hover:-translate-y-0.5 sm:self-auto shrink-0"
                >
                  Lihat Galeri Lengkap →
                </Link>
              </div>

              <div className="mt-8">
                <Carousel
                  autoplay
                  autoplayInterval={4500}
                  itemsPerSlide={3}
                  colsMobile={2}
                  colsSm={3}
                  dotVariant="light"
                  items={galeritTampil.map((g) => (
                    <Link
                      key={g.id}
                      href="/galeri"
                      className="group relative overflow-hidden rounded-xl border border-white/20 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                    >
                      <img
                        src={getPublicImageUrl(g.url_media)}
                        alt={g.judul}
                        loading="lazy"
                        decoding="async"
                        className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <p className="absolute bottom-0 left-0 right-0 translate-y-2 p-3 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {g.judul}
                      </p>
                    </Link>
                  ))}
                />
              </div>
            </div>
          </section>
        </Reveal>
      )}



      {/* ── 7. Quick Links (Scroll Reveal) ────────────────────────────────── */}
      <Reveal mode="scroll" duration={0.6}>
        <section className="border-t border-border bg-gradient-to-b from-muted/40 via-card/50 to-muted/40 py-16 shadow-2xs">
          <div className="mx-auto max-w-6xl px-4">
            <div className="space-y-2 mb-10 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Navigasi Cepat
              </span>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl mt-1">
                Jelajahi Website
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mt-2 leading-relaxed">
                Pintasan navigasi langsung menuju halaman utama profil kelurahan, struktur organisasi, layanan publik, dan informasi kontak.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                >
                  <h3 className="font-heading font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
