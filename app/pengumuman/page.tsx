import type { Metadata } from "next";
import Link from "next/link";
import { getPublicImageUrl } from "@/lib/image-url";
import { getPengumumanList } from "@/lib/queries";
import { SITE_NAME } from "@/lib/seo";
import { PengumumanList } from "@/components/pengumuman/PengumumanList";

export const metadata: Metadata = {
  title: `Pengumuman Resmi | ${SITE_NAME}`,
  description: "Pengumuman resmi dan informasi penting Kelurahan Mlokomanis Kulon untuk seluruh warga dan lembaga masyarakat.",
};

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDateComponents(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: "15", month: "AGU", year: "2026" };
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
  const year = d.getFullYear().toString();
  return { day, month, year };
}

export default async function PengumumanPage() {
  const pengumumanList = await getPengumumanList(true);

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 space-y-10">
        {/* Header Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <span>Informasi Resmi Kelurahan</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Pengumuman Kelurahan
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Daftar pengumuman dan himbauan penting dari Pemerintah Kelurahan Mlokomanis Kulon untuk masyarakat umum, pengurus RT/RW, serta kelembagaan warga.
          </p>
        </div>

        {/* Pengumuman List Section */}
        <PengumumanList list={pengumumanList} />
      </div>
    </div>
  );
}
