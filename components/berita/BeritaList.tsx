"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BeritaBadge, KATEGORI_LABEL } from "@/components/berita/BeritaBadge";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { getPublicImageUrl } from "@/lib/image-url";
import type { Berita, Rw } from "@/lib/types";

const KATEGORI_OPTIONS: Array<Berita["kategori"] | "semua"> = [
  "semua",
  "berita",
  "pengumuman",
  "kegiatan",
  "pembangunan",
  "kampung-kb",
];

type SortOption = "terbaru" | "terlama" | "judul-asc" | "judul-desc";

const ITEMS_PER_PAGE = 5;

export function BeritaList({ berita, rwList }: { berita: Berita[]; rwList: Rw[] }) {
  const [kategori, setKategori] = useState<(typeof KATEGORI_OPTIONS)[number]>("semua");
  const [cakupan, setCakupan] = useState<string>("semua");
  const [sortBy, setSortBy] = useState<SortOption>("terbaru");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    // 1. Filter
    const result = berita.filter((b) => {
      if (kategori !== "semua" && b.kategori !== kategori) return false;
      if (cakupan === "kelurahan" && b.cakupan !== "kelurahan") return false;
      if (cakupan !== "semua" && cakupan !== "kelurahan" && b.rw_id !== cakupan) return false;
      return true;
    });

    // 2. Sort
    result.sort((a, b) => {
      if (sortBy === "terbaru") {
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      }
      if (sortBy === "terlama") {
        return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      }
      if (sortBy === "judul-asc") {
        return a.judul.localeCompare(b.judul, "id", { sensitivity: "base" });
      }
      if (sortBy === "judul-desc") {
        return b.judul.localeCompare(a.judul, "id", { sensitivity: "base" });
      }
      return 0;
    });

    return result;
  }, [berita, kategori, cakupan, sortBy]);

  // Total Halaman
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);

  // Items untuk halaman saat ini
  const currentPageItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, currentPage]);

  // Reset ke halaman 1 jika filter berubah
  function handleKategoriChange(k: (typeof KATEGORI_OPTIONS)[number]) {
    setKategori(k);
    setCurrentPage(1);
  }
  function handleCakupanChange(val: string) {
    setCakupan(val);
    setCurrentPage(1);
  }
  function handleSortChange(val: SortOption) {
    setSortBy(val);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 250, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      {/* ── Filter Bar & Sort Controls (Template Design System) ─────────────── */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Pills Filter Kategori */}
          <div className="flex flex-wrap gap-2">
            {KATEGORI_OPTIONS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKategoriChange(k)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  kategori === k
                    ? "border-primary bg-primary text-white shadow-xs scale-105"
                    : "border-border bg-background text-foreground hover:bg-muted hover:border-border/80"
                }`}
              >
                {k === "semua" ? "Semua Kategori" : KATEGORI_LABEL[k] ?? k}
              </button>
            ))}
          </div>

          {/* Dropdown Filters (Wilayah & Urutkan) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Wilayah */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-wilayah" className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                Wilayah:
              </label>
              <select
                id="filter-wilayah"
                value={cakupan}
                onChange={(e) => handleCakupanChange(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="semua">Semua Wilayah</option>
                <option value="kelurahan">Kelurahan (Umum)</option>
                {rwList.map((rw) => (
                  <option key={rw.id} value={rw.id}>
                    {rw.nama_rw}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Urutkan berdasarkan */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-sort" className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                Urutkan:
              </label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="terbaru">Terbaru (Tanggal ↓)</option>
                <option value="terlama">Terlama (Tanggal ↑)</option>
                <option value="judul-asc">Judul (A–Z)</option>
                <option value="judul-desc">Judul (Z–A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3">
          <span>
            Menampilkan <strong className="text-foreground">{currentPageItems.length}</strong> dari{" "}
            <strong className="text-foreground">{filteredAndSorted.length}</strong> berita
          </span>
          {totalPages > 1 && (
            <span>
              Halaman <strong className="text-foreground">{currentPage}</strong> dari{" "}
              <strong className="text-foreground">{totalPages}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ── Grid Berita (Maksimal 12 Per Halaman) ───────────────────────── */}
      {filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            Tidak ada berita atau pengumuman yang sesuai dengan filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {currentPageItems.map((b, i) => (
            <Reveal key={b.id} mode="scroll" delay={(i % 6) * 0.05}>
              <Link href={`/berita/${b.slug}`}>
                <Card padded={false} className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPublicImageUrl(b.gambar_cover_url)}
                    alt={b.judul}
                    loading="lazy"
                    decoding="async"
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-5 flex flex-col justify-between h-[calc(100%-11rem)]">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <BeritaBadge kategori={b.kategori} />
                        <span>
                          {new Date(b.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h2 className="font-heading font-bold text-foreground text-base line-clamp-2 leading-snug">
                        {b.judul}
                      </h2>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{b.cakupan === "kelurahan" ? "Kelurahan" : b.rw_nama}</span>
                      <span className="font-bold text-primary hover:underline">Baca selengkapnya →</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {/* ── Navigasi Paginasi (Desain Modern Template System) ─────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {/* Tombol Sebelumnya */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Sebelumnya
          </button>

          {/* Angka Halaman */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`h-9 w-9 rounded-lg border text-xs font-extrabold transition-all ${
                  currentPage === pageNum
                    ? "border-primary bg-primary text-white shadow-xs scale-105"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          {/* Tombol Selanjutnya */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}
