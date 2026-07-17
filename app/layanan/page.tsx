import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { layananData } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Layanan — Kelurahan Mlokomanis Kulon",
};

// Konten halaman ini hardcode di kode (bukan CMS/Firestore), sesuai PRD Bagian 6.6.
// Daftar layanan spesifik belum fixed — isi saat ini contoh/dummy.
export default function LayananPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Layanan</h1>
        <p className="text-muted-foreground">
          Informasi layanan yang bisa diurus di Kelurahan Mlokomanis Kulon. Halaman ini bersifat
          informasi, bukan pengajuan online.
        </p>
        <p className="mt-1 text-sm italic text-amber-700">
          Daftar layanan di bawah masih contoh — konten final menyusul.
        </p>
      </div>

      <div className="space-y-4">
        {layananData.map((item) => (
          <Card key={item.id}>
            <h2 className="font-semibold text-foreground">{item.nama}</h2>
            <p className="mt-1 text-sm text-foreground">{item.deskripsi}</p>

            <h3 className="mt-3 text-sm font-semibold text-foreground">Syarat</h3>
            <ul className="mt-1 list-inside list-disc text-sm text-foreground">
              {item.syarat.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <p className="mt-3 text-sm text-muted-foreground">
              Hubungi:{" "}
              <Link href="/kontak" className="text-primary underline">
                {item.kontakJabatan}
              </Link>
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
