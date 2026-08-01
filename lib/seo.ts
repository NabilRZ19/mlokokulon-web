import type { Metadata } from "next";

// Domain final belum diputuskan (kandidat .com/.my.id, lihat CLAUDE.md) — pakai env var
// placeholder yang tinggal di-swap sekali begitu domain live.
export const SITE_NAME = "Kelurahan Mlokomanis Kulon";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mlokomanis-kulon.vercel.app";

const DEFAULT_OG_IMAGE = "/images/logo-wonogiri.png";

// JSON-LD (beda dari Metadata.openGraph) tidak di-resolve otomatis lewat metadataBase oleh
// Next.js — path relatif harus dijadikan absolute URL manual biar valid buat Google/crawler.
export function absoluteUrl(path: string): string {
  return path.startsWith("/") ? `${SITE_URL}${path}` : path;
}

// Next.js TIDAK deep-merge object `openGraph` antar layout/page — begitu sebuah halaman
// mendefinisikan openGraph sendiri, field dari layout induk (images/siteName/locale/type) hilang
// kecuali diulang lagi di situ. Helper ini memastikan tiap halaman selalu lengkap tanpa perlu
// mengulang boilerplate itu manual di 14 tempat.
export function pageOpenGraph({
  title,
  description,
  url,
  type = "website",
  images,
  publishedTime,
}: {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article";
  images?: string[];
  publishedTime?: string;
}): Metadata["openGraph"] {
  return {
    type,
    locale: "id_ID",
    siteName: SITE_NAME,
    title,
    description,
    url,
    images: (images && images.length > 0 ? images : [DEFAULT_OG_IMAGE]).map((src) => ({ url: src })),
    ...(type === "article" && publishedTime ? { publishedTime } : {}),
  } as Metadata["openGraph"];
}
