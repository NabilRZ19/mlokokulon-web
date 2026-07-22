export const KATEGORI_LABEL: Record<string, string> = {
  berita: "Berita",
  pengumuman: "Pengumuman",
  kegiatan: "Kegiatan",
  pembangunan: "Pembangunan",
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

  // Kategori "berita" / Default
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary border border-primary/20">
      {KATEGORI_LABEL[kat] ?? kategori}
    </span>
  );
}
