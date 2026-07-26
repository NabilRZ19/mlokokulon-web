"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { getPublicImageUrl } from "@/lib/image-url";
import type { Berita } from "@/lib/types";

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground shrink-0">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function BeritaDetailClientView({
  berita,
  tanggal,
}: {
  berita: Berita;
  tanggal: string;
}) {
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);
  const fotoTambahan = berita.foto_tambahan ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/berita"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-semibold"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Kembali ke Daftar Berita
        </Link>
      </div>

      {/* Wadah Artikel Berita */}
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Cover Image dengan Lightbox Click */}
        <div
          onClick={() => setActiveImage({ url: getPublicImageUrl(berita.gambar_cover_url), title: berita.judul })}
          className="relative aspect-video w-full overflow-hidden bg-muted cursor-pointer group"
          title="Klik untuk memperbesar foto"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getPublicImageUrl(berita.gambar_cover_url)}
            alt={berita.judul}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            style={{ maxHeight: "460px" }}
          />
          {/* Sleek Minimalist Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          {/* Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <BeritaBadge kategori={berita.kategori} />

            {berita.cakupan === "rw" && berita.rw_nama && (
              <Badge variant="accent">{berita.rw_nama}</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl font-extrabold leading-snug text-foreground sm:text-3xl lg:text-4xl">
            {berita.kategori === "pengumuman" &&
            !berita.judul.toLowerCase().startsWith("pengumuman") ? (
              <>
                <span className="text-red-600 font-extrabold mr-2">[PENGUMUMAN]</span>
                {berita.judul}
              </>
            ) : (
              berita.judul
            )}
          </h1>

          {/* Meta Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-6 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconUser />
              Penulis: <strong className="text-foreground">{berita.penulis}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendar />
              {tanggal}
            </span>
          </div>

          {/* Article Text Content */}
          <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground">
            {berita.isi}
          </div>

          {/* Documentation Photos dengan Lightbox Click */}
          {fotoTambahan.length > 0 && (
            <div className="mt-10 border-t border-border pt-8">
              <h2 className="mb-4 font-heading text-xs font-bold uppercase tracking-widest text-primary">
                Dokumentasi Kegiatan
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {fotoTambahan.map((rawUrl, i) => {
                  const url = getPublicImageUrl(rawUrl);
                  return (
                    <div
                      key={i}
                      onClick={() => setActiveImage({ url, title: `Dokumentasi ${i + 1} — ${berita.judul}` })}
                      className="relative cursor-pointer overflow-hidden rounded-xl border border-border bg-black/5 group"
                      title="Klik untuk memperbesar foto"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Dokumentasi ${i + 1}`}
                        className="aspect-video w-full object-cover transition-all duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Article Footer */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              ← Kembali ke Berita Lainnya
            </Link>
            <span className="font-medium text-muted-foreground">Kelurahan Mlokomanis Kulon</span>
          </div>
        </div>
      </article>

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
