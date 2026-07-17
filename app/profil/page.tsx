import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { kelurahanProfileData as p } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Profil Desa — Kelurahan Mlokomanis Kulon",
};

// Konten halaman ini hardcode di kode (bukan CMS/Firestore), sesuai PRD Bagian 6.2.
export default function ProfilPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profil Desa</h1>
        <p className="text-muted-foreground">
          Kelurahan {p.nama}, Kecamatan {p.kecamatan}, Kabupaten {p.kabupaten}, {p.provinsi}
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Sejarah Desa</h2>
        <p className="mt-2 text-sm italic text-amber-700">{p.sejarah}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Visi & Misi</h2>
        <p className="mt-2 text-sm italic text-amber-700">{p.visi}</p>
        <ul className="mt-1 list-inside list-disc text-sm italic text-amber-700">
          {p.misi.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Letak Geografis</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-foreground">
          <dt className="text-muted-foreground">Koordinat</dt>
          <dd>{p.geografis.koordinat}</dd>
          <dt className="text-muted-foreground">Elevasi</dt>
          <dd>{p.geografis.elevasiMdpl} mdpl</dd>
          <dt className="text-muted-foreground">Iklim</dt>
          <dd>{p.geografis.iklim}</dd>
          <dt className="text-muted-foreground">Curah hujan</dt>
          <dd>
            {p.geografis.curahHujanMm} mm/tahun ({p.geografis.bulanHujan} bulan hujan)
          </dd>
          <dt className="text-muted-foreground">Tanah</dt>
          <dd>{p.geografis.tanah}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Batas Wilayah</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-foreground">
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

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Data Administratif & Demografi</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-foreground">
          <dt className="text-muted-foreground">Jumlah KK</dt>
          <dd>{p.administratif.jumlahKk.toLocaleString("id-ID")}</dd>
          <dt className="text-muted-foreground">Jumlah RW / RT</dt>
          <dd>
            {p.administratif.jumlahRw} RW / {p.administratif.jumlahRt} RT
          </dd>
          <dt className="text-muted-foreground">Jumlah Dusun</dt>
          <dd>{p.administratif.jumlahDusun}</dd>
          <dt className="text-muted-foreground">Total Penduduk</dt>
          <dd>{p.demografi.totalJiwa.toLocaleString("id-ID")} jiwa</dd>
          <dt className="text-muted-foreground">Laki-laki / Perempuan</dt>
          <dd>
            {p.demografi.lakiLaki.toLocaleString("id-ID")} / {p.demografi.perempuan.toLocaleString("id-ID")}
          </dd>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Potensi Desa</h2>
        <p className="mt-2 text-sm text-foreground">{p.potensi.catatanEkonomi}</p>

        <h3 className="mt-3 text-sm font-semibold text-foreground">Pertanian</h3>
        <ul className="mt-1 text-sm text-foreground">
          {p.potensi.pertanian.map((item) => (
            <li key={item.komoditas}>
              {item.komoditas} — {item.luasHektare} ha, hasil {item.hasilTonPerHektare} ton/ha
            </li>
          ))}
        </ul>

        <h3 className="mt-3 text-sm font-semibold text-foreground">Peternakan</h3>
        <ul className="mt-1 text-sm text-foreground">
          {p.potensi.peternakan.map((item) => (
            <li key={item.jenis}>
              {item.jenis} — {item.jumlah.toLocaleString("id-ID")} ekor
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-sm text-muted-foreground">
        Lihat juga{" "}
        <Link href="/struktur" className="text-primary underline">
          Struktur Kelurahan
        </Link>
        .
      </p>
    </div>
  );
}
