import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
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

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-primary">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-primary">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}

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

  const fotoTambahan = berita.foto_tambahan.slice(0, 4);

  return (
    <div className="min-h-screen bg-background py-10">
      {/* ── Back link ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 mb-6">
        <Link
          href="/berita"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Kembali ke Daftar Berita
        </Link>
      </div>

      {/* ── Wadah Artikel Berita (Clean Off-White Card) ────────────────────── */}
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm mx-4 sm:mx-auto">
        {/* Cover Image */}
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={berita.gambar_cover_url}
            alt={berita.judul}
            className="h-full w-full object-cover"
            style={{ maxHeight: "460px" }}
          />
        </div>

        {/* Article Body */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          {/* Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <BeritaBadge kategori={berita.kategori} />

            {berita.cakupan === "rw" && berita.rw_nama && (
              <Badge variant="accent">{berita.rw_nama}</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl font-extrabold leading-snug text-foreground sm:text-3xl lg:text-4xl">
            {berita.kategori === "pengumuman" &&
            !berita.judul.toLowerCase().startsWith("pengumuman") ? (
              <>
                <span className="text-red-600 font-extrabold mr-2">[PENGUMUMAN]</span>
                {berita.judul}
              </>
            ) : (
              berita.judul
            )}
          </h1>

          {/* Meta Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-6 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconUser />
              Penulis: <strong className="text-foreground">{berita.penulis}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendar />
              {tanggal}
            </span>
          </div>

          {/* Article Text Content */}
          <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground">
            {berita.isi}
          </div>

          {/* Documentation Photos */}
          {fotoTambahan.length > 0 && (
            <div className="mt-10 border-t border-border pt-8">
              <h2 className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-primary">
                Dokumentasi Kegiatan
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {fotoTambahan.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Dokumentasi ${i + 1}`}
                    className="aspect-video w-full rounded-xl border border-border object-cover transition-all duration-300 hover:shadow-md"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Article Footer */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              ← Kembali ke Berita
            </Link>
            <span>
              {berita.cakupan === "kelurahan" ? "Kelurahan Mlokomanis Kulon" : berita.rw_nama}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
