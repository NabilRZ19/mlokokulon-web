"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Rw } from "@/lib/types";

interface WilayahListProps {
  rwList: Rw[];
}

function IconSearch() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-muted-foreground shrink-0"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary shrink-0"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M17 8.5a2.5 2.5 0 1 0 0-5" />
      <path d="M21 20c0-2.8-1.8-5.2-4.3-5.9" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary shrink-0"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-primary shrink-0"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconSprout() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-emerald-600 shrink-0"
    >
      <path d="M7 20h10" />
      <path d="M12 20v-8" />
      <path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7Z" />
    </svg>
  );
}

export function WilayahList({ rwList }: WilayahListProps) {
  const [search, setSearch] = useState("");
  const [filterKbOnly, setFilterKbOnly] = useState(false);

  // Total statistik agregat
  const totalStats = useMemo(() => {
    return rwList.reduce(
      (acc, curr) => ({
        totalRw: acc.totalRw + 1,
        totalRt: acc.totalRt + (curr.jumlah_rt || 0),
        totalKk: acc.totalKk + (curr.statistik?.jumlah_kk || 0),
        totalJiwa: acc.totalJiwa + (curr.statistik?.jumlah_jiwa || 0),
      }),
      { totalRw: 0, totalRt: 0, totalKk: 0, totalJiwa: 0 }
    );
  }, [rwList]);

  // Filtering
  const filteredList = useMemo(() => {
    return rwList.filter((rw) => {
      if (filterKbOnly && !rw.is_kampung_kb) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNama = rw.nama_rw.toLowerCase().includes(q);
        const matchDusun = rw.cakupan_dusun.toLowerCase().includes(q);
        const matchKetua = rw.struktur_pengurus.some(
          (p) => p.nama.toLowerCase().includes(q) || p.jabatan.toLowerCase().includes(q)
        );
        if (!matchNama && !matchDusun && !matchKetua) return false;
      }
      return true;
    });
  }, [rwList, search, filterKbOnly]);

  return (
    <div className="space-y-8">
      {/* ── 1. Ringkasan Demografi Kelurahan (Stat Bar) ───────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="flex items-center gap-3.5 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <IconBuilding />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wilayah RW</p>
            <p className="font-heading text-xl font-extrabold text-foreground">{totalStats.totalRw} RW</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <IconHome />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cakupan RT</p>
            <p className="font-heading text-xl font-extrabold text-foreground">{totalStats.totalRt} RT</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <IconUsers />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Penduduk</p>
            <p className="font-heading text-xl font-extrabold text-foreground">
              {totalStats.totalJiwa.toLocaleString("id-ID")} Jiwa
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <IconUsers />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kepala Keluarga</p>
            <p className="font-heading text-xl font-extrabold text-foreground">
              {totalStats.totalKk.toLocaleString("id-ID")} KK
            </p>
          </div>
        </Card>
      </div>

      {/* ── 2. Kontrol Filter & Search ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-y border-border py-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <IconSearch />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama RW, Dusun, atau nama pengurus..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterKbOnly(false)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              !filterKbOnly
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            Semua Wilayah ({rwList.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterKbOnly(true)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filterKbOnly
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <IconSprout />
            <span>Kampung KB Only</span>
          </button>
        </div>
      </div>

      {/* ── 3. Grid Kartu Profil RW ───────────────────────────────────────── */}
      {filteredList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Tidak ada wilayah RW yang cocok dengan kata kunci &ldquo;{search}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilterKbOnly(false);
            }}
            className="mt-3 text-xs font-semibold text-primary underline"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((rw) => {
            const ketua = rw.struktur_pengurus?.find((p) =>
              p.jabatan.toLowerCase().includes("ketua rw") || p.jabatan.toLowerCase().includes("ketua")
            );

            return (
              <Link
                key={rw.id}
                href={`/wilayah/${rw.id}`}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 font-heading text-xs font-bold text-primary">
                        {rw.nama_rw.split("—")[0].trim()}
                      </span>
                      <h3 className="font-heading text-lg font-extrabold text-foreground group-hover:text-primary transition-colors pt-1">
                        Dusun {rw.cakupan_dusun}
                      </h3>
                    </div>

                    {rw.is_kampung_kb && (
                      <Badge variant="accent">
                        <span className="flex items-center gap-1">
                          <IconSprout />
                          Kampung KB
                        </span>
                      </Badge>
                    )}
                  </div>

                  {/* Ketua RW Highlight Preview (jika ada) */}
                  {ketua ? (
                    <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {ketua.jabatan}
                      </p>
                      <p className="font-heading text-sm font-bold text-foreground mt-0.5">
                        {ketua.nama}
                      </p>
                    </div>
                  ) : null}

                  {/* Sub-Statistik Grid */}
                  <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
                    <div className="rounded-md bg-muted/30 p-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">RT</p>
                      <p className="font-heading text-sm font-bold text-foreground">{rw.jumlah_rt}</p>
                    </div>
                    <div className="rounded-md bg-muted/30 p-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">KK</p>
                      <p className="font-heading text-sm font-bold text-foreground">
                        {rw.statistik?.jumlah_kk ?? "-"}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted/30 p-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Jiwa</p>
                      <p className="font-heading text-sm font-bold text-foreground">
                        {rw.statistik?.jumlah_jiwa ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 border-t border-border/60 pt-3.5 flex items-center justify-between text-xs font-semibold text-primary group-hover:underline">
                  <span>Lihat Detail RW &amp; Pengurus</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
