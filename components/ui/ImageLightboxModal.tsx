"use client";

import { useEffect } from "react";

interface ImageLightboxModalProps {
  isOpen: boolean;
  src: string | null;
  alt?: string;
  title?: string;
  onClose: () => void;
}

export function ImageLightboxModal({
  isOpen,
  src,
  alt = "Foto",
  title,
  onClose,
}: ImageLightboxModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center overflow-hidden rounded-2xl bg-card border border-white/10 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex w-full items-center justify-between border-b border-border/40 bg-card/90 px-4 py-3 text-foreground">
          <p className="font-heading text-sm font-bold truncate pr-4">
            {title || alt}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Buka Ukuran Asli ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-destructive hover:text-white font-bold"
              aria-label="Tutup"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body: Full Resolution Image (No Cropping) */}
        <div className="relative flex items-center justify-center bg-black/90 p-2 sm:p-4 overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[75vh] max-w-[85vw] rounded-lg object-contain shadow-md"
          />
        </div>

        {/* Modal Footer Caption */}
        <div className="w-full border-t border-border/40 bg-card/90 px-4 py-2.5 text-center text-xs text-muted-foreground font-medium">
          Klik di luar atau tekan <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] bg-muted">Esc</kbd> untuk menutup
        </div>
      </div>
    </div>
  );
}
