"use client";

import { useState } from "react";
import Link from "next/link";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
import { Card } from "@/components/ui/Card";
import { Carousel } from "@/components/ui/Carousel";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { Reveal } from "@/components/ui/Reveal";
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
      <Reveal mode="scroll" duration={0.6}>
        <Card padded={false} className="overflow-hidden border-emerald-200/60 bg-gradient-to-br from-emerald-50/20 via-card to-card shadow-sm">
          <div className="grid lg:grid-cols-12 gap-0 items-center">
            <div
              onClick={() => setActiveImage({ url: headlinePhotoUrl, title: `Kampung KB ${kb.nama_program}` })}
              className="relative cursor-pointer overflow-hidden bg-muted group lg:col-span-6 h-full min-h-[300px]"
              title="Klik untuk melihat foto ukuran utuh"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headlinePhotoUrl}
                alt="Kampung KB"
                className="h-full w-full object-cover min-h-[320px] transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:col-span-6 space-y-3">
              {rw && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  Pusat Wilayah: {rw.nama_rw}
                </div>
              )}
              <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                Kampung KB {kb.nama_program}
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Ketua Pelaksana: <span className="text-foreground font-extrabold">{kb.ketua}</span>
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed text-justify">
                {kb.deskripsi_program}
              </p>
              <div className="pt-2 border-t border-border/60">
                <p className="text-xs text-muted-foreground font-medium">
                  📜 Ditetapkan berdasarkan SK Kepala Kelurahan Mlokomanis Kulon Tahun {kb.sk_tahun}.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Tujuan / Fungsi Program */}
      <Reveal mode="scroll" duration={0.6}>
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Amanat &amp; Target Utama
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">Tujuan Program Kampung KB</h2>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {kb.fungsi.map((f, i) => (
              <li key={i} className="flex gap-3 text-sm rounded-xl border border-border/80 bg-card p-4 shadow-xs">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="text-foreground font-medium text-justify leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>

      {/* Struktur Kepengurusan Inti */}
      <Reveal mode="scroll" duration={0.6}>
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Pimpinan &amp; Pengelola
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">Struktur Kepengurusan Inti</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kb.pengurus_inti.map((p) => (
              <div
                key={p.jabatan}
                className="rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/30 to-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-xs mb-2">
                  {p.nama.charAt(0)}
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">{p.jabatan}</p>
                <p className="mt-1 text-sm font-extrabold text-foreground">{p.nama}</p>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* Carousel Pokja */}
      <Reveal mode="scroll" duration={0.6}>
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
                  <p className="mt-3 text-xs text-muted-foreground">
                    Ketua: <span className="font-medium text-foreground">{p.ketua}</span> · Anggota:{" "}
                    <span className="font-medium text-foreground">{p.anggota}</span>
                  </p>
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
      </Reveal>

      {/* Berita Kampung KB (jika ada) */}
      {beritaKampungKb.length > 0 && (
        <Reveal mode="scroll" duration={0.6}>
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
        </Reveal>
      )}

      {/* Galeri Kegiatan Kampung KB (jika ada) */}
      {galeriKampungKb.length > 0 && (
        <Reveal mode="scroll" duration={0.6}>
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
        </Reveal>
      )}

      {rw && (
        <Reveal mode="scroll" duration={0.6}>
          <Link
            href={`/wilayah/${rw.id}`}
            className="block rounded-lg border border-border bg-card p-4 text-center text-sm font-semibold text-primary shadow-sm transition-shadow hover:shadow-md"
          >
            Lihat Profil {rw.nama_rw} →
          </Link>
        </Reveal>
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
