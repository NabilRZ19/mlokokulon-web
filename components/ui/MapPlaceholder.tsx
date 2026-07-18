import { MapPinIcon } from "./icons";

// Dipakai di semua halaman yang butuh peta sebelum data GeoJSON tersedia (PRD Fase 4,
// "nice-to-have"): /wilayah, /wilayah/[rwId], dan nanti peta fixed di beranda.
export function MapPlaceholder({ label = "Peta interaktif segera hadir." }: { label?: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted text-center">
      <MapPinIcon className="h-8 w-8 text-muted-foreground" />
      <p className="max-w-xs text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
