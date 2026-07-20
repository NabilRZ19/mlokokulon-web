import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { KampungKbTag } from "@/components/ui/KampungKbTag";
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
        <MapPlaceholder
          title="Peta Wilayah Kelurahan"
          label="Peta interaktif seluruh wilayah kelurahan segera hadir — menunggu data GeoJSON."
        />

        {/* flex-wrap + justify-center (bukan grid) supaya baris terakhir yang jumlah kolomnya
            beda (mis. cuma 1 kartu tersisa) ikut center, bukan nempel ke kiri */}
        <div className="flex flex-wrap justify-center gap-5">
          {rwList.map((rw) => (
            <Link
              key={rw.id}
              href={`/wilayah/${rw.id}`}
              className="w-full shrink-0 sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)]"
            >
              <Card className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-heading font-semibold text-foreground">{rw.nama_rw}</h2>
                  {rw.is_kampung_kb && <KampungKbTag />}
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
