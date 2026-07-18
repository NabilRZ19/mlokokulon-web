import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { Stat } from "@/components/ui/Stat";
import { UsersIcon } from "@/components/ui/icons";
import { getRwById, getRwList } from "@/lib/queries";

export const revalidate = 3600;

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
        title={rw.nama_rw}
        description={`Dusun ${rw.cakupan_dusun}, Kelurahan Mlokomanis Kulon`}
      >
        {rw.is_kampung_kb && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="accent">★ Kampung KB</Badge>
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
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
              <UsersIcon className="h-5 w-5 text-primary" /> Struktur Pengurus RW
            </h2>
            <ul className="mt-3 divide-y divide-border text-sm">
              {rw.struktur_pengurus.map((pengurus, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span className="text-foreground">{pengurus.nama}</span>
                  <span className="text-muted-foreground">{pengurus.jabatan}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="font-heading text-lg font-semibold text-foreground">Potensi RW</h2>
            <div className="mt-3">
              <PlaceholderNotice>{rw.potensi}</PlaceholderNotice>
            </div>
          </Card>

          <Card>
            <h2 className="font-heading text-lg font-semibold text-foreground">Cakupan Wilayah</h2>
            <div className="mt-3">
              <MapPlaceholder label={`Peta cakupan wilayah ${rw.nama_rw} segera hadir.`} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
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
