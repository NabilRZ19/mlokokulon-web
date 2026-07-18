import type { Metadata } from "next";
import { GaleriList } from "@/components/galeri/GaleriList";
import { PageHeader } from "@/components/ui/PageHeader";
import { getGaleriList } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Galeri — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

export default async function GaleriPage() {
  const galeri = await getGaleriList();

  return (
    <div>
      <PageHeader
        title="Galeri"
        description="Dokumentasi foto dan video kegiatan Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <GaleriList galeri={galeri} />
      </div>
    </div>
  );
}
