import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Stat } from "@/components/ui/Stat";
import {
  CompassIcon,
  MapPinIcon,
  SproutIcon,
  TargetIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { kelurahanProfileData as p } from "@/lib/seed-data";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Profil lengkap Kelurahan Mlokomanis Kulon: geografis, demografi, potensi pertanian & peternakan, serta batas wilayah di Kecamatan Ngadirojo, Kabupaten Wonogiri.";

export const metadata: Metadata = {
  title: "Profil Desa",
  description,
  alternates: { canonical: "/profil" },
  openGraph: pageOpenGraph({ title: "Profil Desa", description, url: "/profil" }),
};

// Konten halaman ini hardcode di kode (bukan CMS/Firestore), sesuai PRD Bagian 6.2.
export default function ProfilPage() {
  return (
    <div>
      <PageHeader
        badge="Profil & Geografis Desa"
        icon={
          <svg className="h-3.5 w-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        title="Profil Desa"
        description={`Kelurahan ${p.nama}, Kecamatan ${p.kecamatan}, Kabupaten ${p.kabupaten}, ${p.provinsi}`}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-3">
        {/* Kolom utama */}
        <div className="space-y-6 lg:col-span-2">
          {/* Visi & Misi Unified Section */}
          <Reveal mode="scroll" duration={0.6}>
            <Card>
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <TargetIcon className="h-5 w-5 text-primary" />
                    <h2 className="font-heading text-lg font-bold text-foreground">
                      Visi &amp; Misi
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                    Kabupaten Wonogiri
                  </span>
                </div>

                {/* Statement Visi & Misi */}
                <div className="space-y-5">
                  {/* Visi */}
                  <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Visi Pembangunan Kabupaten Wonogiri
                    </span>
                    <p className="mt-2 font-heading text-lg font-extrabold text-foreground leading-relaxed text-justify">
                      &ldquo;{p.visi}&rdquo;
                    </p>
                  </div>

                  {/* Misi */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Misi Pembangunan Kabupaten Wonogiri
                    </span>
                    <ol className="space-y-2.5 text-sm text-foreground">
                      {p.misi.map((m, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-justify leading-relaxed shadow-xs transition-all hover:border-primary/30"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-white shadow-xs">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 font-medium text-foreground">{m}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Narasi Penyelarasan / Alignment (Arahan Pemkab Wonogiri) */}
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Narasi Penyelarasan Kelurahan Mlokomanis Kulon
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                    Pemerintah Kelurahan Mlokomanis Kulon senantiasa melaksanakan tugas dan fungsi pelayanan publik serta pembangunan wilayah dengan merujuk dan mengikuti seluruh arahan, petunjuk teknis, serta kebijakan strategis dari Pemerintah Kabupaten Wonogiri guna mendukung terwujudnya visi Wonogiri yang maju, sejahtera, dan berkelanjutan.
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal mode="scroll" duration={0.6}>
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
          </Reveal>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <UsersIcon className="h-4 w-4" /> Data Cepat
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Tahun Terbentuk" value={`${p.terbentuk}`} />
              <Stat label="Penduduk" value={p.demografi.totalJiwa.toLocaleString("id-ID")} />
              <Stat label="Kepala Keluarga" value={p.administratif.jumlahKk.toLocaleString("id-ID")} />
              <Stat label="Wilayah RW" value={`${p.administratif.jumlahRw}`} />
            </div>
            <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm text-foreground">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tahun Terbentuk</dt>
                <dd className="font-semibold text-foreground">{p.terbentuk}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Jumlah Dusun</dt>
                <dd className="font-semibold text-foreground">{p.administratif.jumlahDusun} Dusun</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Jumlah RT</dt>
                <dd className="font-semibold text-foreground">{p.administratif.jumlahRt} RT</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Laki-laki / Perempuan</dt>
                <dd className="font-semibold text-foreground">
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
