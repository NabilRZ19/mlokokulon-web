"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import type { Galeri } from "@/lib/types";

const PER_PAGE = 9;

// Filter + pagination murni client-side atas data yang sudah di-fetch server (SSG/ISR) — tidak
// ada fetch Firestore tambahan dari browser, sesuai aturan kritikal PRD Bagian 7 poin 2.
// Tidak ada halaman detail (PRD sitemap Bagian 5 tidak punya /galeri/[slug]) — judul/annotation
// wajib per item (PRD 6.8) ditampilkan langsung sebagai caption di grid.
export function GaleriList({ galeri }: { galeri: Galeri[] }) {
  const kategoriOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(galeri.map((g) => g.kategori).filter(Boolean)))],
    [galeri],
  );

  const [kategori, setKategori] = useState("Semua");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (kategori === "Semua" ? galeri : galeri.filter((g) => g.kategori === kategori)),
    [galeri, kategori],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleKategoriChange(k: string) {
    setKategori(k);
    setPage(1);
  }

  return (
    <div>
      {kategoriOptions.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {kategoriOptions.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKategoriChange(k as string)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                kategori === k
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {pageItems.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Belum ada foto/video untuk kategori ini.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((g) => (
            <Card key={g.id} padded={false} className="overflow-hidden">
              {g.tipe === "video" ? (
                <video src={g.url_media} controls className="h-40 w-full bg-black object-cover" />
              ) : (
                <img src={g.url_media} alt={g.judul} className="h-40 w-full object-cover" />
              )}
              <p className="p-3 text-sm text-foreground">{g.judul}</p>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
