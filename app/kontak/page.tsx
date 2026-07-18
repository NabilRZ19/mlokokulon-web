import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { kontakPerangkatData } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Kontak — Kelurahan Mlokomanis Kulon",
};

// Konten halaman ini hardcode di kode (bukan CMS/Firestore), sesuai PRD Bagian 6.10.
export default function KontakPage() {
  return (
    <div>
      <PageHeader
        title="Kontak"
        description="Kontak perangkat Kelurahan Mlokomanis Kulon per jabatan. Tidak ada sistem pengajuan surat online — murni informasi kontak."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6">
          <PlaceholderNotice>Nama & nomor kontak di bawah masih dummy — data riil menyusul.</PlaceholderNotice>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {kontakPerangkatData.map((k) => (
            <Card key={k.jabatan} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-heading font-semibold text-foreground">{k.jabatan}</p>
                <p className="text-sm text-muted-foreground">{k.nama}</p>
                <p className="mt-1 text-xs text-muted-foreground">{k.jamLayanan}</p>
              </div>
              <a
                href={`https://wa.me/${k.whatsapp.replace(/\D/g, "")}`}
                className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                WhatsApp
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
