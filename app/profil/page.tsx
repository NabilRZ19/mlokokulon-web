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
        <h1 className="text-2xl font-bold text-slate-900">Profil Desa</h1>
        <p className="text-slate-600">
          Kelurahan {p.nama}, Kecamatan {p.kecamatan}, Kabupaten {p.kabupaten}, {p.provinsi}
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Sejarah Desa</h2>
        <p className="mt-2 text-sm italic text-amber-700">{p.sejarah}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Visi & Misi</h2>
        <p className="mt-2 text-sm italic text-amber-700">{p.visi}</p>
        <ul className="mt-1 list-inside list-disc text-sm italic text-amber-700">
          {p.misi.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Letak Geografis</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700">
          <dt className="text-slate-500">Koordinat</dt>
          <dd>{p.geografis.koordinat}</dd>
          <dt className="text-slate-500">Elevasi</dt>
          <dd>{p.geografis.elevasiMdpl} mdpl</dd>
          <dt className="text-slate-500">Iklim</dt>
          <dd>{p.geografis.iklim}</dd>
          <dt className="text-slate-500">Curah hujan</dt>
          <dd>
            {p.geografis.curahHujanMm} mm/tahun ({p.geografis.bulanHujan} bulan hujan)
          </dd>
          <dt className="text-slate-500">Tanah</dt>
          <dd>{p.geografis.tanah}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Batas Wilayah</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700">
          <dt className="text-slate-500">Utara</dt>
          <dd>{p.batasWilayah.utara}</dd>
          <dt className="text-slate-500">Timur</dt>
          <dd>{p.batasWilayah.timur}</dd>
          <dt className="text-slate-500">Selatan</dt>
          <dd>{p.batasWilayah.selatan}</dd>
          <dt className="text-slate-500">Barat</dt>
          <dd>{p.batasWilayah.barat}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Data Administratif & Demografi</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700">
          <dt className="text-slate-500">Jumlah KK</dt>
          <dd>{p.administratif.jumlahKk.toLocaleString("id-ID")}</dd>
          <dt className="text-slate-500">Jumlah RW / RT</dt>
          <dd>
            {p.administratif.jumlahRw} RW / {p.administratif.jumlahRt} RT
          </dd>
          <dt className="text-slate-500">Jumlah Dusun</dt>
          <dd>{p.administratif.jumlahDusun}</dd>
          <dt className="text-slate-500">Total Penduduk</dt>
          <dd>{p.demografi.totalJiwa.toLocaleString("id-ID")} jiwa</dd>
          <dt className="text-slate-500">Laki-laki / Perempuan</dt>
          <dd>
            {p.demografi.lakiLaki.toLocaleString("id-ID")} / {p.demografi.perempuan.toLocaleString("id-ID")}
          </dd>
        </dl>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Potensi Desa</h2>
        <p className="mt-2 text-sm text-slate-700">{p.potensi.catatanEkonomi}</p>

        <h3 className="mt-3 text-sm font-semibold text-slate-800">Pertanian</h3>
        <ul className="mt-1 text-sm text-slate-700">
          {p.potensi.pertanian.map((item) => (
            <li key={item.komoditas}>
              {item.komoditas} — {item.luasHektare} ha, hasil {item.hasilTonPerHektare} ton/ha
            </li>
          ))}
        </ul>

        <h3 className="mt-3 text-sm font-semibold text-slate-800">Peternakan</h3>
        <ul className="mt-1 text-sm text-slate-700">
          {p.potensi.peternakan.map((item) => (
            <li key={item.jenis}>
              {item.jenis} — {item.jumlah.toLocaleString("id-ID")} ekor
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-sm text-slate-600">
        Lihat juga{" "}
        <Link href="/struktur" className="text-emerald-700 underline">
          Struktur Kelurahan
        </Link>
        .
      </p>
    </div>
  );
}
