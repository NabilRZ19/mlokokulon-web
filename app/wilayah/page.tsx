import type { Metadata } from "next";
import { MapWilayah } from "@/components/ui/MapWilayah";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WilayahList } from "@/components/wilayah/WilayahList";
import { getRwList } from "@/lib/queries";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Peta dan daftar wilayah administratif Kelurahan Mlokomanis Kulon — profil, statistik, dan potensi tiap RW.";

export const metadata: Metadata = {
  title: "Wilayah Administratif",
  description,
  alternates: { canonical: "/wilayah" },
  openGraph: pageOpenGraph({ title: "Wilayah Administratif", description, url: "/wilayah" }),
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WilayahPage() {
  const rwList = await getRwList();

  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader
        badge="Wilayah RW &amp; Demografi Kelurahan"
        icon={
          <svg className="h-3.5 w-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        }
        title="Wilayah Administratif"
        description="Direktori 10 RW, 10 Dusun, dan peta persebaran wilayah di Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        {/* Peta Wilayah Interaktif WebGIS */}
        <Reveal mode="scroll" duration={0.6}>
          <div>
            <div className="mb-4">
              <h2 className="font-heading text-xl font-bold text-foreground">Peta Wilayah &amp; WebGIS Kelurahan</h2>
              <p className="text-sm text-muted-foreground mt-1">Visualisasi peta interaktif seluruh RW, batas wilayah, dan titik sarana kelurahan.</p>
            </div>
            <MapWilayah height="600px" showDesaLainByDefault={true} showRwByDefault={false} />
          </div>
        </Reveal>

        {/* Direktori RW Interaktif dengan Search, Filter & Stat Bar */}
        <Reveal mode="scroll" duration={0.6}>
          <WilayahList rwList={rwList} />
        </Reveal>
      </div>
    </div>
  );
}
