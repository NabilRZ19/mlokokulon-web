import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { layananData } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Layanan — Kelurahan Mlokomanis Kulon",
};

// Konten halaman ini hardcode di kode (bukan CMS/Firestore), sesuai PRD Bagian 6.6.
// Daftar layanan spesifik belum fixed — isi saat ini contoh/dummy.
export default function LayananPage() {
  return (
    <div>
      <PageHeader
        title="Layanan"
        description="Informasi layanan yang bisa diurus di Kelurahan Mlokomanis Kulon. Halaman ini bersifat informasi, bukan pengajuan online."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6">
          <PlaceholderNotice>Daftar layanan di bawah masih contoh — konten final menyusul.</PlaceholderNotice>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {layananData.map((item) => (
            <Card key={item.id}>
              <h2 className="font-heading font-semibold text-foreground">{item.nama}</h2>
              <p className="mt-2 text-sm text-foreground">{item.deskripsi}</p>

              <h3 className="mt-4 text-sm font-semibold text-foreground">Syarat</h3>
              <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                {item.syarat.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
                Hubungi:{" "}
                <Link href="/kontak" className="font-medium text-primary underline">
                  {item.kontakJabatan}
                </Link>
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
