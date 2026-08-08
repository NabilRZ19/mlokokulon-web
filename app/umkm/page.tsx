import type { Metadata } from "next";
import { UmkmHero } from "@/components/umkm/UmkmHero";
import { UmkmList } from "@/components/umkm/UmkmList";
import { getUmkmList } from "@/lib/queries";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Direktori UMKM dan potensi ekonomi warga Kelurahan Mlokomanis Kulon — produk unggulan, kontak, dan lokasi usaha.";

export const metadata: Metadata = {
  title: "UMKM & Potensi",
  description,
  alternates: { canonical: "/umkm" },
  openGraph: pageOpenGraph({ title: "UMKM & Potensi", description, url: "/umkm" }),
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UmkmPage() {
  const umkm = await getUmkmList();

  return (
    <div>
      <UmkmHero />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <UmkmList umkm={umkm} />
      </div>
    </div>
  );
}
