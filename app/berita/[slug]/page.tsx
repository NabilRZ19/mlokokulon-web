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
  return { title: berita ? `${berita.judul} — Kelurahan Mlokomanis Kulon` : "Berita tidak ditemukan" };
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const berita = await getBeritaBySlug(slug);
  if (!berita) notFound();

  const tanggal = new Date(berita.tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Link href="/berita" className="text-sm text-primary hover:underline">
            ← Semua Berita
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge>{KATEGORI_LABEL[berita.kategori]}</Badge>
            <span>{tanggal}</span>
            <span>· {berita.cakupan === "kelurahan" ? "Kelurahan" : berita.rw_nama}</span>
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {berita.judul}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Oleh {berita.penulis}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <img
          src={berita.gambar_cover_url}
          alt={berita.judul}
          className="w-full rounded-lg border border-border object-cover"
        />

        <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {berita.isi}
        </div>

        {berita.foto_tambahan.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Foto Tambahan
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {berita.foto_tambahan.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="aspect-square rounded-md border border-border object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
