import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BeritaDetailClientView } from "@/components/berita/BeritaDetailClientView";
import { getBeritaBySlug, getBeritaList } from "@/lib/queries";

export const dynamic = "force-dynamic";

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

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const berita = await getBeritaBySlug(slug);

  if (!berita) {
    notFound();
  }

  const tanggal = new Date(berita.tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return <BeritaDetailClientView berita={berita} tanggal={tanggal} />;
}
