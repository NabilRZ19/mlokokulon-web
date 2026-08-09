"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarIcon, MapPinIcon } from "@/components/admin/icons";
import { getPublicImageUrl } from "@/lib/image-url";
import type { EventItem } from "@/lib/types";

type SortOption = "terdekat" | "terjauh" | "judul-asc" | "judul-desc";

function formatEventRange(startStr: string, endStr?: string | null) {
  const dStart = new Date(startStr);
  if (isNaN(dStart.getTime())) return startStr;

  const startFormatted = dStart.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!endStr || endStr === startStr) {
    return startFormatted;
  }

  const dEnd = new Date(endStr);
  if (isNaN(dEnd.getTime())) return startFormatted;

  const endFormatted = dEnd.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${startFormatted} s/d ${endFormatted}`;
}

function getEventBadgeDate(startStr: string, endStr?: string | null) {
  const dStart = new Date(startStr);
  const dayStart = isNaN(dStart.getTime()) ? "15" : dStart.getDate().toString().padStart(2, "0");
  const monthStart = isNaN(dStart.getTime()) ? "AGU" : dStart.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
  const yearStart = isNaN(dStart.getTime()) ? "2026" : dStart.getFullYear().toString();

  let dayEnd: string | null = null;
  if (endStr && endStr !== startStr) {
    const dEnd = new Date(endStr);
    if (!isNaN(dEnd.getTime())) {
      dayEnd = dEnd.getDate().toString().padStart(2, "0");
    }
  }

  return { dayStart, dayEnd, monthStart, yearStart };
}

export function EventList({ list }: { list: EventItem[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("terdekat");

  const filteredAndSorted = useMemo(() => {
    let result = [...list];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.judul.toLowerCase().includes(q) ||
          item.deskripsi.toLowerCase().includes(q) ||
          item.lokasi.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "terdekat") {
        return new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime();
      }
      if (sortBy === "terjauh") {
        return new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime();
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
  }, [list, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* ── Filter & Sort Bar (Template Style) ── */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari event atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Filter Urutkan */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-muted-foreground whitespace-nowrap">Urutkan Waktu:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="terdekat">Terdekat</option>
              <option value="terjauh">Terjauh</option>
              <option value="judul-asc">Judul (A–Z)</option>
              <option value="judul-desc">Judul (Z–A)</option>
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="text-xs text-muted-foreground border-t border-border/60 pt-3">
          Menampilkan <strong className="text-foreground">{filteredAndSorted.length}</strong> agenda event mendatang
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-xs">
          Tidak ada agenda event yang sesuai dengan pencarian / filter.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((item) => {
            const { dayStart, dayEnd, monthStart, yearStart } = getEventBadgeDate(item.tanggal_mulai, item.tanggal_selesai);

            return (
              <Link
                key={item.id}
                href={`/event/${item.slug}`}
                className="block group"
              >
                <article
                  className="flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md"
                >
                  <div className="space-y-4 pb-5">
                    {/* Header Image & Calendar Badge Overlay */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      {item.gambar_cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getPublicImageUrl(item.gambar_cover_url)}
                          alt={item.judul}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-emerald-950/20 text-emerald-800 font-bold text-xs">
                          Agenda Kelurahan
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Prominent Calendar Badge */}
                      <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-xl border border-white/30 bg-card/95 px-3 py-2 text-center shadow-lg backdrop-blur-md">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                          {monthStart}
                        </span>
                        <span className="font-heading text-xl font-extrabold text-foreground leading-none my-0.5">
                          {dayEnd ? `${dayStart}-${dayEnd}` : dayStart}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {yearStart}
                        </span>
                      </div>
                    </div>

                    {/* Info Text */}
                    <div className="px-5 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{item.jam_mulai}</span>
                        </div>
                        <h2 className="font-heading text-base font-extrabold text-foreground group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                          {item.judul}
                        </h2>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.deskripsi}
                      </p>

                      <div className="rounded-xl border border-border/80 bg-muted/40 p-2.5 space-y-1.5 text-xs">
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          <MapPinIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{item.lokasi}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{formatEventRange(item.tanggal_mulai, item.tanggal_selesai)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
