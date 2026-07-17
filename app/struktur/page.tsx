import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { getStrukturKelurahan } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Struktur Kelurahan — Kelurahan Mlokomanis Kulon",
};

// ISR: data dikelola lewat CMS (Firestore), di-revalidate berkala alih-alih fetch
// langsung dari client browser pengunjung (aturan kritikal PRD Bagian 7 poin 2).
export const revalidate = 3600;

export default async function StrukturPage() {
  const struktur = await getStrukturKelurahan();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Struktur Kelurahan</h1>
        <p className="text-muted-foreground">
          Struktur organisasi pemerintahan tingkat Kelurahan Mlokomanis Kulon.
        </p>
      </div>

      {struktur.length === 0 ? (
        <p className="text-sm text-muted-foreground">Data belum tersedia.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {struktur.map((s) => (
            <Card key={s.id} className="flex items-center gap-3">
              <img
                src={s.foto_url}
                alt={s.nama}
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
              <div>
                <p className="font-semibold text-foreground">{s.nama}</p>
                <p className="text-sm text-muted-foreground">{s.jabatan}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
