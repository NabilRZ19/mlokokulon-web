import type { Metadata } from "next";
import { UmkmList } from "@/components/umkm/UmkmList";
import { PageHeader } from "@/components/ui/PageHeader";
import { getUmkmList } from "@/lib/queries";

export const metadata: Metadata = {
  title: "UMKM & Potensi — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

export default async function UmkmPage() {
  const umkm = await getUmkmList();

  return (
    <div>
      <PageHeader
        title="UMKM & Potensi"
        description="Katalog usaha, kerajinan, dan potensi lain di Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <UmkmList umkm={umkm} />
      </div>
    </div>
  );
}
