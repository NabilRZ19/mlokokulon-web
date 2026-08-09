"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { Reveal } from "@/components/ui/Reveal";
import { getPublicImageUrl } from "@/lib/image-url";
import type { Rw, StrukturKelurahan } from "@/lib/types";

type OrgTheme = "accent" | "primary";

function OrgCard({
  person,
  number,
  theme,
  isHead = false,
  onImageClick,
}: {
  person: StrukturKelurahan;
  number: number;
  theme: OrgTheme;
  isHead?: boolean;
  onImageClick: (url: string, title: string) => void;
}) {
  const fotoUrl = getPublicImageUrl(person.foto_url);
  const badgeBg = theme === "accent" ? "bg-accent" : "bg-primary";
  const border = theme === "accent" ? "border-accent/30 hover:border-accent" : "border-primary/30 hover:border-primary";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-card text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${border} ${
        isHead ? "w-40 sm:w-48" : "w-32 sm:w-40"
      }`}
    >
      <div className={`px-2 py-1.5 text-[10px] font-bold uppercase leading-tight tracking-wide text-white sm:text-xs ${badgeBg}`}>
        {number}. {person.jabatan}
      </div>
      <div className="flex flex-col items-center px-2 py-3">
        <div
          onClick={() => onImageClick(fotoUrl, `${person.nama} — ${person.jabatan}`)}
          className={`relative flex items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-1 cursor-pointer transition-transform hover:scale-105 group ${border} ${
            isHead ? "h-24 w-24 sm:h-28 sm:w-28" : "h-20 w-20 sm:h-24 sm:w-24"
          }`}
          title="Klik untuk memperbesar foto"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoUrl}
            alt={person.nama}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md transition-transform duration-200 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </div>
        </div>
        <p className="mt-2 font-heading text-xs font-bold text-foreground line-clamp-2 sm:text-sm">{person.nama}</p>
      </div>
    </div>
  );
}

/** Node dalam pohon struktur organisasi — connector garis digambar berdasarkan jumlah children. */
type OrgNode = {
  key: string;
  card: ReactNode;
  children?: OrgNode[];
};

/** Merender satu node beserta garis penghubung ke anak-anaknya (pola "pure-CSS org chart tree"). */
function OrgBranch({ node }: { node: OrgNode }) {
  const children = node.children ?? [];
  return (
    <div className="flex flex-col items-center">
      {node.card}
      {children.length > 0 && (
        <Fragment>
          <div className="h-6 w-px bg-border" />
          <div className="flex justify-center">
            {children.map((child, i) => (
              <div key={child.key} className="relative flex flex-col items-center px-5 pt-6">
                {i > 0 && <div className="absolute left-0 top-0 h-px w-1/2 bg-border" />}
                {i < children.length - 1 && <div className="absolute right-0 top-0 h-px w-1/2 bg-border" />}
                <div className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-border" />
                <OrgBranch node={child} />
              </div>
            ))}
          </div>
        </Fragment>
      )}
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
  const [lurah, ...rest] = struktur;
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);
  const openImage = (url: string, title: string) => setActiveImage({ url, title });

  // Susun rest (Sekretaris/Kasi/Staf) jadi pohon: Sekretaris menaungi Staf, sisanya (Kasi dkk)
  // langsung di bawah Lurah — mengikuti pola struktur kelurahan standar (bukan field DB terpisah,
  // karena admin_users/struktur_kelurahan belum punya kolom parent-child).
  const nomor = new Map(struktur.map((p, i) => [p.id, i + 1]));
  const sekretaris = rest.find((p) => p.jabatan.toLowerCase().includes("sekretaris"));
  const staf = rest.filter((p) => p.jabatan.toLowerCase().includes("staf"));
  const lainnya = rest.filter((p) => p.id !== sekretaris?.id && !staf.some((s) => s.id === p.id));

  const stafNodes: OrgNode[] = staf.map((s) => ({
    key: s.id,
    card: <OrgCard person={s} number={nomor.get(s.id)!} theme="primary" onImageClick={openImage} />,
  }));

  const anakLurah: OrgNode[] = [
    ...lainnya.map((k) => ({
      key: k.id,
      card: <OrgCard person={k} number={nomor.get(k.id)!} theme="accent" onImageClick={openImage} />,
    })),
    ...(sekretaris
      ? [
          {
            key: sekretaris.id,
            card: (
              <OrgCard person={sekretaris} number={nomor.get(sekretaris.id)!} theme="primary" onImageClick={openImage} />
            ),
            children: stafNodes,
          },
        ]
      : stafNodes),
  ];

  const rootNode: OrgNode | null = lurah
    ? {
        key: lurah.id,
        card: <OrgCard person={lurah} number={1} theme="accent" isHead onImageClick={openImage} />,
        children: anakLurah,
      }
    : null;

  return (
    <div className="space-y-8">
      {/* ── 1. Wrapper Card Tingkat 1 & 2: Perangkat Kelurahan ────── */}
      <Reveal mode="scroll" duration={0.6}>
        <Card className="p-6 sm:p-8 space-y-8">
          <div className="border-b border-border pb-4 text-center sm:text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Tingkat Kelurahan
            </span>
            <h2 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
              Perangkat Kelurahan
            </h2>
            <p className="text-xs text-muted-foreground">
              Pimpinan dan kepala seksi pelayanan di Kantor Kelurahan Mlokomanis Kulon. Klik foto pejabat untuk melihat ukuran utuh.
            </p>
          </div>

          {struktur.length === 0 || !rootNode ? (
            <p className="text-center text-sm text-muted-foreground">Data belum tersedia.</p>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max justify-center px-4">
                <OrgBranch node={rootNode} />
              </div>
            </div>
          )}
        </Card>
      </Reveal>

      {/* ── 2. Wrapper Card Tingkat 3: Kelembagaan Wilayah (Kepala RW) ──── */}
      <Reveal mode="scroll" duration={0.6}>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {rwList.map((rw) => {
              // Ambil kode RW & Dusun dengan aman dari "RW 01 - Bulurejo"
              const parts = rw.nama_rw.split("-").map((s) => s.trim());
              const rwCode = parts[0] || rw.nama_rw;
              const dusunName = parts[1] || rw.cakupan_dusun;
              // Gunakan kolom rw.ketua_nama & rw.ketua_foto_url langsung — sinkron dengan approval
              const ketuaNamaRw = rw.ketua_nama || null;
              const fotoUrl = rw.ketua_foto_url ? getPublicImageUrl(rw.ketua_foto_url) : null;

              return (
                <div
                  key={rw.id}
                  className="flex flex-col items-center justify-between rounded-xl border border-border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md space-y-3"
                >
                  <div className="flex w-full items-center justify-between border-b border-border/50 pb-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-extrabold text-primary">
                      {rwCode}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Dusun {dusunName}
                    </span>
                  </div>

                  {/* Foto Pejabat RW / Avatar Placeholder */}
                  <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary/30 bg-muted/50 p-1 shadow-2xs">
                    {fotoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={fotoUrl}
                        alt={ketuaNamaRw || rwCode}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground/70">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-primary/40">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-1">
                    <p className="font-heading text-sm font-extrabold text-foreground line-clamp-2 leading-tight">
                      {ketuaNamaRw || "Data belum diberikan oleh pihak terkait"}
                    </p>
                    <p className="text-[11px] font-bold text-primary">
                      Ketua {rwCode}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Reveal>

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
