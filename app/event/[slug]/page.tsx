import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicImageUrl } from "@/lib/image-url";
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

function formatFullDateRange(startStr: string, endStr?: string | null) {
  const dStart = new Date(startStr);
  if (isNaN(dStart.getTime())) return startStr;

  const startFormatted = dStart.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!endStr || endStr === startStr) return startFormatted;

  const dEnd = new Date(endStr);
  if (isNaN(dEnd.getTime())) return startFormatted;

  const endFormatted = dEnd.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${startFormatted} s/d ${endFormatted}`;
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

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 space-y-8">
        <Link
          href="/event"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
        >
          ← Kembali ke Agenda Event
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-md space-y-6">
          <div className="space-y-4 border-b border-border pb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold text-emerald-900">
              <span>📅 Agenda Event Kelurahan</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
              {item.judul}
            </h1>

            {/* Quick Specs Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
                <span className="text-emerald-800 font-bold block text-[11px]">🗓️ Tanggal &amp; Waktu Pelaksanaan:</span>
                <strong className="text-foreground block text-sm">{formatFullDateRange(item.tanggal_mulai, item.tanggal_selesai)}</strong>
                <span className="text-muted-foreground block text-xs">Pukul: {item.jam_mulai}</span>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-1">
                <span className="text-muted-foreground font-bold block text-[11px]">📍 Lokasi / Tempat:</span>
                <strong className="text-foreground block text-sm">{item.lokasi}</strong>
                <span className="text-muted-foreground block text-xs">Panitia: {item.penulis}</span>
              </div>
            </div>
          </div>

          {item.gambar_cover_url && (
            <div className="overflow-hidden rounded-2xl border border-border max-h-[420px] w-full bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPublicImageUrl(item.gambar_cover_url)}
                alt={item.judul}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-foreground">Deskripsi &amp; Agenda Acara</h3>
            <div className="prose prose-sm sm:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {item.deskripsi}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
