import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarIcon, TargetIcon } from "@/components/admin/icons";
import { getPublicImageUrl } from "@/lib/image-url";
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

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 space-y-8">
        <Link
          href="/pengumuman"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
        >
          ← Kembali ke Pengumuman
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-md space-y-6">
          <div className="space-y-4 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                <TargetIcon className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>Target: {item.target_pengumuman}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>Tanggal: {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
              {item.judul}
            </h1>

            <p className="text-xs text-muted-foreground font-medium">
              Diterbitkan oleh: <strong className="text-foreground">{item.penulis}</strong>
            </p>
          </div>

          {item.gambar_cover_url && (
            <div className="overflow-hidden rounded-2xl border border-border max-h-[400px] w-full bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPublicImageUrl(item.gambar_cover_url)}
                alt={item.judul}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-sm sm:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-sans">
            {item.isi}
          </div>
        </div>
      </div>
    </div>
  );
}
