import type { Metadata } from "next";
import { GaleriList } from "@/components/galeri/GaleriList";
import { PageHeader } from "@/components/ui/PageHeader";
import { getGaleriList } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Galeri — Kelurahan Mlokomanis Kulon",
};

export const dynamic = "force-dynamic";

export default async function GaleriPage() {
  const galeri = await getGaleriList();

  return (
    <div>
      <PageHeader
        badge="Dokumentasi & Media Publik"
        icon={
          <svg className="h-3.5 w-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title="Galeri Dokumentasi"
        description="Dokumentasi foto dan video kegiatan Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <GaleriList galeri={galeri} />
      </div>
    </div>
  );
}
