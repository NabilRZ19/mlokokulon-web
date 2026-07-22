import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UmkmDetailView } from "@/components/umkm/UmkmDetailView";
import { getUmkmBySlug, getUmkmList } from "@/lib/queries";

export const revalidate = 3600;

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
  return {
    title: `${umkm.nama} — UMKM Kelurahan Mlokomanis Kulon`,
    description: umkm.deskripsi.slice(0, 160),
    openGraph: {
      images: umkm.foto_urls[0] ? [umkm.foto_urls[0]] : [],
    },
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

  return <UmkmDetailView umkm={umkm} />;
}
