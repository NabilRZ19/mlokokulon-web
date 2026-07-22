import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Carousel } from "@/components/ui/Carousel";
import { PageHeader } from "@/components/ui/PageHeader";
import { getGaleriList, getRwById } from "@/lib/queries";
import { kampungKbData as kb } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Kampung KB — Kelurahan Mlokomanis Kulon",
};

// Konten program ini hardcode di kode (bukan CMS/Firestore, lihat lib/seed-data.ts) — keputusan
// user, deviasi dari desain awal PRD Bagian 5/10 yang menempatkan Kampung KB sebagai CMS.
// RW terkait (rw_ref) tetap fetch live ke Firestore karena koleksi `rw` tidak berubah.
export const revalidate = 3600;

export default async function KampungKbPage() {
  const [rw, galeriList] = await Promise.all([getRwById(kb.rw_ref), getGaleriList()]);
  // PRD Bagian 6.5: "Galeri/dokumentasi kegiatan Kampung KB (opsional, bisa reuse galeri umum
  // dengan filter kategori)" — reuse koleksi galeri yang sama, filter kategori "kampung-kb".
  const galeriKampungKb = galeriList.filter((g) => g.kategori === "kampung-kb");

  return (
    <div>
      <PageHeader
        badge="Program Unggulan Desa"
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
              {kb.nama_program}
            </h2>
            <p className="text-sm text-muted-foreground">Ketua: {kb.ketua}</p>
            <p className="mt-3 text-sm text-foreground">{kb.deskripsi_program}</p>
          </div>
        </Card>

        <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Program Kerja per Pokja
          </h2>
          <div className="mt-3">
            <Carousel
              itemsPerSlide={3}
              items={kb.pokja.map((p, index) => (
                <Card key={p.nama} className="flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{p.nama}</h3>
                      <p className="text-xs text-muted-foreground">{p.program.length} program</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                    {p.program.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-0.5 shrink-0 text-accent">•</span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            />
          </div>
        </div>

        {galeriKampungKb.length > 0 && (
          <Card>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Galeri Kegiatan
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galeriKampungKb.map((g) => (
                <div key={g.id} className="overflow-hidden rounded-lg border border-border">
                  {g.tipe === "video" ? (
                    <video src={g.url_media} controls className="h-40 w-full bg-black object-cover" />
                  ) : (
                    <img src={g.url_media} alt={g.judul} className="h-40 w-full object-cover" />
                  )}
                  <p className="p-3 text-sm text-foreground">{g.judul}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

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
