import type { Metadata } from "next";
import { BeritaList } from "@/components/berita/BeritaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBeritaList, getRwList } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Berita & Pengumuman — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

export default async function BeritaPage() {
  const [berita, rwList] = await Promise.all([getBeritaList(), getRwList()]);

  return (
    <div>
      <PageHeader
        title="Berita & Pengumuman"
        description="Kabar terbaru dari Kelurahan Mlokomanis Kulon dan RW-RW di dalamnya."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <BeritaList berita={berita} rwList={rwList} />
      </div>
    </div>
  );
}
