"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BeritaBadge, KATEGORI_LABEL } from "@/components/berita/BeritaBadge";
import { Card } from "@/components/ui/Card";
import type { Berita, Rw } from "@/lib/types";

const KATEGORI_OPTIONS: Array<Berita["kategori"] | "semua"> = [
  "semua",
  "berita",
  "pengumuman",
  "kegiatan",
  "pembangunan",
];

export function BeritaList({ berita, rwList }: { berita: Berita[]; rwList: Rw[] }) {
  const [kategori, setKategori] = useState<(typeof KATEGORI_OPTIONS)[number]>("semua");
  const [cakupan, setCakupan] = useState<string>("semua");

  const filtered = useMemo(() => {
    return berita.filter((b) => {
      if (kategori !== "semua" && b.kategori !== kategori) return false;
      if (cakupan === "kelurahan" && b.cakupan !== "kelurahan") return false;
      if (cakupan !== "semua" && cakupan !== "kelurahan" && b.rw_id !== cakupan) return false;
      return true;
    });
  }, [berita, kategori, cakupan]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {KATEGORI_OPTIONS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategori(k)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                kategori === k
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {k === "semua" ? "Semua Kategori" : KATEGORI_LABEL[k] ?? k}
            </button>
          ))}
        </div>

        <select
          value={cakupan}
          onChange={(e) => setCakupan(e.target.value)}
          className="ml-auto rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
        >
          <option value="semua">Semua Wilayah</option>
          <option value="kelurahan">Kelurahan (umum)</option>
          {rwList.map((rw) => (
            <option key={rw.id} value={rw.id}>
              {rw.nama_rw}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Tidak ada berita untuk filter ini.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <Link key={b.id} href={`/berita/${b.slug}`}>
              <Card padded={false} className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
                <img src={b.gambar_cover_url} alt={b.judul} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                    <BeritaBadge kategori={b.kategori} />
                    <span>
                      {new Date(b.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="mt-2 font-heading font-semibold text-foreground line-clamp-2">{b.judul}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.cakupan === "kelurahan" ? "Kelurahan" : b.rw_nama}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
