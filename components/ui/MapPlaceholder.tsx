import { MapPinIcon } from "./icons";
import { SectionPlaceholder } from "./SectionPlaceholder";

// Dipakai di semua halaman yang butuh peta sebelum data GeoJSON tersedia (PRD Fase 4,
// "nice-to-have"): /wilayah, /wilayah/[rwId], dan nanti peta fixed di beranda.
export function MapPlaceholder({
  title,
  label = "Peta interaktif segera hadir.",
}: {
  title?: string;
  label?: string;
}) {
  return <SectionPlaceholder icon={MapPinIcon} label={label} title={title} aspectVideo />;
}
