import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getLayananList } from "@/lib/queries";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Daftar layanan publik Kelurahan Mlokomanis Kulon: syarat, prosedur, dan kontak pengurusan dokumen kependudukan seperti akta kelahiran, KK, dan KIA.";

export const metadata: Metadata = {
  title: "Pelayanan Publik",
  description,
  alternates: { canonical: "/layanan" },
  openGraph: pageOpenGraph({ title: "Pelayanan Publik", description, url: "/layanan" }),
};

export const dynamic = "force-dynamic";

function IconFileText() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary shrink-0"
    >
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5"
    >
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-blue-600 shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-emerald-700 shrink-0 inline-block"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default async function LayananPage() {
  const layananList = await getLayananList();

  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader
        badge="Pusat Pelayanan Publik Desa"
        icon={
          <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title="Layanan Publik Kelurahan"
        description="Informasi resmi panduan dan persyaratan pengurusan administrasi kependudukan, pencatatan sipil, serta surat pengantar di Kantor Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        {/* ── Banner Gambaran Umum Pelayanan Kelurahan ───────────────────── */}
        <Reveal mode="scroll" duration={0.6}>
          <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                    Pelayanan Terpadu
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kantor Kelurahan Mlokomanis Kulon
                  </span>
                </div>
                <h2 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
                  Layanan Administrasi &amp; Kependudukan Warga
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl text-justify">
                  Kantor Kelurahan Mlokomanis Kulon memfasilitasi pengurusan berbagai dokumen kependudukan, pengantar surat resmi, serta pelayanan integrasi 3 in 1 pencatatan sipil bekerja sama dengan Disdukcapil Kabupaten Wonogiri.
                </p>
              </div>
              <Link
                href="/kontak"
                className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow"
              >
                Hubungi Petugas Layanan →
              </Link>
            </div>
          </div>
        </Reveal>



        {/* ── Grid Daftar Layanan Resmi ───────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">
          {layananList.map((item, i) => (
            <Reveal key={item.id} mode="scroll" delay={(i % 4) * 0.08}>
              <Card className="flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md h-full">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <IconFileText />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-bold text-foreground">
                          {item.nama}
                        </h3>
                        <p className="text-xs font-medium text-primary">{item.kategori}</p>
                      </div>
                    </div>
                    <Badge variant="accent">{item.biaya}</Badge>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground text-justify">{item.deskripsi}</p>

                  <hr className="border-border" />

                  {item.persyaratan && item.persyaratan.length > 0 && (
                    <div>
                      <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                        Persyaratan Dokumen:
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {item.persyaratan.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-foreground leading-snug text-justify">
                            <IconCheckCircle />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.prosedur && item.prosedur.length > 0 && (
                    <div className="pt-2 border-t border-border/60">
                      <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                        Alur &amp; Prosedur Pengurusan:
                      </h4>
                      <ol className="space-y-1.5 text-xs text-foreground font-medium">
                        {item.prosedur.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-justify">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                              {idx + 1}
                            </span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tempat: <strong>{item.kontak_penanggung_jawab || "Kantor Kelurahan"}</strong></span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                    <IconClock />
                    {item.waktu_proses}
                  </span>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
