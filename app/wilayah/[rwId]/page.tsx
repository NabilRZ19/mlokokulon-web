import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { KampungKbTag } from "@/components/ui/KampungKbTag";
import { MapWilayah } from "@/components/ui/MapWilayah";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { Stat } from "@/components/ui/Stat";
import { UsersIcon } from "@/components/ui/icons";
import { RwPengurusSection } from "@/components/wilayah/RwPengurusSection";
import { getRwById, getRwList } from "@/lib/queries";
import { pageOpenGraph } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const rwList = await getRwList();
  return rwList.map((rw) => ({ rwId: rw.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rwId: string }>;
}): Promise<Metadata> {
  const { rwId } = await params;
  const rw = await getRwById(rwId);
  if (!rw) return { title: "RW tidak ditemukan" };
  const description = `Profil ${rw.nama_rw}, Dusun ${rw.cakupan_dusun}, Kelurahan Mlokomanis Kulon — struktur pengurus, statistik warga, dan potensi wilayah.`;
  return {
    title: rw.nama_rw,
    description,
    alternates: { canonical: `/wilayah/${rwId}` },
    openGraph: pageOpenGraph({ title: rw.nama_rw, description, url: `/wilayah/${rwId}` }),
  };
}

export default async function RwDetailPage({ params }: { params: Promise<{ rwId: string }> }) {
  const { rwId } = await params;
  const rw = await getRwById(rwId);
  if (!rw) notFound();

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader
        badge={rw.is_kampung_kb ? "Kampung KB & Wilayah RW" : "Wilayah RW"}
        variant={rw.is_kampung_kb ? "accent" : "primary"}
        title={rw.nama_rw}
        description={`Dusun ${rw.cakupan_dusun}, Kelurahan Mlokomanis Kulon`}
      >
        {rw.is_kampung_kb && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <KampungKbTag />
            <Link
              href="/kampung-kb"
              className="text-sm font-medium text-white underline underline-offset-4 hover:text-emerald-200 transition-colors"
            >
              Lihat program Kampung KB →
            </Link>
          </div>
        )}
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-3">
        {/* Main Content Column (Desktop Left: col-span-2, Mobile: Second) */}
        <div className="order-2 space-y-8 lg:order-1 lg:col-span-2">
          {/* Deskripsi Singkat Wilayah RW */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border/80 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-xs">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                  Gambaran Umum Wilayah
                </span>
                <h2 className="font-heading text-xl font-extrabold text-foreground">
                  Deskripsi Singkat Wilayah
                </h2>
              </div>
            </div>

            <div className="mt-4 leading-relaxed text-sm text-foreground/90 font-sans">
              {rw.deskripsi_singkat && !rw.deskripsi_singkat.includes("[DATA MENYUSUL]") ? (
                <p className="whitespace-pre-line text-base sm:text-base leading-relaxed text-justify">
                  {rw.deskripsi_singkat}
                </p>
              ) : (
                <PlaceholderNotice>
                  Data belum diberikan oleh pihak terkait.
                </PlaceholderNotice>
              )}
            </div>
          </Card>

          {/* Struktur Pengurus RW, RT & Organisasi Utama */}
          <RwPengurusSection pengurusList={rw.struktur_pengurus} />

          {/* Potensi RW */}
          <Card className="overflow-hidden border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-card to-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-emerald-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Komoditas &amp; Keunggulan
                </span>
                <h2 className="font-heading text-xl font-extrabold text-foreground">
                  Potensi Wilayah RW
                </h2>
              </div>
            </div>
            <div className="mt-4">
              {rw.potensi && !rw.potensi.includes("[DATA MENYUSUL]") ? (
                <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-4">
                  <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
                    {rw.potensi}
                  </p>
                </div>
              ) : (
                <PlaceholderNotice>Data belum diberikan oleh pihak terkait.</PlaceholderNotice>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Column (Desktop Right: col-span-1, Mobile: First) */}
        <div className="order-1 space-y-6 lg:order-2 lg:col-span-1">
          {/* Peta Cakupan Wilayah RW */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-base font-bold text-foreground">Cakupan Wilayah</h2>
              <span className="text-xs font-semibold text-muted-foreground">{rw.nama_rw}</span>
            </div>
            <MapWilayah focusedRwId={rw.id} height="340px" />
          </Card>

          {/* Statistik RW */}
          <Card className="p-5 sm:p-6">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Statistik Kependudukan
            </h2>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Kepala Keluarga</span>
                <p className="font-heading text-2xl font-extrabold text-foreground mt-1">
                  {rw.statistik.jumlah_kk.toLocaleString("id-ID")}
                </p>
                <span className="text-[10px] text-muted-foreground font-medium">KK</span>
              </div>
              <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-3.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Total Penduduk</span>
                <p className="font-heading text-2xl font-extrabold text-foreground mt-1">
                  {rw.statistik.jumlah_jiwa.toLocaleString("id-ID")}
                </p>
                <span className="text-[10px] text-muted-foreground font-medium">Jiwa</span>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Jumlah Wilayah RT</span>
                <p className="font-heading text-xl font-extrabold text-foreground mt-0.5">
                  {rw.jumlah_rt} RT
                </p>
                <span className="text-[10px] text-muted-foreground font-medium">Rukun Tetangga</span>
              </div>
            </div>
          </Card>

          <Link
            href="/wilayah"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-center text-sm font-semibold text-primary shadow-xs transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
          >
            ← Kembali ke Semua RW
          </Link>
        </div>
      </div>
    </div>
  );
}
