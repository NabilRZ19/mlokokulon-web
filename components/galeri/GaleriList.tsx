"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { Pagination } from "@/components/ui/Pagination";
import { Reveal } from "@/components/ui/Reveal";
import { getPublicImageUrl } from "@/lib/image-url";
import type { Galeri } from "@/lib/types";

const PER_PAGE = 9;

// Kategori Utama yang Linked dengan Kategori Berita & Kampung KB
const MAIN_CATEGORIES = [
  { key: "Semua", label: "Semua" },
  { key: "berita", label: "Berita" },
  { key: "kegiatan", label: "Kegiatan" },
  { key: "pengumuman", label: "Pengumuman" },
  { key: "pembangunan", label: "Pembangunan" },
  { key: "kampung-kb", label: "Kampung KB", isAccent: true },
];

export function GaleriList({ galeri }: { galeri: Galeri[] }) {
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  // Pisahkan Kategori Utama vs Kategori Lainnya (Custom Admin Tags)
  const mainKeys = useMemo(
    () => new Set(MAIN_CATEGORIES.map((m) => m.key.toLowerCase()).concat(["kampung kb", "kampungkb"])),
    []
  );

  const otherCategories = useMemo(() => {
    const rawCategories = galeri.map((g) => g.kategori?.trim()).filter(Boolean);
    const uniqueMap = new Map<string, string>(); // lowercase -> display name

    for (const cat of rawCategories) {
      if (!cat) continue;
      const lower = cat.toLowerCase();
      if (!mainKeys.has(lower) && lower !== "semua") {
        if (!uniqueMap.has(lower)) {
          // Capitalize first letter for display
          const formatted = cat.charAt(0).toUpperCase() + cat.slice(1);
          uniqueMap.set(lower, formatted);
        }
      }
    }

    return Array.from(uniqueMap.values());
  }, [galeri, mainKeys]);

  // Logic Filtering Data
  const filtered = useMemo(() => {
    if (activeKategori === "Semua") return galeri;
    const targetLower = activeKategori.toLowerCase();

    if (targetLower === "kampung-kb" || targetLower === "kampung kb") {
      return galeri.filter((g) => {
        const cat = g.kategori?.trim().toLowerCase();
        return cat === "kampung-kb" || cat === "kampung kb" || cat === "kampungkb";
      });
    }

    return galeri.filter((g) => g.kategori?.trim().toLowerCase() === targetLower);
  }, [galeri, activeKategori]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleSelectKategori(catKey: string) {
    setActiveKategori(catKey);
    setPage(1);
    setDropdownOpen(false);
  }

  const isOtherActive = otherCategories.some(
    (cat) => cat.toLowerCase() === activeKategori.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* ── Filter Bar: Kategori Utama (Linked Berita) + Kategori Lainnya Dropdown ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {MAIN_CATEGORIES.map((cat) => {
          const isActive = activeKategori.toLowerCase() === cat.key.toLowerCase();
          const isAccent = cat.isAccent;

          let btnStyle = "border border-border bg-card text-foreground hover:bg-muted hover:text-primary";
          if (isActive) {
            btnStyle = isAccent
              ? "bg-accent text-white shadow-md scale-[1.02] ring-2 ring-emerald-600/40"
              : "bg-primary text-white shadow-md scale-[1.02]";
          } else if (isAccent) {
            btnStyle = "border border-emerald-500/40 bg-emerald-500/10 font-extrabold text-emerald-700 hover:bg-accent hover:text-white";
          }

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleSelectKategori(cat.key)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 ${btnStyle}`}
            >
              {cat.label}
            </button>
          );
        })}

        {/* Tombol Filter Lainnya (Custom Admin Tags) */}
        {otherCategories.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 ${
                isOtherActive
                  ? "bg-primary text-white shadow-md"
                  : "border border-border bg-card text-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <span>{isOtherActive ? `Kategori: ${activeKategori}` : "Filter Lainnya"}</span>
              <span className="text-xs">▾</span>
            </button>

            {/* Dropdown Menu Kategori Lainnya */}
            {dropdownOpen && (
              <div
                onMouseLeave={() => setDropdownOpen(false)}
                className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
                  Kategori Tambahan Admin
                </div>
                {otherCategories.map((otherCat) => {
                  const isCatSelected = activeKategori.toLowerCase() === otherCat.toLowerCase();
                  return (
                    <button
                      key={otherCat}
                      type="button"
                      onClick={() => handleSelectKategori(otherCat)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        isCatSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{otherCat}</span>
                      {isCatSelected && (
                        <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Grid Items Galeri ── */}
      {pageItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground space-y-2">
          <p className="font-heading text-base font-bold text-foreground">
            Tidak ada foto/video untuk kategori &quot;{activeKategori}&quot;
          </p>
          <p className="text-xs text-muted-foreground">
            Silakan pilih kategori media lainnya di atas.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((g, i) => {
            const mediaUrl = getPublicImageUrl(g.url_media);
            const categoryLabel = g.kategori ? g.kategori.charAt(0).toUpperCase() + g.kategori.slice(1) : "Umum";

            return (
              <Reveal key={g.id} mode="scroll" delay={(i % 6) * 0.06}>
                <Card
                  padded={false}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md h-full"
                >
                  {/* Header Container Media */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {/* Category & Type Badge (Clean Minimalist Glassmorphism Style) */}
                    <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
                      <span className="rounded-md bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs border border-white/15 shadow-xs capitalize">
                        {categoryLabel}
                      </span>
                      {g.tipe === "video" && (
                        <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                          Video
                        </span>
                      )}
                    </div>

                    {g.tipe === "video" ? (
                      <video src={mediaUrl} controls className="h-full w-full bg-black object-cover" />
                    ) : (
                      <div
                        onClick={() => setActiveImage({ url: mediaUrl, title: g.judul })}
                        className="relative h-full w-full cursor-pointer overflow-hidden"
                        title="Klik untuk memperbesar foto"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mediaUrl}
                          alt={g.judul}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Minimalist Sleek Zoom Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-110">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Caption */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <p className="font-heading text-sm font-bold text-foreground line-clamp-2 leading-snug">
                      {g.judul}
                    </p>
                    {g.sumber_berita_id && (
                      <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                        Terhubung dari Berita
                      </p>
                    )}
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Lightbox Popup Modal */}
      <ImageLightboxModal
        isOpen={!!activeImage}
        src={activeImage?.url ?? null}
        title={activeImage?.title}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}
