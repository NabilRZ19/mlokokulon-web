import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BeritaDetailClientView } from "@/components/berita/BeritaDetailClientView";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicImageUrl } from "@/lib/image-url";
import { getBeritaBySlug, getBeritaList } from "@/lib/queries";
import { SITE_NAME, absoluteUrl, pageOpenGraph } from "@/lib/seo";

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
  const description = berita.isi.trim().slice(0, 160);
  return {
    title: berita.judul,
    description,
    alternates: { canonical: `/berita/${slug}` },
    openGraph: pageOpenGraph({
      type: "article",
      title: berita.judul,
      description,
      url: `/berita/${slug}`,
      publishedTime: berita.tanggal,
      images: [getPublicImageUrl(berita.gambar_cover_url)],
    }),
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: berita.judul,
    description: berita.isi.trim().slice(0, 160),
    datePublished: berita.tanggal,
    author: { "@type": "Organization", name: berita.penulis || SITE_NAME },
    image: [absoluteUrl(getPublicImageUrl(berita.gambar_cover_url))],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <BeritaDetailClientView berita={berita} tanggal={tanggal} />
    </>
  );
}
