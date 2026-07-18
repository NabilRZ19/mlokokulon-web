"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import type { Umkm } from "@/lib/types";

const PER_PAGE = 6;

// Filter + pagination murni client-side atas data yang sudah di-fetch server (SSG/ISR) — tidak
// ada fetch Firestore tambahan dari browser, sesuai aturan kritikal PRD Bagian 7 poin 2.
export function UmkmList({ umkm }: { umkm: Umkm[] }) {
  const kategoriOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(umkm.map((u) => u.kategori)))],
    [umkm],
  );

  const [kategori, setKategori] = useState("Semua");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (kategori === "Semua" ? umkm : umkm.filter((u) => u.kategori === kategori)),
    [umkm, kategori],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleKategoriChange(k: string) {
    setKategori(k);
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {kategoriOptions.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKategoriChange(k)}
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

      {pageItems.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Belum ada UMKM untuk kategori ini.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((u) => (
            <Link key={u.id} href={`/umkm/${u.slug}`}>
              <Card padded={false} className="h-full overflow-hidden">
                <img src={u.foto_urls[0]} alt={u.nama} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <Badge>{u.kategori}</Badge>
                  <h2 className="mt-2 font-heading font-semibold text-foreground">{u.nama}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{u.deskripsi}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
