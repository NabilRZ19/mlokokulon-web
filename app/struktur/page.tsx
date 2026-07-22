import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getRwList, getStrukturKelurahan } from "@/lib/queries";
import type { StrukturKelurahan } from "@/lib/types";

export const metadata: Metadata = {
  title: "Struktur Organisasi & Kelembagaan — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

function OrgCard({
  person,
  isHead = false,
}: {
  person: StrukturKelurahan;
  isHead?: boolean;
}) {
  return (
    <div className="flex w-44 flex-col items-center rounded-xl border border-border bg-card px-4 py-5 text-center sm:w-52 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
      <img
        src={person.foto_url}
        alt={person.nama}
        className={`rounded-full border-2 object-cover ${
          isHead ? "h-24 w-24 border-primary sm:h-28 sm:w-28" : "h-20 w-20 border-border sm:h-24 sm:w-24"
        }`}
      />
      <p className="mt-3 font-heading font-bold text-foreground">{person.nama}</p>
      <p className="text-xs font-semibold text-primary mt-0.5">{person.jabatan}</p>
    </div>
  );
}

export default async function StrukturPage() {
  const [struktur, rwList] = await Promise.all([
    getStrukturKelurahan(),
    getRwList(),
  ]);

  const [lurah, ...perangkatStaff] = struktur;

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader
        badge="Pemerintahan &amp; Kelembagaan Kelurahan"
        title="Struktur Kelurahan"
        description="Susunan organisasi pemerintahan tingkat kelurahan dan ketua kelembagaan wilayah RW di Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 space-y-8">
        {/* ── 1. Wrapper Card Tingkat 1 & 2: Perangkat Desa / Kelurahan ────── */}
        <Card className="p-6 sm:p-8 space-y-8">
          <div className="border-b border-border pb-4 text-center sm:text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Tingkat Kelurahan
            </span>
            <h2 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
              Perangkat Desa / Kelurahan
            </h2>
            <p className="text-xs text-muted-foreground">
              Pimpinan dan kepala seksi pelayanan di Kantor Kelurahan Mlokomanis Kulon.
            </p>
          </div>

          {struktur.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">Data belum tersedia.</p>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {/* Lurah (Pimpinan Utama) */}
              {lurah && <OrgCard person={lurah} isHead />}

              {/* 3 Perangkat / Seksi (Sekretaris, Kasi, Kaur) */}
              {perangkatStaff.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6">
                  {perangkatStaff.map((s) => (
                    <OrgCard key={s.id} person={s} />
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── 2. Wrapper Card Tingkat 3: Kelembagaan Wilayah (Kepala RW) ──── */}
        <Card className="p-6 sm:p-8 space-y-8">
          <div className="border-b border-border pb-4 text-center sm:text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Kelembagaan Wilayah
            </span>
            <h2 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
              Kepala Rukun Warga (RW)
            </h2>
            <p className="text-xs text-muted-foreground">
              Ketua kelembagaan RW yang memimpin di 10 Dusun wilayah Kelurahan Mlokomanis Kulon.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {rwList.map((rw) => {
              const ketuaRw = rw.struktur_pengurus?.find(
                (p) =>
                  p.jabatan.toLowerCase().includes("ketua rw") ||
                  p.jabatan.toLowerCase().includes("ketua")
              );

              return (
                <div
                  key={rw.id}
                  className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-bold text-primary mb-2">
                    {rw.nama_rw.split("—")[0].trim()}
                  </div>
                  <p className="font-heading text-sm font-bold text-foreground line-clamp-1">
                    {ketuaRw ? ketuaRw.nama : "(Ketua RW)"}
                  </p>
                  <p className="text-[11px] font-semibold text-primary mt-0.5">
                    Ketua {rw.nama_rw.split("—")[0].trim()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Dusun {rw.cakupan_dusun}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
