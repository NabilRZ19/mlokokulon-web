import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { StrukturClientView } from "@/components/struktur/StrukturClientView";
import { getRwList, getStrukturKelurahan } from "@/lib/queries";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Struktur organisasi dan kelembagaan Kelurahan Mlokomanis Kulon: jajaran perangkat kelurahan dan lembaga kemasyarakatan.";

export const metadata: Metadata = {
  title: "Struktur Organisasi & Kelembagaan",
  description,
  alternates: { canonical: "/struktur" },
  openGraph: pageOpenGraph({
    title: "Struktur Organisasi & Kelembagaan",
    description,
    url: "/struktur",
  }),
};

export const dynamic = "force-dynamic";

export default async function StrukturPage() {
  const [struktur, rwList] = await Promise.all([
    getStrukturKelurahan(),
    getRwList(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader
        badge="Pemerintahan &amp; Kelembagaan Kelurahan"
        icon={
          <svg className="h-3.5 w-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        title="Struktur Kelurahan"
        description="Susunan organisasi pemerintahan tingkat kelurahan dan ketua kelembagaan wilayah RW di Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <StrukturClientView struktur={struktur} rwList={rwList} />
      </div>
    </div>
  );
}
