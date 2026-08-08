"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PengumumanItem } from "@/lib/types";

type SortOption = "terbaru" | "terlama" | "judul-asc" | "judul-desc";

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDateComponents(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: "15", month: "AGU", year: "2026" };
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
  const year = d.getFullYear().toString();
  return { day, month, year };
}

export function PengumumanList({ list }: { list: PengumumanItem[] }) {
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("semua");
  const [sortBy, setSortBy] = useState<SortOption>("terbaru");

  // Extract unique targets for filter dropdown
  const uniqueTargets = useMemo(() => {
    const set = new Set<string>();
    list.forEach((item) => {
      if (item.target_pengumuman) set.add(item.target_pengumuman);
    });
    return Array.from(set);
  }, [list]);

  const filteredAndSorted = useMemo(() => {
    let result = [...list];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.judul.toLowerCase().includes(q) ||
          item.isi.toLowerCase().includes(q) ||
          item.target_pengumuman.toLowerCase().includes(q)
      );
    }

    // Filter by target
    if (targetFilter !== "semua") {
      result = result.filter((item) => item.target_pengumuman === targetFilter);
    }

    // Sort
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
  }, [list, search, targetFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* ── Filter & Sort Bar (Template Style) ── */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filters Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Target Pengumuman */}
            {uniqueTargets.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-muted-foreground whitespace-nowrap">Target:</label>
                <select
                  value={targetFilter}
                  onChange={(e) => setTargetFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
                >
                  <option value="semua">Semua Target Warga</option>
                  {uniqueTargets.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter Urutkan */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-muted-foreground whitespace-nowrap">Urutkan:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
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
        <div className="text-xs text-muted-foreground border-t border-border/60 pt-3">
          Menampilkan <strong className="text-foreground">{filteredAndSorted.length}</strong> pengumuman
        </div>
      </div>

      {/* Pengumuman List Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-xs">
          Tidak ada pengumuman yang sesuai dengan kriteria pencarian / filter.
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAndSorted.map((item) => {
            const { day, month, year } = getDateComponents(item.tanggal);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 group"
              >
                <div className="flex flex-col md:flex-row items-start gap-5 sm:gap-6">
                  {/* Badge Tanggal Menonjol */}
                  <div className="flex shrink-0 items-center md:flex-col justify-center rounded-2xl border border-primary/30 bg-primary/10 p-3 text-center min-w-[90px] sm:min-w-[100px] w-full md:w-auto gap-3 md:gap-0 shadow-2xs">
                    <span className="font-heading text-3xl sm:text-4xl font-extrabold text-primary leading-none">
                      {day}
                    </span>
                    <div className="flex md:flex-col items-center gap-1 md:gap-0">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                        {month}
                      </span>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {year}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-900 border border-emerald-300 shadow-2xs">
                        🎯 Target: {item.target_pengumuman}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        • Ditayangkan: {formatFullDate(item.tanggal)}
                      </span>
                    </div>

                    <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      <Link href={`/pengumuman/${item.slug}`}>
                        {item.judul}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {item.isi}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-border/60 text-xs">
                      <span className="text-muted-foreground font-medium">
                        Oleh: <strong className="text-foreground">{item.penulis}</strong>
                      </span>
                      <Link
                        href={`/pengumuman/${item.slug}`}
                        className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <span>Baca Selengkapnya</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
