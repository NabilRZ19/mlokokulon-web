"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarIcon, TargetIcon } from "@/components/admin/icons";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { getPublicImageUrl } from "@/lib/image-url";
import type { PengumumanItem } from "@/lib/types";

export function PengumumanDetailView({ item }: { item: PengumumanItem }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const coverUrl = item.gambar_cover_url ? getPublicImageUrl(item.gambar_cover_url) : null;

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 space-y-8">
        <Link
          href="/pengumuman"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
        >
          ← Kembali ke Pengumuman
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-md space-y-6">
          <div className="space-y-4 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                <TargetIcon className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>Kepada: {item.target_pengumuman}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>Tanggal: {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
              {item.judul}
            </h1>

            <p className="text-xs text-muted-foreground font-medium">
              Diterbitkan oleh: <strong className="text-foreground">{item.penulis}</strong>
            </p>
          </div>

          {coverUrl && (
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted cursor-pointer group"
              title="Klik untuk memperbesar foto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt={item.judul}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                style={{ maxHeight: "460px" }}
              />
              {/* Sleek Minimalist Hover Overlay (Samakan dengan Berita) */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="prose prose-sm sm:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-sans">
            {item.isi}
          </div>
        </div>
      </div>

      <ImageLightboxModal
        isOpen={lightboxOpen}
        src={coverUrl}
        alt={item.judul}
        title={item.judul}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
