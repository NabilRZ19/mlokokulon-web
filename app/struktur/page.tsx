import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getStrukturKelurahan } from "@/lib/queries";
import type { StrukturKelurahan } from "@/lib/types";

export const metadata: Metadata = {
  title: "Struktur Kelurahan — Kelurahan Mlokomanis Kulon",
};

// ISR: data dikelola lewat CMS (Firestore), di-revalidate berkala alih-alih fetch
// langsung dari client browser pengunjung (aturan kritikal PRD Bagian 7 poin 2).
export const revalidate = 3600;

function OrgCard({ person, isHead = false }: { person: StrukturKelurahan; isHead?: boolean }) {
  return (
    <Card className="flex w-44 flex-col items-center px-4 py-5 text-center sm:w-52">
      <img
        src={person.foto_url}
        alt={person.nama}
        className={`rounded-full border-2 object-cover ${
          isHead ? "h-24 w-24 border-primary sm:h-28 sm:w-28" : "h-20 w-20 border-border sm:h-24 sm:w-24"
        }`}
      />
      <p className="mt-3 font-heading font-semibold text-foreground">{person.nama}</p>
      <p className="text-sm text-muted-foreground">{person.jabatan}</p>
    </Card>
  );
}

export default async function StrukturPage() {
  const struktur = await getStrukturKelurahan();
  const [kepala, ...staff] = struktur;

  return (
    <div>
      <PageHeader
        badge="Pemerintahan Kelurahan"
        title="Struktur Kelurahan"
        description="Struktur organisasi pemerintahan tingkat Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {struktur.length === 0 ? (
          <p className="text-sm text-muted-foreground">Data belum tersedia.</p>
        ) : (
          <div className="flex flex-col items-center gap-10">
            <OrgCard person={kepala} isHead />

            {staff.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {staff.map((s) => (
                  <OrgCard key={s.id} person={s} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
