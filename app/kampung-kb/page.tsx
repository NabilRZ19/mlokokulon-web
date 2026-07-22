import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Carousel } from "@/components/ui/Carousel";
import { getGaleriList, getRwById } from "@/lib/queries";
import { kampungKbData as kb } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Kampung KB — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

function IconSprout() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-emerald-300"
    >
      <path d="M7 20h10" />
      <path d="M12 20v-8" />
      <path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7Z" />
    </svg>
  );
}

export default async function KampungKbPage() {
  const [rw, galeriList] = await Promise.all([getRwById(kb.rw_ref), getGaleriList()]);
  const galeriKampungKb = galeriList.filter((g) => g.kategori === "kampung-kb");

  return (
    <div>
      {/* ── Hero Section (Tema Hijau Dark Emerald Signature) ─────────────── */}
      <div className="relative overflow-hidden border-b border-emerald-900/30 bg-gradient-to-br from-[#022c22] via-[#065f46] to-[#0f172a] py-14 sm:py-20 text-white">
        {/* Ambient Emerald Radial Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            {/* Eyebrow Badge Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md shadow-sm">
              <IconSprout />
              <span>Program Unggulan Kelurahan</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Kampung KB &ldquo;{kb.nama_program}&rdquo;
            </h1>

            {/* Subtitle / Description */}
            <p className="font-sans text-base text-emerald-100/90 sm:text-lg leading-relaxed max-w-2xl">
              Program unggulan Kampung Keluarga Berkualitas di RW 05 Dusun Pencil, diketuai oleh {kb.ketua}, untuk membina potensi, kesehatan, dan kesejahteraan warga desa.
            </p>
          </div>
        </div>
      </div>

      {/* ── Konten Utama (Kembali ke Layout Asli) ───────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        {/* Card Headline & Detail Program */}
        <Card padded={false} className="overflow-hidden">
          <img
            src={kb.foto_highlight_url}
            alt="Kampung KB"
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="p-6">
            {rw && <p className="text-sm font-semibold text-accent">Lokasi: {rw.nama_rw}</p>}
            <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">
              {kb.nama_program}
            </h2>
            <p className="text-sm text-muted-foreground">Ketua: {kb.ketua}</p>
            <p className="mt-3 text-sm text-foreground">{kb.deskripsi_program}</p>
          </div>
        </Card>

        {/* Carousel Pokja */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Program Kerja per Pokja
          </h2>
          <div className="mt-3">
            <Carousel
              itemsPerSlide={3}
              items={kb.pokja.map((p, index) => (
                <Card key={p.nama} className="flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{p.nama}</h3>
                      <p className="text-xs text-muted-foreground">{p.program.length} program</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                    {p.program.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-0.5 shrink-0 text-accent">•</span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            />
          </div>
        </div>

        {/* Galeri Kegiatan Kampung KB (jika ada) */}
        {galeriKampungKb.length > 0 && (
          <Card>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Galeri Kegiatan
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galeriKampungKb.map((g) => (
                <div key={g.id} className="overflow-hidden rounded-lg border border-border">
                  {g.tipe === "video" ? (
                    <video src={g.url_media} controls className="h-40 w-full bg-black object-cover" />
                  ) : (
                    <img src={g.url_media} alt={g.judul} className="h-40 w-full object-cover" />
                  )}
                  <p className="p-3 text-sm text-foreground">{g.judul}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {rw && (
          <Link
            href={`/wilayah/${rw.id}`}
            className="block rounded-lg border border-border bg-card p-4 text-center text-sm font-semibold text-primary shadow-sm transition-shadow hover:shadow-md"
          >
            Lihat Profil {rw.nama_rw} →
          </Link>
        )}
      </div>
    </div>
  );
}
