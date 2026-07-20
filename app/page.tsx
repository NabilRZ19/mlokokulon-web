import Link from "next/link";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { SectionPlaceholder } from "@/components/ui/SectionPlaceholder";
import { Stat } from "@/components/ui/Stat";
import { BookIcon, GalleryIcon, StarIcon } from "@/components/ui/icons";
import { kelurahanProfileData as p } from "@/lib/seed-data";

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

// Urutan section sesuai PRD Bagian 6.1: Hero → Statistik+Potensi → Teaser Kampung KB →
// Berita Terbaru → Galeri (Carousel) → Peta (Fixed) → Footer. 4 section terakhir masih
// placeholder — konten aslinya nunggu halaman-halaman terkait (Berita/Galeri sudah ada
// datanya, tapi carousel-nya sendiri belum dirakit) & data GeoJSON peta.
export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-primary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-white/70">
            Website Resmi
          </p>
          <h1 className="mt-2 max-w-2xl font-heading text-4xl font-bold text-white sm:text-5xl">
            Kelurahan {p.nama}
          </h1>
          <p className="mt-4 max-w-xl text-white/85">
            Kecamatan {p.kecamatan}, Kabupaten {p.kabupaten}, {p.provinsi}. Media informasi resmi
            dan terpusat untuk warga, wisatawan, maupun pihak dinas terkait.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/profil"
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90"
            >
              Lihat Profil
            </Link>
            <Link
              href="/kontak"
              className="rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Statistik singkat */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          <Stat label="Penduduk" value={`${p.demografi.totalJiwa.toLocaleString("id-ID")} jiwa`} />
          <Stat label="Kepala Keluarga" value={p.administratif.jumlahKk.toLocaleString("id-ID")} />
          <Stat label="RW" value={`${p.administratif.jumlahRw}`} />
          <Stat label="RT" value={`${p.administratif.jumlahRt}`} />
        </div>
      </section>

      {/* Teaser Kampung KB — placeholder */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionPlaceholder
          icon={StarIcon}
          variant="accent"
          title="Teaser Kampung KB"
          label="Highlight program unggulan Kampung Keluarga Berkualitas akan tampil di sini."
        />
      </section>

      {/* Berita Terbaru — placeholder */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionPlaceholder
            icon={BookIcon}
            title="Berita Terbaru"
            label="3-4 kartu berita terbaru akan tampil di sini, dengan tombol “Lihat Semua Berita”."
          />
        </div>
      </section>

      {/* Galeri (Carousel) — placeholder */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionPlaceholder
          icon={GalleryIcon}
          title="Galeri"
          label="Carousel foto/video singkat akan tampil di sini, dengan tombol “Lihat Galeri Lengkap”."
        />
      </section>

      {/* Peta (Fixed) — placeholder */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <MapPlaceholder
            title="Peta Kelurahan"
            label="Gambar/embed ringan seluruh wilayah kelurahan akan tampil di sini — menunggu data GeoJSON."
          />
        </div>
      </section>

      {/* Quick links */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold text-foreground">Jelajahi Website</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
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
