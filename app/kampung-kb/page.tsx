import type { Metadata } from "next";
import Link from "next/link";
import { KampungKbClientView } from "@/components/kampung-kb/KampungKbClientView";
import { getBeritaList, getGaleriList, getRwById } from "@/lib/queries";
import { kampungKbData as kb } from "@/lib/seed-data";
import { pageOpenGraph } from "@/lib/seo";

const description =
  "Penyelenggaraan Kampung Keluarga Berkualitas (Kampung KB) Guyub Hanyawiji Kelurahan Mlokomanis Kulon: wadah konvergensi pemberdayaan keluarga, data kependudukan (iBangga), pencegahan stunting, serta kesehatan & ekonomi keluarga sejahtera sesuai Inpres No. 3 Tahun 2022 BKKBN RI.";

export const metadata: Metadata = {
  title: "Kampung KB",
  description,
  alternates: { canonical: "/kampung-kb" },
  openGraph: pageOpenGraph({ title: "Kampung KB", description, url: "/kampung-kb" }),
};

export const dynamic = "force-dynamic";

function IconHeart() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-emerald-300 fill-emerald-300/20"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export default async function KampungKbPage() {
  const [rw, galeriList, beritaList] = await Promise.all([
    getRwById(kb.rw_ref),
    getGaleriList(),
    getBeritaList(),
  ]);
  const galeriKampungKb = galeriList.filter((g) => g.kategori === "kampung-kb");
  const beritaKampungKb = beritaList.filter((b) => b.kategori === "kampung-kb");

  return (
    <div>
      {/* ── Hero Section (Tema Hijau Dark Emerald Signature) ─────────────── */}
      <div className="relative overflow-hidden border-b border-emerald-900/30 bg-gradient-to-br from-[#022c22] via-[#065f46] to-[#0f172a] py-14 sm:py-20 text-white">
        {/* Ambient Emerald Radial Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            {/* Eyebrow Badge Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md shadow-sm">
              <IconHeart />
              <span>Inpres No. 3 Tahun 2022 · BKKBN RI</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Kampung KB &ldquo;{kb.nama_program}&rdquo;
            </h1>

            {/* Subtitle / Description */}
            <p className="font-sans text-base text-emerald-100/90 sm:text-lg leading-relaxed max-w-2xl text-justify">
              Wadah konvergensi dan integrasi pemberdayaan keluarga dalam seluruh dimensinya—berdasarkan Instruksi Presiden No. 3 Tahun 2022 dan BKKBN RI guna meningkatkan kualitas SDM, ketahanan keluarga, serta lingkungan pemukiman sehat di Kelurahan Mlokomanis Kulon.
            </p>
          </div>
        </div>
      </div>

      {/* ── Konten Utama ───────────────────────────────────────── */}
      <KampungKbClientView rw={rw} galeriKampungKb={galeriKampungKb} beritaKampungKb={beritaKampungKb} />
    </div>
  );
}
