import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailView } from "@/components/event/EventDetailView";
import { getEventBySlug } from "@/lib/queries";
import { SITE_NAME } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) return { title: `Event Tidak Ditemukan | ${SITE_NAME}` };

  return {
    title: `${item.judul} | Agenda Event Kelurahan`,
    description: item.deskripsi.slice(0, 160),
  };
}

export default async function DetailEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getEventBySlug(slug, true);

  if (!item) {
    notFound();
  }

  return <EventDetailView item={item} />;
}
