"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface CarouselProps {
  items: ReactNode[];
  /** Berapa item ditampilkan sekaligus per slide (dikelompokkan jadi grid, bukan discroll satu-satu) */
  itemsPerSlide?: number;
  /** Aktifkan autoplay — slide otomatis berpindah setiap interval */
  autoplay?: boolean;
  /** Interval autoplay dalam milidetik (default 5000ms = 5 detik) */
  autoplayInterval?: number;
  /** Jumlah kolom grid mobile (default 1) */
  colsMobile?: number;
  /** Jumlah kolom grid sm+ (default 3) */
  colsSm?: number;
  /** Varian warna kontrol & titik slide: "default" (bg terang) atau "light" (bg gelap) */
  dotVariant?: "default" | "light";
}

const GRID_COLS_SM: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

const GRID_COLS_MOBILE: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

/**
 * Carousel per-slide dengan optional autoplay.
 *
 * - Autoplay pause saat user hover atau ketika ada elemen yang focused di dalam slide
 * - Autoplay pause otomatis jika prefers-reduced-motion aktif
 * - Loop: setelah slide terakhir, kembali ke slide pertama
 */
export function Carousel({
  items,
  itemsPerSlide = 3,
  autoplay = false,
  autoplayInterval = 5000,
  colsMobile = 1,
  colsSm = 3,
  dotVariant = "default",
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += itemsPerSlide) {
    slides.push(items.slice(i, i + itemsPerSlide));
  }

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    // Loop — wrap index ke 0 jika sudah lewat slide terakhir
    const wrapped = ((index % slides.length) + slides.length) % slides.length;
    track.scrollTo({ left: wrapped * track.clientWidth, behavior: "smooth" });
    setActive(wrapped);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  // Autoplay — skip jika prefers-reduced-motion atau hanya 1 slide
  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;

    // Respek prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const interval = setInterval(() => {
      if (!paused) {
        goTo(active + 1);
      }
    }, autoplayInterval);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, autoplay, autoplayInterval, slides.length]);

  if (slides.length === 0) return null;

  const gridCls = `${GRID_COLS_MOBILE[colsMobile] ?? "grid-cols-1"} ${GRID_COLS_SM[colsSm] ?? "sm:grid-cols-3"}`;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth py-3 -my-3 px-1 -mx-1"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`grid w-full shrink-0 snap-start gap-4 transition-opacity duration-500 ease-out p-1 ${gridCls} ${
              i === active ? "opacity-100" : "opacity-40"
            }`}
          >
            {slide}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => { setPaused(true); goTo(active - 1); }}
            aria-label="Sebelumnya"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
              dotVariant === "light"
                ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-900 shadow-sm"
                : "border-border bg-card text-foreground hover:bg-muted shadow-xs"
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 px-1 py-1">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setPaused(true); goTo(i); }}
                aria-label={`Slide ${i + 1}`}
                className="group relative flex h-7 items-center justify-center px-1"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === active
                      ? dotVariant === "light"
                        ? "h-2.5 w-7 bg-white shadow-sm"
                        : "h-2.5 w-7 bg-primary shadow-xs"
                      : dotVariant === "light"
                        ? "h-2.5 w-2.5 bg-white/40 group-hover:bg-white/70"
                        : "h-2.5 w-2.5 bg-foreground/25 group-hover:bg-foreground/50"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { setPaused(true); goTo(active + 1); }}
            aria-label="Selanjutnya"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
              dotVariant === "light"
                ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-900 shadow-sm"
                : "border-border bg-card text-foreground hover:bg-muted shadow-xs"
            }`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

