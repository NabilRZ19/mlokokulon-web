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
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`grid w-full shrink-0 snap-start gap-4 transition-opacity duration-500 ease-out ${gridCls} ${
              i === active ? "opacity-100" : "opacity-40"
            }`}
          >
            {slide}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => { setPaused(true); goTo(active - 1); }}
            disabled={active === 0}
            aria-label="Sebelumnya"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setPaused(true); goTo(i); }}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? "h-2 w-5 bg-primary" : "h-2 w-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => { setPaused(true); goTo(active + 1); }}
            disabled={active === slides.length - 1}
            aria-label="Selanjutnya"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
