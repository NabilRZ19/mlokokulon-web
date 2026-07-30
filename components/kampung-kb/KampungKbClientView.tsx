"use client";

import { useState } from "react";
import Link from "next/link";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
import { Card } from "@/components/ui/Card";
import { Carousel } from "@/components/ui/Carousel";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { getPublicImageUrl } from "@/lib/image-url";
import type { Berita, Galeri, Rw } from "@/lib/types";
import { kampungKbData as kb } from "@/lib/seed-data";

export function KampungKbClientView({
  rw,
  galeriKampungKb,
  beritaKampungKb,
}: {
  rw: Rw | null;
  galeriKampungKb: Galeri[];
  beritaKampungKb: Berita[];
}) {
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  const headlinePhotoUrl = getPublicImageUrl(kb.foto_highlight_url);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      {/* Card Headline & Detail Program */}
      <Card padded={false} className="overflow-hidden">
        <div
          onClick={() => setActiveImage({ url: headlinePhotoUrl, title: `Kampung KB ${kb.nama_program}` })}
          className="relative cursor-pointer overflow-hidden bg-muted group"
          title="Klik untuk melihat foto ukuran utuh"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headlinePhotoUrl}
            alt="Kampung KB"
            className="h-64 w-full object-cover sm:h-80 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6">
          {rw && <p className="text-sm font-semibold text-accent">Lokasi: {rw.nama_rw}</p>}
          <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">
            {kb.nama_program}
          </h2>
          <p className="text-sm text-muted-foreground">Ketua: {kb.ketua}</p>
          <p className="mt-3 text-sm text-foreground">{kb.deskripsi_program}</p>
        </div>
      </Card>

      {/* Carousel Pokja */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Program Kerja per Pokja
        </h2>
        <div className="mt-3">
          <Carousel
            itemsPerSlide={3}
            items={kb.pokja.map((p, index) => (
              <Card key={p.nama} className="flex h-full flex-col">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{p.nama}</h3>
                    <p className="text-xs text-muted-foreground">{p.program.length} program</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  {p.program.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 shrink-0 text-accent">•</span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          />
        </div>
      </div>

      {/* Berita Kampung KB (jika ada) */}
      {beritaKampungKb.length > 0 && (
        <Card>
          <h2 className="font-heading text-lg font-semibold text-foreground">Berita Kampung KB</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beritaKampungKb.map((b) => (
              <Link key={b.id} href={`/berita/${b.slug}`}>
                <div className="h-full overflow-hidden rounded-lg border border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPublicImageUrl(b.gambar_cover_url)}
                    alt={b.judul}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <BeritaBadge kategori={b.kategori} />
                      <span>
                        {new Date(b.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 font-heading font-semibold text-foreground">
                      {b.judul}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Galeri Kegiatan Kampung KB (jika ada) */}
      {galeriKampungKb.length > 0 && (
        <Card>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Galeri Kegiatan
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galeriKampungKb.map((g) => {
              const mediaUrl = getPublicImageUrl(g.url_media);
              return (
                <div key={g.id} className="overflow-hidden rounded-lg border border-border">
                  {g.tipe === "video" ? (
                    <video src={mediaUrl} controls className="h-40 w-full bg-black object-cover" />
                  ) : (
                    <div
                      onClick={() => setActiveImage({ url: mediaUrl, title: g.judul })}
                      className="relative cursor-pointer overflow-hidden bg-black/5 group"
                      title="Klik untuk lihat foto utuh"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl} alt={g.judul} className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-110">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="p-3 text-sm text-foreground">{g.judul}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {rw && (
        <Link
          href={`/wilayah/${rw.id}`}
          className="block rounded-lg border border-border bg-card p-4 text-center text-sm font-semibold text-primary shadow-sm transition-shadow hover:shadow-md"
        >
          Lihat Profil {rw.nama_rw} →
        </Link>
      )}

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!activeImage}
        src={activeImage?.url ?? null}
        title={activeImage?.title}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}
