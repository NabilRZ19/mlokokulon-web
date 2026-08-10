"use client";

import Link from "next/link";
import { useState } from "react";
import { getPublicImageUrl } from "@/lib/image-url";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { KampungKbIcon } from "@/components/ui/icons";
import type { Rw } from "@/lib/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  sprout: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12m0 0C12 7 7 4 3 6c0 5 4 8 9 6zm0 0c0-5 5-8 9-6 0 5-4 8-9 6" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  pkk: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  shield: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  trophy: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  building: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

export function WilayahDetailView({ rw }: { rw: Rw }) {
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  const fotoKetuaUrl = rw.ketua_foto_url ? getPublicImageUrl(rw.ketua_foto_url) : null;

  // Pengurus inti (Sekretaris, Bendahara, dll — bukan Ketua & bukan RT & bukan org)
  const pengurusRw = rw.struktur_pengurus.filter(
    (p) => p.kategori === "rw" || (!p.kategori && !p.organisasi)
  );
  const pengurusRt = rw.struktur_pengurus.filter((p) => p.kategori === "rt");

  const orgMap = new Map<string, { icon: string; pengurus: typeof rw.struktur_pengurus }>();
  rw.struktur_pengurus
    .filter((p) => p.kategori === "organisasi" && p.organisasi)
    .forEach((p) => {
      const key = p.organisasi!;
      const existing = orgMap.get(key) ?? { icon: p.icon || "users", pengurus: [] };
      existing.pengurus.push(p);
      orgMap.set(key, existing);
    });
  const orgList = Array.from(orgMap.entries());

  return (
    <div className="min-h-screen bg-background py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 space-y-6">

        {/* Back */}
        <Link
          href="/wilayah"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
        >
          ← Kembali ke Daftar Wilayah
        </Link>

        {/* ── Hero Card ── */}
        <div className="rounded-3xl border border-border bg-card shadow-md overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Foto Ketua */}
              <div
                onClick={() =>
                  fotoKetuaUrl &&
                  setActiveImage({ url: fotoKetuaUrl, title: `${rw.ketua_nama} — Ketua ${rw.nama_rw}` })
                }
                className={`relative h-24 w-24 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-lg ${fotoKetuaUrl ? "cursor-pointer group" : ""}`}
              >
                {fotoKetuaUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fotoKetuaUrl} alt={rw.ketua_nama || "Ketua RW"} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-primary/40">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Wilayah RW</span>
                  {rw.is_kampung_kb && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold text-accent">
                      <KampungKbIcon className="h-3 w-3 fill-current" />
                      Kampung KB
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl leading-tight">{rw.nama_rw}</h1>
                <p className="text-sm text-muted-foreground">Dusun {rw.cakupan_dusun}</p>
                <div className="pt-1">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Ketua RW</p>
                  <p className="text-base font-bold text-foreground mt-0.5">{rw.ketua_nama || "Belum diisi"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistik strip */}
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border text-center">
            {[
              { label: "Rukun Tetangga", value: `${rw.jumlah_rt} RT` },
              { label: "Kepala Keluarga", value: `${rw.statistik.jumlah_kk} KK` },
              { label: "Total Jiwa", value: `${rw.statistik.jumlah_jiwa} Jiwa` },
            ].map((stat) => (
              <div key={stat.label} className="px-2 py-4 space-y-0.5">
                <p className="text-base font-extrabold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pengurus Inti RW ── */}
        {/* Ketua RW selalu ditampilkan di atas, diambil dari rw.ketua_nama */}
        <div className="rounded-2xl border border-primary/20 bg-card shadow-xs overflow-hidden">
          <div className="bg-primary/5 px-5 py-3.5 border-b border-primary/15">
            <h2 className="font-heading text-sm font-bold text-foreground">Pengurus Inti RW</h2>
          </div>

          <div className="divide-y divide-border/60">
            {/* Ketua RW — selalu di atas, dari rw.ketua_nama */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border-2 border-primary/30 bg-primary/10 shadow-2xs">
                {fotoKetuaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fotoKetuaUrl}
                    alt={rw.ketua_nama || "Ketua RW"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5 text-primary/40">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-foreground truncate">{rw.ketua_nama || "Belum diisi"}</p>
                <p className="text-[11px] text-primary font-bold">Ketua RW</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary">Pimpinan</span>
            </div>

            {/* Pengurus inti lainnya (Sekretaris, Bendahara, dll) */}
            {pengurusRw.length > 0 ? (
              pengurusRw.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {i + 2}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{p.nama}</p>
                    <p className="text-[11px] text-muted-foreground">{p.jabatan}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-4 text-xs text-muted-foreground italic">
                Belum ada data pengurus inti lainnya.
              </div>
            )}
          </div>
        </div>

        {/* ── Pengurus RT ── */}
        {pengurusRt.length > 0 && (
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="bg-blue-50/80 dark:bg-blue-950/20 px-5 py-3.5 border-b border-blue-100 dark:border-blue-900/30">
              <h2 className="font-heading text-sm font-bold text-foreground">Pengurus Rukun Tetangga (RT)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x-0">
              {/* Use gap-px trick for grid with dividers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 col-span-full divide-y divide-border/40 sm:gap-0">
                {pengurusRt.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-border/40 last:border-b-0 sm:border-b sm:odd:border-r sm:last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{p.nama}</p>
                      <p className="text-[11px] text-muted-foreground">{p.jabatan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Organisasi Kemasyarakatan ── */}
        {orgList.length > 0 && (
          <div className="space-y-4">
            {orgList.map(([orgName, { icon, pengurus }]) => (
              <div key={orgName} className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="flex items-center gap-3 bg-emerald-50/80 dark:bg-emerald-950/20 px-5 py-3.5 border-b border-emerald-100 dark:border-emerald-900/30">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    {ICON_MAP[icon] ?? ICON_MAP["users"]}
                  </span>
                  <h2 className="font-heading text-sm font-bold text-foreground">{orgName}</h2>
                </div>
                <div className="divide-y divide-border/50">
                  {pengurus.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{p.nama}</p>
                        <p className="text-[11px] text-muted-foreground">{p.jabatan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Potensi Wilayah ── */}
        {rw.potensi && (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="font-heading text-sm font-bold text-foreground border-b border-border pb-3">Potensi Wilayah</h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{rw.potensi}</p>
          </div>
        )}

      </div>

      <ImageLightboxModal
        isOpen={!!activeImage}
        src={activeImage?.url ?? null}
        title={activeImage?.title}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}
