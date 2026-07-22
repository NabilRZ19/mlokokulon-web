import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { layananData } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Layanan 3 in 1 & Kependudukan — Kelurahan Mlokomanis Kulon",
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

export default function LayananPage() {
  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader
        badge="Administrasi Kependudukan Disdukcapil"
        title="Layanan 3 in 1 &amp; Akta Pencatatan Sipil"
        description="Panduan lengkap syarat pengurusan paket dokumen 3 in 1 (Akta Kelahiran, Akta Kematian, Akta Perkawinan, KK, KTP-el &amp; KIA) di Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        {/* ── Banner Informasi Pelayanan 3 in 1 Gratis ────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  100% GRATIS
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Disdukcapil Kab. Wonogiri
                </span>
              </div>
              <h2 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
                Pelayanan Paket &ldquo;3 in 1&rdquo; Akta Pencatatan Sipil
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Urus 1 dokumen akta, otomatis terbit 3 dokumen kependudukan sekaligus (Akta, Kartu Keluarga baru, dan KTP-el / Kartu Identitas Anak).
              </p>
            </div>
            <Link
              href="/kontak"
              className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow"
            >
              Konsultasi Layanan →
            </Link>
          </div>
        </div>

        {/* ── Grid Daftar Layanan Resmi ───────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">
          {layananData.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between p-6 sm:p-7">
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
                  <Badge variant="accent">3 in 1</Badge>
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
