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
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border max-h-[420px] w-full bg-muted shadow-sm transition-all hover:opacity-95"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt={item.judul}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="rounded-xl bg-card/90 px-4 py-2 text-xs font-bold text-foreground shadow-md backdrop-blur-xs flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <span>Klik untuk perbesar foto</span>
                </span>
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
