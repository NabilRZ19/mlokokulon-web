import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { kelurahanProfileData as p } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Kontak & Alamat Kantor — Kelurahan Mlokomanis Kulon",
};

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
function IconHeadphones() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary shrink-0"
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary shrink-0"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
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
      className="h-4 w-4 text-muted-foreground shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.419h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-muted-foreground shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader
        badge="Pusat Bantuan &amp; Informasi"
        title="Kontak &amp; Alamat Kantor"
        description="Layanan hotline resmi dan alamat Kantor Kelurahan Mlokomanis Kulon."
      />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* ── 1. Kartu Hotline / Layanan Pelanggan ─────────────────────── */}
          <Card className="flex flex-col justify-between p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <IconHeadphones />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Hotline &amp; Service Center
                  </h2>
                  <p className="text-xs text-muted-foreground">Pusat Layanan Kontak Resmi</p>
                </div>
              </div>

              <hr className="border-border" />

              <p className="text-sm leading-relaxed text-foreground">
                Untuk pertanyaan, informasi publik, maupun bantuan layanan administrasi warga Kelurahan Mlokomanis Kulon, Anda dapat menghubungi nomor hotline resmi di bawah ini.
              </p>

              {/* Status Nomor Menyusul */}
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <PlaceholderNotice>
                  [DATA MENYUSUL] — Nomor resmi hotline/WhatsApp kelurahan akan diperbarui setelah konfirmasi dari pihak kelurahan.
                </PlaceholderNotice>

                <div className="mt-4 space-y-2 text-sm text-foreground">
                  <div className="flex items-start gap-2">
                    <IconClock />
                    <div>
                      <p className="font-semibold text-foreground">Jam Layanan Hotline:</p>
                      <p className="text-xs text-muted-foreground mt-0.5">• Senin – Kamis: 07.00 – 15.30 WIB</p>
                      <p className="text-xs text-muted-foreground">• Jumat: 07.00 – 11.00 WIB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-emerald-600/60 px-4 py-3 text-sm font-semibold text-white opacity-80"
              >
                <IconWhatsapp />
                Hubungi via WhatsApp (Menyusul)
              </button>
            </div>
          </Card>

          {/* ── 2. Kartu Alamat Kantor Kelurahan ───────────────────────── */}
          <Card className="flex flex-col justify-between p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <IconBuilding />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Kantor Kelurahan
                  </h2>
                  <p className="text-xs text-muted-foreground">Alamat &amp; Pelayanan Tatap Muka</p>
                </div>
              </div>

              <hr className="border-border" />

              <div className="space-y-4 text-sm text-foreground">
                <div className="flex items-start gap-3">
                  <IconMapPin />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alamat Kantor</p>
                    <p className="mt-1 font-medium leading-relaxed">
                      Kantor Kelurahan {p.nama}, Kecamatan {p.kecamatan}, Kabupaten {p.kabupaten}, {p.provinsi} {p.kodePos}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconClock />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jam Operasional Pelayanan</p>
                    <div className="mt-1 space-y-0.5 font-medium">
                      <p>• Senin – Kamis: 07.00 – 15.30 WIB</p>
                      <p>• Jumat: 07.00 – 11.00 WIB</p>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">Sabtu, Minggu &amp; Hari Libur Nasional: Tutup</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                📍 Peta petunjuk lokasi interaktif (Google Maps) segera hadir.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
