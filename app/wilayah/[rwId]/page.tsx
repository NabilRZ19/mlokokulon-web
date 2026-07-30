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
  return { title: rw ? `${rw.nama_rw} — Kelurahan Mlokomanis Kulon` : "RW tidak ditemukan" };
}

export default async function RwDetailPage({ params }: { params: Promise<{ rwId: string }> }) {
  const { rwId } = await params;
  const rw = await getRwById(rwId);
  if (!rw) notFound();

  return (
    <div>
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
              className="text-sm font-medium text-white underline underline-offset-2 hover:text-white/80"
            >
              Lihat program Kampung KB →
            </Link>
          </div>
        )}
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-3">
        {/* Main Content Column (Desktop Left: col-span-2, Mobile: Second) */}
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          {/* Struktur Pengurus RW, RT & Organisasi Utama */}
          <RwPengurusSection pengurusList={rw.struktur_pengurus} />

          <Card>
            <h2 className="font-heading text-lg font-semibold text-foreground">Potensi RW</h2>
            <div className="mt-3">
              <PlaceholderNotice>{rw.potensi}</PlaceholderNotice>
            </div>
          </Card>
        </div>

        {/* Sidebar Column (Desktop Right: col-span-1, Mobile: First) */}
        <div className="order-1 space-y-6 lg:order-2 lg:col-span-1">
          {/* Peta Cakupan Wilayah RW (Paling atas di mobile, di kanan di desktop) */}
          <Card>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Cakupan Wilayah</h2>
            <MapWilayah focusedRwId={rw.id} height="360px" />
          </Card>

          <Card>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Statistik RW
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Kepala Keluarga" value={rw.statistik.jumlah_kk.toLocaleString("id-ID")} />
              <Stat label="Jiwa" value={rw.statistik.jumlah_jiwa.toLocaleString("id-ID")} />
              <Stat label="Jumlah RT" value={`${rw.jumlah_rt}`} />
            </div>
          </Card>

          <Link
            href="/wilayah"
            className="block rounded-lg border border-border bg-card p-4 text-center text-sm font-semibold text-primary shadow-sm transition-shadow hover:shadow-md"
          >
            ← Semua RW
          </Link>
        </div>
      </div>
    </div>
  );
}
