import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { UmkmDetailView } from "@/components/umkm/UmkmDetailView";
import { getPublicImageUrl } from "@/lib/image-url";
import { getUmkmBySlug, getUmkmList } from "@/lib/queries";
import { absoluteUrl, pageOpenGraph } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const umkm = await getUmkmList();
  return umkm.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const umkm = await getUmkmBySlug(slug);
  if (!umkm) return { title: "UMKM tidak ditemukan" };
  const description = umkm.deskripsi.trim().slice(0, 160);
  return {
    title: `${umkm.nama} — UMKM`,
    description,
    alternates: { canonical: `/umkm/${slug}` },
    openGraph: pageOpenGraph({
      title: `${umkm.nama} — UMKM`,
      description,
      url: `/umkm/${slug}`,
      images: [getPublicImageUrl(umkm.foto_urls[0] || umkm.foto_utama_url)],
    }),
  };
}

export default async function UmkmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const umkm = await getUmkmBySlug(slug);
  if (!umkm) notFound();

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: umkm.nama,
    description: umkm.deskripsi.trim().slice(0, 160),
    image: [absoluteUrl(getPublicImageUrl(umkm.foto_urls[0] || umkm.foto_utama_url))],
    telephone: umkm.kontak || undefined,
    hasMap: umkm.link_gmaps || undefined,
  };

  return (
    <>
      <JsonLd data={localBusinessJsonLd} />
      <UmkmDetailView umkm={umkm} />
    </>
  );
}
