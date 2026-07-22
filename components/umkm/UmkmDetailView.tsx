"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Umkm } from "@/lib/types";

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-primary">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-primary">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-primary">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.419h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-accent">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary shrink-0">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2" />
      <path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" />
    </svg>
  );
}

export function UmkmDetailView({ umkm }: { umkm: Umkm }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = umkm.foto_urls.length > 0 ? umkm.foto_urls : ["/images/placeholder.jpg"];
  const currentImage = images[activeImageIndex] || images[0];

  const cleanPhone = umkm.kontak.replace(/\D/g, "");
  const waUrl = cleanPhone.startsWith("62")
    ? `https://wa.me/${cleanPhone}`
    : cleanPhone.startsWith("0")
    ? `https://wa.me/62${cleanPhone.slice(1)}`
    : `https://wa.me/${cleanPhone}`;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── Breadcrumb Header ────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/umkm"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Kembali ke Katalog UMKM
          </Link>
          <Badge>{umkm.kategori}</Badge>
        </div>

        {/* ── Grid Showcase (2 Kolom: Kiri Foto & Deskripsi, Kanan Sticky Sidebar) ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ── Kolom Kiri: Galeri Foto, Deskripsi, & Produk Unggulan (Col 7 / 8) ─ */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            {/* Gallery Card */}
            <div className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage}
                  alt={umkm.nama}
                  className="h-full w-full object-cover transition-all duration-300"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative aspect-video w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                        activeImageIndex === i
                          ? "border-primary ring-2 ring-primary/20 scale-105"
                          : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Card 1: Tentang Usaha */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconStore />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Tentang {umkm.nama}
                  </h2>
                  <p className="text-xs text-muted-foreground">Profil Singkat &amp; Deskripsi Usaha</p>
                </div>
              </div>

              <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {umkm.deskripsi}
              </div>
            </div>

            {/* Card 2: Produk & Layanan Unggulan (Tampilan Bersih & Terpisah) */}
            {umkm.produk_unggulan.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <h3 className="font-heading text-base font-bold text-foreground">
                  Produk &amp; Layanan Unggulan
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Daftar produk dan layanan yang ditawarkan oleh {umkm.nama}
                </p>

                <ul className="mt-4 space-y-2.5 text-sm text-foreground">
                  {umkm.produk_unggulan.map((produk, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15">
                        <IconCheck />
                      </div>
                      <span className="font-semibold text-foreground">{produk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Kolom Kanan: Sticky Information Card (Col 5 / 4) ───────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-6 space-y-6">
              <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                {/* Header Toko */}
                <div className="border-b border-border pb-4">
                  <Badge>{umkm.kategori}</Badge>
                  <h1 className="mt-2.5 font-heading text-2xl font-bold text-foreground">
                    {umkm.nama}
                  </h1>
                </div>

                {/* Info List */}
                <div className="space-y-4 py-5 text-sm">
                  <div className="flex items-start gap-3">
                    <IconClock />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Jam Operasional</p>
                      <p className="font-semibold text-foreground">{umkm.jam_operasional}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconPhone />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Nomor Telepon / WhatsApp</p>
                      <p className="font-semibold text-foreground">{umkm.kontak}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconMapPin />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Wilayah Kelurahan</p>
                      <p className="font-semibold text-foreground">Kelurahan Mlokomanis Kulon</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 border-t border-border pt-5">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
                  >
                    <IconWhatsapp />
                    Hubungi via WhatsApp
                  </a>

                  {umkm.link_gmaps && (
                    <a
                      href={umkm.link_gmaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <IconExternalLink />
                      Petunjuk Lokasi (Google Maps)
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
