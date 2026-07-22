import type { Metadata } from "next";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { PageHeader } from "@/components/ui/PageHeader";
import { WilayahList } from "@/components/wilayah/WilayahList";
import { getRwList } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Wilayah Administratif — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

export default async function WilayahPage() {
  const rwList = await getRwList();

  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader
        badge="Wilayah RW &amp; Demografi Kelurahan"
        title="Wilayah Administratif"
        description="Direktori 10 RW, 10 Dusun, dan peta persebaran wilayah di Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        {/* Peta Wilayah Interaktif */}
        <MapPlaceholder
          title="Peta Wilayah Kelurahan"
          label="Peta interaktif seluruh wilayah kelurahan segera hadir — menunggu data GeoJSON."
        />

        {/* Direktori RW Interaktif dengan Search, Filter & Stat Bar */}
        <WilayahList rwList={rwList} />
      </div>
    </div>
  );
}
