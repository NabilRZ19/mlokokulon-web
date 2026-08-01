import type { Metadata } from "next";
import { BeritaHero } from "@/components/berita/BeritaHero";
import { BeritaList } from "@/components/berita/BeritaList";
import { getBeritaList, getRwList } from "@/lib/queries";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Berita dan pengumuman terbaru seputar kegiatan, pembangunan, dan informasi resmi Kelurahan Mlokomanis Kulon.";

export const metadata: Metadata = {
  title: "Berita & Pengumuman",
  description,
  alternates: { canonical: "/berita" },
  openGraph: pageOpenGraph({ title: "Berita & Pengumuman", description, url: "/berita" }),
};

export const dynamic = "force-dynamic";

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
