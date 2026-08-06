"use client";

import { useState } from "react";

interface InfoLinkButtonProps {
  label?: string;
  className?: string;
}

export function InfoLinkButton({
  label = "Info Tatacara Upload Link",
  className = "",
}: InfoLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/40 ${className}`}
        title="Buka petunjuk tatacara upload link media"
      >
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{label}</span>
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Panduan Tatacara Upload Link
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Petunjuk pengisian link video, lokasi, atau media eksternal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-bold"
                aria-label="Tutup Modal"
              >
                ✕
              </button>
            </div>

            {/* Infographic Placeholder Container */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-heading text-sm font-extrabold text-foreground">
                  [ Placeholder Infografis Tatacara Upload Link ]
                </p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  File visual infografis panduan akan ditampilkan di area ini setelah siap.
                </p>
              </div>
            </div>

            {/* Quick Format Guidelines */}
            <div className="space-y-3.5 rounded-xl border border-border bg-muted/40 p-4 text-xs">
              <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Format Link yang Didukung:
              </p>
              <ul className="space-y-2 text-muted-foreground font-medium">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong className="text-foreground">YouTube Video:</strong> Gunakan link lengkap atau pendek (misal:{" "}
                    <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px] text-foreground">
                      https://www.youtube.com/watch?v=...
                    </code>{" "}
                    atau{" "}
                    <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px] text-foreground">
                      https://youtu.be/...
                    </code>
                    ).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Google Maps:</strong> Salin link lokasi publik dari tombol Bagikan (misal:{" "}
                    <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px] text-foreground">
                      https://maps.app.goo.gl/...
                    </code>
                    ).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Akses Publik:</strong> Pastikan media/link tidak dikunci dan dapat dibuka langsung tanpa login.
                  </span>
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
              >
                Paham &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
