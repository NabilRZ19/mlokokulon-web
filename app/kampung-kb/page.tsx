import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { getRwById } from "@/lib/queries";
import { kampungKbData as kb } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Kampung KB — Kelurahan Mlokomanis Kulon",
};

// Konten program ini hardcode di kode (bukan CMS/Firestore, lihat lib/seed-data.ts) — keputusan
// user, deviasi dari desain awal PRD Bagian 5/10 yang menempatkan Kampung KB sebagai CMS.
// RW terkait (rw_ref) tetap fetch live ke Firestore karena koleksi `rw` tidak berubah.
export const revalidate = 3600;

export default async function KampungKbPage() {
  const rw = await getRwById(kb.rw_ref);

  return (
    <div>
      <PageHeader
        variant="accent"
        title="Kampung KB"
        description="Program unggulan Kampung Keluarga Berkualitas Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <Card padded={false} className="overflow-hidden">
          <img
            src={kb.foto_highlight_url}
            alt="Kampung KB"
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="p-6">
            {rw && <p className="text-sm font-semibold text-accent">Lokasi: {rw.nama_rw}</p>}
            <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">
              Tentang Program
            </h2>
            <div className="mt-2">
              <PlaceholderNotice>{kb.deskripsi_program}</PlaceholderNotice>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-heading text-lg font-semibold text-foreground">Kegiatan Unggulan</h2>
          <div className="mt-3">
            <PlaceholderNotice>
              <ul className="list-inside list-disc">
                {kb.kegiatan_unggulan.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </PlaceholderNotice>
          </div>
        </Card>

        {rw && (
          <Link
            href={`/wilayah/${rw.id}`}
            className="block rounded-lg border border-border bg-card p-4 text-center text-sm font-semibold text-primary shadow-sm transition-shadow hover:shadow-md"
          >
            Lihat Profil {rw.nama_rw} →
          </Link>
        )}
      </div>
    </div>
  );
}
