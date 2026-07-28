import type { Metadata } from "next";
import Link from "next/link";
import { KampungKbClientView } from "@/components/kampung-kb/KampungKbClientView";
import { getGaleriList, getRwById } from "@/lib/queries";
import { kampungKbData as kb } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Kampung KB — Kelurahan Mlokomanis Kulon",
};

export const revalidate = 3600;

function IconSprout() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-emerald-300"
    >
      <path d="M7 20h10" />
      <path d="M12 20v-8" />
      <path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7Z" />
    </svg>
  );
}

export default async function KampungKbPage() {
  const [rw, galeriList] = await Promise.all([getRwById(kb.rw_ref), getGaleriList()]);
  const galeriKampungKb = galeriList.filter((g) => g.kategori === "kampung-kb");

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
              <IconSprout />
              <span>Program Unggulan Kelurahan</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Kampung KB &ldquo;{kb.nama_program}&rdquo;
            </h1>

            {/* Subtitle / Description */}
            <p className="font-sans text-base text-emerald-100/90 sm:text-lg leading-relaxed max-w-2xl">
              Program unggulan Kampung Keluarga Berkualitas di RW 05 Dusun Pencil, diketuai oleh {kb.ketua}, untuk membina potensi, kesehatan, dan kesejahteraan warga desa.
            </p>
          </div>
        </div>
      </div>

      {/* ── Konten Utama ───────────────────────────────────────── */}
      <KampungKbClientView rw={rw} galeriKampungKb={galeriKampungKb} />
    </div>
  );
}
