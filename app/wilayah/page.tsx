import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { PageHeader } from "@/components/ui/PageHeader";
import { getRwList } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Wilayah Administratif — Kelurahan Mlokomanis Kulon",
};

// ISR: data RW dikelola lewat CMS (Firestore), lihat aturan kritikal PRD Bagian 7 poin 2.
export const revalidate = 3600;

export default async function WilayahPage() {
  const rwList = await getRwList();

  return (
    <div>
      <PageHeader
        title="Wilayah Administratif"
        description="Peta dan daftar RW di Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        <MapPlaceholder label="Peta interaktif seluruh wilayah kelurahan segera hadir — menunggu data GeoJSON." />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rwList.map((rw) => (
            <Link key={rw.id} href={`/wilayah/${rw.id}`}>
              <Card className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-heading font-semibold text-foreground">{rw.nama_rw}</h2>
                  {rw.is_kampung_kb && <Badge variant="accent">★ Kampung KB</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Dusun {rw.cakupan_dusun}</p>
                <p className="mt-3 text-sm text-foreground">{rw.jumlah_rt} RT</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
