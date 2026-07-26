"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { Pagination } from "@/components/ui/Pagination";
import { getPublicImageUrl } from "@/lib/image-url";
import type { Galeri } from "@/lib/types";

const PER_PAGE = 9;

export function GaleriList({ galeri }: { galeri: Galeri[] }) {
  const kategoriOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(galeri.map((g) => g.kategori).filter(Boolean)))],
    [galeri],
  );

  const [kategori, setKategori] = useState("Semua");
  const [page, setPage] = useState(1);
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  const filtered = useMemo(
    () => (kategori === "Semua" ? galeri : galeri.filter((g) => g.kategori === kategori)),
    [galeri, kategori],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleKategoriChange(k: string) {
    setKategori(k);
    setPage(1);
  }

  return (
    <div>
      {kategoriOptions.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {kategoriOptions.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleKategoriChange(k as string)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                kategori === k
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {pageItems.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Belum ada foto/video untuk kategori ini.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((g) => {
            const mediaUrl = getPublicImageUrl(g.url_media);
            return (
              <Card key={g.id} padded={false} className="group overflow-hidden">
                {g.tipe === "video" ? (
                  <video src={mediaUrl} controls className="h-44 w-full bg-black object-cover" />
                ) : (
                  <div
                    onClick={() => setActiveImage({ url: mediaUrl, title: g.judul })}
                    className="relative cursor-pointer overflow-hidden bg-black/5"
                    title="Klik untuk melihat foto ukuran asli"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl}
                      alt={g.judul}
                      loading="lazy"
                      decoding="async"
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
                        🔍 Lihat Foto Utuh
                      </span>
                    </div>
                  </div>
                )}
                <p className="p-3.5 text-sm font-medium text-foreground">{g.judul}</p>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

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
