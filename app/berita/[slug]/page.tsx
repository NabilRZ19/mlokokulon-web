import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { getBeritaBySlug, getBeritaList } from "@/lib/queries";

export const revalidate = 3600;

const KATEGORI_LABEL: Record<string, string> = {
  pengumuman: "Pengumuman",
  kegiatan: "Kegiatan",
  pembangunan: "Pembangunan",
};

export async function generateStaticParams() {
  const berita = await getBeritaList();
  return berita.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const berita = await getBeritaBySlug(slug);
  if (!berita) return { title: "Berita tidak ditemukan" };
  return {
    title: `${berita.judul} — Kelurahan Mlokomanis Kulon`,
    description: berita.isi.slice(0, 160),
    openGraph: {
      images: [berita.gambar_cover_url],
    },
  };
}

// ─── ikon kecil inline ────────────────────────────────────────────────────────
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}

// ─── halaman utama ─────────────────────────────────────────────────────────────
export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const berita = await getBeritaBySlug(slug);
  if (!berita) notFound();

  const tanggal = new Date(berita.tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Batasi foto tambahan ke maks 4 (sesuai aturan bisnis)
  const fotoTambahan = berita.foto_tambahan.slice(0, 4);

  return (
    <div className="min-h-screen bg-background py-8">
      {/* ── Back link (di luar card) ───────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 mb-6">
        <Link
          href="/berita"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Kembali ke Daftar Berita
        </Link>
      </div>

      {/* ── Wadah Keseluruhan Artikel (dengan Outline Border & Shadow) ────── */}
      <article className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-card shadow-sm mx-4 sm:mx-auto">
        {/* ── Foto Headline (Tanpa border dalam karena sudah ada border luar artikel) ── */}
        <div className="aspect-video w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={berita.gambar_cover_url}
            alt={berita.judul}
            className="h-full w-full object-cover"
            style={{ maxHeight: "480px" }}
          />
        </div>

        {/* ── Konten Artikel (Judul, Meta & Isi) ───────────────────────────── */}
        <div className="px-6 py-8 sm:px-8">
          {/* Badge kategori */}
          <div className="mb-4">
            <Badge>{KATEGORI_LABEL[berita.kategori]}</Badge>
            {berita.cakupan === "rw" && berita.rw_nama && (
              <span className="ml-2">
                <Badge variant="accent">{berita.rw_nama}</Badge>
              </span>
            )}
          </div>

          {/* Judul */}
          <h1 className="font-heading text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            {berita.judul}
          </h1>

          {/* Meta: penulis + tanggal */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconUser />
              {berita.penulis}
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendar />
              {tanggal}
            </span>
          </div>

          {/* Garis pembatas */}
          <hr className="my-6 border-border" />

          {/* Isi Berita */}
          <div className="whitespace-pre-line text-[15px] leading-relaxed text-foreground">
            {berita.isi}
          </div>

          {/* ── Grid 2×2 Foto Tambahan ─────────────────────────────────────── */}
          {fotoTambahan.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Dokumentasi
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {fotoTambahan.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Dokumentasi ${i + 1}`}
                    className="aspect-video w-full rounded-lg border border-border object-cover transition-all duration-300 hover:opacity-90 hover:border-primary"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Footer artikel ─────────────────────────────────────────────── */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Kembali ke Daftar Berita
            </Link>
            <span className="text-xs text-muted-foreground">
              {berita.cakupan === "kelurahan" ? "Kelurahan Mlokomanis Kulon" : berita.rw_nama}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
