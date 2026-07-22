import type { Metadata } from "next";
import { BeritaHero } from "@/components/berita/BeritaHero";
import { BeritaList } from "@/components/berita/BeritaList";
import { getBeritaList, getRwList } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Berita & Pengumuman — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

export default async function BeritaPage() {
  const [berita, rwList] = await Promise.all([getBeritaList(), getRwList()]);

  return (
    <div>
      <BeritaHero />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <BeritaList berita={berita} rwList={rwList} />
      </div>
    </div>
  );
}
