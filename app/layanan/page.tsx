import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { layananData } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Pelayanan Publik — Kelurahan Mlokomanis Kulon",
};

function IconFileText() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary shrink-0"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default function LayananPage() {
  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader
        badge="Pusat Pelayanan Publik Desa"
        title="Layanan Publik Kelurahan"
        description="Informasi resmi panduan dan persyaratan pengurusan administrasi kependudukan, pencatatan sipil, serta surat pengantar di Kantor Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        {/* ── Banner Gambaran Umum Pelayanan Kelurahan ───────────────────── */}
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
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
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

        {/* ── Notice Tahap Pengumpulan Data ─────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-sm text-blue-900 shadow-xs">
          <IconInfo />
          <div>
            <p className="font-heading font-bold text-blue-950">Catatan Pembaruan Layanan:</p>
            <p className="mt-0.5 text-xs text-blue-800 leading-relaxed">
              Daftar rincian persyaratan di bawah ini memuat data pelayanan resmi paket 3 in 1 dan kependudukan Disdukcapil Wonogiri yang telah terverifikasi. Rincian syarat untuk layanan pengantar surat desa lainnya saat ini masih dalam <strong>tahap pengumpulan data [DATA MENYUSUL]</strong> dan akan terus diperbarui secara bertahap.
            </p>
          </div>
        </div>

        {/* ── Grid Daftar Layanan Resmi ───────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">
          {layananData.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
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
                      <p className="text-xs font-medium text-primary">Disdukcapil Wonogiri</p>
                    </div>
                  </div>
                  <Badge variant="accent">Pelayanan Resmi</Badge>
                </div>

                <p className="text-sm leading-relaxed text-foreground">{item.deskripsi}</p>

                <hr className="border-border" />

                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Persyaratan Dokumen:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {item.syarat.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-foreground leading-snug">
                        <IconCheckCircle />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Tempat Pelayanan: <strong>{item.kontakJabatan}</strong></span>
                <Link href="/kontak" className="font-semibold text-primary hover:underline">
                  Tanyakan Syarat →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
