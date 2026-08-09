import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PengumumanDetailView } from "@/components/pengumuman/PengumumanDetailView";
import { getPengumumanBySlug } from "@/lib/queries";
import { SITE_NAME } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPengumumanBySlug(slug);
  if (!item) return { title: `Pengumuman Tidak Ditemukan | ${SITE_NAME}` };

  return {
    title: `${item.judul} | Pengumuman Kelurahan`,
    description: item.isi.slice(0, 160),
  };
}

export default async function DetailPengumumanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPengumumanBySlug(slug, true);

  if (!item) {
    notFound();
  }

  return <PengumumanDetailView item={item} />;
}
