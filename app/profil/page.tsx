import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderNotice } from "@/components/ui/PlaceholderNotice";
import { Stat } from "@/components/ui/Stat";
import {
  BookIcon,
  CompassIcon,
  FlagIcon,
  MapPinIcon,
  SproutIcon,
  TargetIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { kelurahanProfileData as p } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Profil Desa — Kelurahan Mlokomanis Kulon",
};

// Konten halaman ini hardcode di kode (bukan CMS/Firestore), sesuai PRD Bagian 6.2.
export default function ProfilPage() {
  return (
    <div>
      <PageHeader
        title="Profil Desa"
        description={`Kelurahan ${p.nama}, Kecamatan ${p.kecamatan}, Kabupaten ${p.kabupaten}, ${p.provinsi}`}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-3">
        {/* Kolom utama */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
              <BookIcon className="h-5 w-5 text-primary" /> Sejarah Desa
            </h2>
            <div className="mt-3">
              <PlaceholderNotice>{p.sejarah}</PlaceholderNotice>
            </div>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <FlagIcon className="h-5 w-5 text-primary" /> Visi
              </h2>
              <div className="mt-3">
                <PlaceholderNotice>{p.visi}</PlaceholderNotice>
              </div>
            </Card>

            <Card>
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <TargetIcon className="h-5 w-5 text-primary" /> Misi
              </h2>
              <div className="mt-3">
                <PlaceholderNotice>
                  <ul className="list-inside list-disc">
                    {p.misi.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </PlaceholderNotice>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
              <SproutIcon className="h-5 w-5 text-primary" /> Potensi Desa
            </h2>
            <p className="mt-2 text-sm text-foreground">{p.potensi.catatanEkonomi}</p>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Pertanian</h3>
                <ul className="mt-1 divide-y divide-border text-sm">
                  {p.potensi.pertanian.map((item) => (
                    <li key={item.komoditas} className="flex items-center justify-between py-2">
                      <span className="text-foreground">{item.komoditas}</span>
                      <span className="text-right text-muted-foreground">
                        {item.luasHektare} ha · {item.hasilTonPerHektare} ton/ha
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Peternakan</h3>
                <ul className="mt-1 divide-y divide-border text-sm">
                  {p.potensi.peternakan.map((item) => (
                    <li key={item.jenis} className="flex items-center justify-between py-2">
                      <span className="text-foreground">{item.jenis}</span>
                      <span className="text-muted-foreground">{item.jumlah.toLocaleString("id-ID")} ekor</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <UsersIcon className="h-4 w-4" /> Data Cepat
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Penduduk" value={p.demografi.totalJiwa.toLocaleString("id-ID")} />
              <Stat label="Kepala Keluarga" value={p.administratif.jumlahKk.toLocaleString("id-ID")} />
              <Stat label="RW" value={`${p.administratif.jumlahRw}`} />
              <Stat label="RT" value={`${p.administratif.jumlahRt}`} />
            </div>
            <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-foreground">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Jumlah Dusun</dt>
                <dd>{p.administratif.jumlahDusun}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Laki-laki / Perempuan</dt>
                <dd>
                  {p.demografi.lakiLaki.toLocaleString("id-ID")} /{" "}
                  {p.demografi.perempuan.toLocaleString("id-ID")}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <MapPinIcon className="h-4 w-4" /> Letak Geografis
            </h2>
            <dl className="mt-3 space-y-2 text-sm text-foreground">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Koordinat</dt>
                <dd className="text-right">{p.geografis.koordinat}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Elevasi</dt>
                <dd>{p.geografis.elevasiMdpl} mdpl</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Iklim</dt>
                <dd className="text-right">{p.geografis.iklim}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Curah hujan</dt>
                <dd className="text-right">
                  {p.geografis.curahHujanMm} mm/thn ({p.geografis.bulanHujan} bln hujan)
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Tanah</dt>
                <dd className="text-right">{p.geografis.tanah}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <CompassIcon className="h-4 w-4" /> Batas Wilayah
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-foreground">
              <dt className="text-muted-foreground">Utara</dt>
              <dd>{p.batasWilayah.utara}</dd>
              <dt className="text-muted-foreground">Timur</dt>
              <dd>{p.batasWilayah.timur}</dd>
              <dt className="text-muted-foreground">Selatan</dt>
              <dd>{p.batasWilayah.selatan}</dd>
              <dt className="text-muted-foreground">Barat</dt>
              <dd>{p.batasWilayah.barat}</dd>
            </dl>
          </Card>

          <Link
            href="/struktur"
            className="block rounded-lg border border-border bg-card p-4 text-center text-sm font-semibold text-primary shadow-sm transition-shadow hover:shadow-md"
          >
            Lihat Struktur Kelurahan →
          </Link>
        </div>
      </div>
    </div>
  );
}
