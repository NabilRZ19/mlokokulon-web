"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import type { Rw, StrukturKelurahan } from "@/lib/types";

function OrgCard({
  person,
  isHead = false,
  onImageClick,
}: {
  person: StrukturKelurahan;
  isHead?: boolean;
  onImageClick: (url: string, title: string) => void;
}) {
  return (
    <div className="flex w-48 flex-col items-center rounded-xl border border-border bg-card px-4 py-5 text-center sm:w-56 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
      <div
        onClick={() => onImageClick(person.foto_url, `${person.nama} — ${person.jabatan}`)}
        className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-1.5 cursor-pointer transition-transform hover:scale-105 ${
          isHead ? "h-32 w-32 sm:h-36 sm:w-36" : "h-28 w-28 sm:h-32 sm:w-32"
        }`}
        title="Klik untuk lihat foto utuh"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={person.foto_url}
          alt={person.nama}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full rounded-lg object-contain"
        />
      </div>
      <p className="mt-3.5 font-heading font-bold text-foreground line-clamp-2">{person.nama}</p>
      <p className="text-xs font-semibold text-primary mt-1">{person.jabatan}</p>
    </div>
  );
}

export function StrukturClientView({
  struktur,
  rwList,
}: {
  struktur: StrukturKelurahan[];
  rwList: Rw[];
}) {
  const [lurah, ...perangkatStaff] = struktur;
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  return (
    <div className="space-y-8">
      {/* ── 1. Wrapper Card Tingkat 1 & 2: Perangkat Desa / Kelurahan ────── */}
      <Card className="p-6 sm:p-8 space-y-8">
        <div className="border-b border-border pb-4 text-center sm:text-left space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Tingkat Kelurahan
          </span>
          <h2 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
            Perangkat Desa / Kelurahan
          </h2>
          <p className="text-xs text-muted-foreground">
            Pimpinan dan kepala seksi pelayanan di Kantor Kelurahan Mlokomanis Kulon. Klik foto pejabat untuk melihat ukuran utuh.
          </p>
        </div>

        {struktur.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Data belum tersedia.</p>
        ) : (
          <div className="flex flex-col items-center gap-8">
            {/* Lurah (Pimpinan Utama) */}
            {lurah && (
              <OrgCard
                person={lurah}
                isHead
                onImageClick={(url, title) => setActiveImage({ url, title })}
              />
            )}

            {/* Perangkat / Seksi */}
            {perangkatStaff.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {perangkatStaff.map((s) => (
                  <OrgCard
                    key={s.id}
                    person={s}
                    onImageClick={(url, title) => setActiveImage({ url, title })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── 2. Wrapper Card Tingkat 3: Kelembagaan Wilayah (Kepala RW) ──── */}
      <Card className="p-6 sm:p-8 space-y-8">
        <div className="border-b border-border pb-4 text-center sm:text-left space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Kelembagaan Wilayah
          </span>
          <h2 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
            Kepala Rukun Warga (RW)
          </h2>
          <p className="text-xs text-muted-foreground">
            Ketua kelembagaan RW yang memimpin di 10 Dusun wilayah Kelurahan Mlokomanis Kulon.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {rwList.map((rw) => {
            const ketuaRw = rw.struktur_pengurus?.find(
              (p) =>
                p.jabatan.toLowerCase().includes("ketua rw") ||
                p.jabatan.toLowerCase().includes("ketua")
            );

            return (
              <div
                key={rw.id}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-bold text-primary mb-2">
                  {rw.nama_rw.split("—")[0].trim()}
                </div>
                <p className="font-heading text-sm font-bold text-foreground line-clamp-1">
                  {ketuaRw ? ketuaRw.nama : "(Ketua RW)"}
                </p>
                <p className="text-[11px] font-semibold text-primary mt-0.5">
                  Ketua {rw.nama_rw.split("—")[0].trim()}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Dusun {rw.cakupan_dusun}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

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
