import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { kontakPerangkatData } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Kontak — Kelurahan Mlokomanis Kulon",
};

// Konten halaman ini hardcode di kode (bukan CMS/Firestore), sesuai PRD Bagian 6.10.
export default function KontakPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kontak</h1>
        <p className="text-muted-foreground">
          Kontak perangkat Kelurahan Mlokomanis Kulon per jabatan. Tidak ada sistem pengajuan
          surat online — murni informasi kontak.
        </p>
        <p className="mt-1 text-sm italic text-amber-700">
          Nama & nomor kontak di bawah masih dummy — data riil menyusul.
        </p>
      </div>

      <div className="space-y-3">
        {kontakPerangkatData.map((k) => (
          <Card key={k.jabatan} className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{k.jabatan}</p>
              <p className="text-sm text-muted-foreground">{k.nama}</p>
              <p className="text-xs text-muted-foreground">{k.jamLayanan}</p>
            </div>
            <a
              href={`https://wa.me/${k.whatsapp.replace(/\D/g, "")}`}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              WhatsApp
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
