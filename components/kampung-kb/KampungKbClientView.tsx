"use client";

import { useState } from "react";
import Link from "next/link";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
import { Card } from "@/components/ui/Card";
import { Carousel } from "@/components/ui/Carousel";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { Reveal } from "@/components/ui/Reveal";
import { KampungKbIcon } from "@/components/ui/icons";
import { getPublicImageUrl } from "@/lib/image-url";
import type { Berita, Galeri, KampungKb, Rw } from "@/lib/types";
import { kampungKbData as fallbackKb } from "@/lib/seed-data";

export function KampungKbClientView({
  rw,
  galeriKampungKb,
  beritaKampungKb,
  kbData,
}: {
  rw: Rw | null;
  galeriKampungKb: Galeri[];
  beritaKampungKb: Berita[];
  kbData?: KampungKb;
}) {
  const kb = kbData || fallbackKb;
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  const headlinePhotoUrl = getPublicImageUrl(kb.foto_highlight_url);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      {/* 1. Card Headline & Detail Program */}
      <Reveal mode="scroll" duration={0.6}>
        <Card padded={false} className="overflow-hidden border-emerald-200/80 bg-gradient-to-br from-card via-emerald-50/20 to-card shadow-sm">
          <div className="grid lg:grid-cols-12 gap-0 items-stretch">
            <div
              onClick={() => setActiveImage({ url: headlinePhotoUrl, title: `Kampung KB ${kb.nama_program}` })}
              className="relative cursor-pointer overflow-hidden bg-muted group lg:col-span-6 min-h-[320px]"
              title="Klik untuk melihat foto ukuran utuh"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headlinePhotoUrl}
                alt="Kampung KB"
                className="h-full w-full object-cover min-h-[340px] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:col-span-6 space-y-4 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-2xs self-start">
                <KampungKbIcon className="h-3.5 w-3.5 text-emerald-700 fill-emerald-700/20" />
                Percontohan: RW 05 Pencil
              </div>

              <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl leading-tight">
                Kampung KB {kb.nama_program}
              </h2>

              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Ketua Pelaksana: <span className="text-foreground font-extrabold">{kb.ketua}</span>
              </p>

              <p className="text-sm text-foreground/90 leading-relaxed text-justify">
                {kb.deskripsi_program}
              </p>

              <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-600 shrink-0">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                </svg>
                <span>Ditetapkan berdasarkan SK Kepala Kelurahan Mlokomanis Kulon Tahun {kb.sk_tahun}</span>
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* 2. Tujuan / Fungsi Program (Variasi Background Soft Emerald Slate Grid) */}
      <Reveal mode="scroll" duration={0.6}>
        <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-b from-emerald-50/30 via-card to-emerald-50/10 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border/80 pb-4 mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

          <div className="grid gap-4 sm:grid-cols-2">
            {kb.fungsi.map((f, i) => {
              const colonIndex = f.indexOf(":");
              const title = colonIndex !== -1 ? f.slice(0, colonIndex) : "";
              const desc = colonIndex !== -1 ? f.slice(colonIndex + 1) : f;

              return (
                <div
                  key={i}
                  className="group relative flex gap-4 rounded-xl border border-border/80 bg-card p-5 shadow-2xs transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-heading text-xs font-extrabold text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    0{i + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm leading-relaxed text-justify">
                      {title ? (
                        <>
                          <span className="font-extrabold text-foreground">{title}:</span>{" "}
                          <span className="font-normal text-muted-foreground">{desc}</span>
                        </>
                      ) : (
                        <span className="font-normal text-foreground">{f}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* 3. Struktur Kepengurusan Inti (Variasi Background Mint Gradient, Tanpa Lingkaran Avatar) */}
      <Reveal mode="scroll" duration={0.6}>
        <div className="rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-900/5 via-card to-emerald-950/5 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border/80 pb-4 mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                className="rounded-xl border border-emerald-200/80 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-md"
              >
                <span className="block font-extrabold text-xs uppercase tracking-wider text-emerald-800 border-b border-emerald-200/60 pb-1.5">
                  {p.jabatan}
                </span>
                <span className="block font-extrabold text-base text-foreground mt-2">
                  {p.nama}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 4. Carousel Pokja (Variasi Background Soft Teal Accent) */}
      <Reveal mode="scroll" duration={0.6}>
        <div className="rounded-2xl border border-emerald-300/30 bg-gradient-to-r from-emerald-50/20 via-card to-teal-50/20 p-6 sm:p-8 shadow-xs">
          <div className="mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
              Kelompok Kerja
            </span>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Program Kerja per Pokja
            </h2>
          </div>
          <div className="mt-4">
            <Carousel
              itemsPerSlide={3}
              items={kb.pokja.map((p, index) => (
                <Card key={p.nama} className="flex h-full flex-col border-emerald-200/50 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 font-heading text-xs font-extrabold text-white shadow-2xs">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-foreground">{p.nama}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{p.program.length} program utama</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Ketua: <span className="font-semibold text-foreground">{p.ketua}</span> · Anggota:{" "}
                    <span className="font-semibold text-foreground">{p.anggota}</span>
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                    {p.program.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-0.5 shrink-0 text-emerald-600 font-bold">•</span>
                        <span className="text-foreground text-xs leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            />
          </div>
        </div>
      </Reveal>

      {/* 5. Berita Terkait Kampung KB (jika ada) */}
      {beritaKampungKb.length > 0 && (
        <Reveal mode="scroll" duration={0.6}>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Kabar &amp; Publikasi
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Berita &amp; Informasi Terkait Kampung KB
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {beritaKampungKb.map((b) => (
                <Link key={b.id} href={`/berita/${b.slug}`}>
                  <div className="h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPublicImageUrl(b.gambar_cover_url)}
                      alt={b.judul}
                      loading="lazy"
                      decoding="async"
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <BeritaBadge kategori={b.kategori} />
                        <span>
                          {new Date(b.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="line-clamp-2 font-heading font-bold text-foreground text-sm">
                        {b.judul}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* 6. Galeri Kegiatan Terkait Kampung KB (jika ada) */}
      {galeriKampungKb.length > 0 && (
        <Reveal mode="scroll" duration={0.6}>
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/20 p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Dokumentasi Lapangan
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Galeri &amp; Dokumentasi Kegiatan Terkait Kampung KB
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galeriKampungKb.map((g) => {
                const mediaUrl = getPublicImageUrl(g.url_media);
                return (
                  <div key={g.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
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
                    <p className="p-3 text-xs font-semibold text-foreground">{g.judul}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}

      {/* 7. Tombol CTA Profil RW 05 Pencil */}
      {rw && (
        <Reveal mode="scroll" duration={0.6}>
          <Link
            href={`/wilayah/${rw.id}`}
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 sm:p-6 text-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.005]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
                  Wilayah Percontohan
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Lihat Profil Lengkap {rw.nama_rw}
                </h3>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white font-bold transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-emerald-800">
              →
            </div>
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
