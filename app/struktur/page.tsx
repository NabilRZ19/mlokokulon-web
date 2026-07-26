import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { StrukturClientView } from "@/components/struktur/StrukturClientView";
import { getRwList, getStrukturKelurahan } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Struktur Organisasi & Kelembagaan — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

export default async function StrukturPage() {
  const [struktur, rwList] = await Promise.all([
    getStrukturKelurahan(),
    getRwList(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader
        badge="Pemerintahan &amp; Kelembagaan Kelurahan"
        title="Struktur Kelurahan"
        description="Susunan organisasi pemerintahan tingkat kelurahan dan ketua kelembagaan wilayah RW di Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <StrukturClientView struktur={struktur} rwList={rwList} />
      </div>
    </div>
  );
}
