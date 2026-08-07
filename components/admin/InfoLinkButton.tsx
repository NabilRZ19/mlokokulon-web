"use client";

import { useState } from "react";

interface InfoLinkButtonProps {
  label?: string;
  className?: string;
}

type TabType = "gmaps" | "youtube" | "gdrive" | "sosmed";

export function InfoLinkButton({
  label = "Cara Copy Link",
  className = "",
}: InfoLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("gmaps");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/40 ${className}`}
        title="Buka petunjuk cara copy link"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Cara Copy Link
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Petunjuk singkat menyalin link dari berbagai platform.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground text-sm font-bold"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigasi */}
            <div className="flex flex-wrap gap-1 border-b border-border pb-2.5">
              <button
                type="button"
                onClick={() => setActiveTab("gmaps")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "gmaps"
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Google Maps
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("youtube")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "youtube"
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                YouTube
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("gdrive")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "gdrive"
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Google Drive
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sosmed")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === "sosmed"
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                TikTok / Instagram
              </button>
            </div>

            {/* Isi Panduan */}
            {activeTab === "gmaps" && (
              <div className="space-y-3 text-xs">
                <p className="text-muted-foreground">
                  Dipakai untuk kolom <strong className="text-foreground">Link Google Maps</strong> (UMKM &amp; Lokasi).
                </p>
                <ol className="list-decimal list-inside space-y-2 text-foreground font-medium pl-1">
                  <li>Cari alamat atau tempat lokasi di <strong>Google Maps</strong>.</li>
                  <li>Klik tombol <strong>Bagikan</strong> (Share).</li>
                  <li>Pilih <strong>Salin Link</strong> (Copy link).</li>
                  <li>Paste link ke kolom input form.</li>
                </ol>
                <div className="rounded-lg border border-border bg-muted/50 p-2.5 font-mono text-[11px] text-foreground">
                  <p className="text-muted-foreground font-sans text-[10px] uppercase font-bold mb-1">Contoh link valid:</p>
                  <code>https://maps.app.goo.gl/pNsbhJ2xtcfzi7K97</code>
                </div>
              </div>
            )}

            {activeTab === "youtube" && (
              <div className="space-y-3 text-xs">
                <p className="text-muted-foreground">
                  Dipakai untuk sematan video pada <strong className="text-foreground">Berita &amp; Galeri Media</strong>.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-foreground font-medium pl-1">
                  <li>Buka video yang diinginkan di <strong>YouTube</strong>.</li>
                  <li>Klik tombol <strong>Bagikan</strong> di bawah video.</li>
                  <li>Pilih <strong>Salin link</strong>.</li>
                  <li>Paste link ke kolom URL Video di form.</li>
                </ol>
                <div className="rounded-lg border border-border bg-muted/50 p-2.5 font-mono text-[11px] text-foreground space-y-1">
                  <p className="text-muted-foreground font-sans text-[10px] uppercase font-bold mb-1">Contoh link valid:</p>
                  <p><code>https://youtu.be/dQw4w9WgXcQ</code></p>
                  <p><code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code></p>
                </div>
              </div>
            )}

            {activeTab === "gdrive" && (
              <div className="space-y-3 text-xs">
                <p className="text-muted-foreground">
                  Dipakai untuk tautan dokumen <strong className="text-foreground">PDF / File Google Drive</strong>.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-foreground font-medium pl-1">
                  <li>Klik kanan file di <strong>Google Drive</strong> &gt; pilih <strong>Bagikan</strong>.</li>
                  <li>Ubah akses ke <strong className="text-emerald-700">"Siapa saja yang memiliki link"</strong> (agar bisa dibuka publik tanpa perlu minta izin).</li>
                  <li>Klik <strong>Salin link</strong>.</li>
                  <li>Paste link ke kolom form.</li>
                </ol>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 text-emerald-900 text-[11px]">
                  <strong>Catatan:</strong> Pastikan izin file bukan <em>"Dibatasi"</em> agar warga dapat langsung melihat file.
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-2.5 font-mono text-[11px] text-foreground">
                  <p className="text-muted-foreground font-sans text-[10px] uppercase font-bold mb-1">Contoh link valid:</p>
                  <code>https://drive.google.com/file/d/.../view</code>
                </div>
              </div>
            )}

            {activeTab === "sosmed" && (
              <div className="space-y-3 text-xs">
                <p className="text-muted-foreground">
                  Dipakai untuk tautan postingan publik <strong className="text-foreground">TikTok / Instagram</strong>.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-foreground font-medium pl-1">
                  <li>Buka postingan atau video publik di aplikasi <strong>TikTok</strong> / <strong>Instagram</strong>.</li>
                  <li>Klik ikon <strong>Bagikan</strong> (Panah / Share).</li>
                  <li>Pilih <strong>Salin Tautan</strong> (Copy Link).</li>
                  <li>Paste link ke kolom form.</li>
                </ol>
                <div className="rounded-lg border border-border bg-muted/50 p-2.5 font-mono text-[11px] text-foreground space-y-1">
                  <p className="text-muted-foreground font-sans text-[10px] uppercase font-bold mb-1">Contoh link valid:</p>
                  <p><code>https://vt.tiktok.com/...</code></p>
                  <p><code>https://www.instagram.com/p/...</code></p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


