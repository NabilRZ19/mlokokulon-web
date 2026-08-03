export const KATEGORI_LABEL: Record<string, string> = {
  berita: "Berita",
  pengumuman: "Pengumuman",
  kegiatan: "Kegiatan",
  pembangunan: "Pembangunan",
  "kampung-kb": "Kampung KB",
};

export function BeritaBadge({ kategori }: { kategori: string }) {
  const kat = (kategori || "berita").toLowerCase();

  if (kat === "pengumuman") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold text-red-700 border border-red-200 shadow-2xs">
        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
        Pengumuman
      </span>
    );
  }

  if (kat === "pembangunan") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
        Pembangunan
      </span>
    );
  }

  if (kat === "kegiatan") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
        Kegiatan
      </span>
    );
  }

  if (kat === "kampung-kb") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300 shadow-2xs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-emerald-700">
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-5a3 3 0 0 0-6 0v5H4a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
        Kampung KB
      </span>
    );
  }

  // Kategori "berita" / Default
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary border border-primary/20">
      {KATEGORI_LABEL[kat] ?? kategori}
    </span>
  );
}
