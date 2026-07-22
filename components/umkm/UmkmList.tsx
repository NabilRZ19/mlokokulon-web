"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import type { Umkm } from "@/lib/types";

const PER_PAGE = 6;

// ─── Inline Icons ────────────────────────────────────────────────────────────
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-muted-foreground">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

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
    <div className="space-y-8">
      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap gap-2">
          {kategoriOptions.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKategoriChange(k)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                kategori === k
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Menampilkan {filtered.length} Usaha
        </span>
      </div>

      {/* Grid Katalog UMKM */}
      {pageItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Belum ada UMKM untuk kategori ini.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((u) => {
            const cover = u.foto_urls[0] || "/images/placeholder.jpg";
            const photoCount = u.foto_urls.length;

            return (
              <Link key={u.id} href={`/umkm/${u.slug}`} className="group">
                <Card
                  padded={false}
                  className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md flex flex-col"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt={u.nama}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Category Badge overlay */}
                    <div className="absolute left-3 top-3">
                      <Badge>{u.kategori}</Badge>
                    </div>
                    {/* Photo count badge */}
                    {photoCount > 1 && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                        <IconCamera />
                        <span>{photoCount} Foto</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      {/* Jam Operasional */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <IconClock />
                        <span>{u.jam_operasional}</span>
                      </div>

                      {/* Nama Usaha */}
                      <h2 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {u.nama}
                      </h2>

                      {/* Deskripsi */}
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                        {u.deskripsi}
                      </p>

                      {/* Chips Produk Unggulan */}
                      {u.produk_unggulan.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {u.produk_unggulan.slice(0, 3).map((p, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground border border-border/50"
                            >
                              {p}
                            </span>
                          ))}
                          {u.produk_unggulan.length > 3 && (
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                              +{u.produk_unggulan.length - 3} lagi
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5 text-xs font-semibold text-primary">
                      <span>Lihat Detail Usaha</span>
                      <IconArrowRight />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
