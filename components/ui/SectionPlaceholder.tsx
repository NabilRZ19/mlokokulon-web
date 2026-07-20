import type { ComponentType, SVGProps } from "react";

interface SectionPlaceholderProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  title?: string;
  variant?: "default" | "accent";
  // true buat kotak selebar-tinggi rasio 16:9 (dipakai peta) — false buat kotak vertikal
  // biasa dengan padding (dipakai teaser/carousel). Dipilih lewat prop, BUKAN className
  // override, supaya tidak ada dua utility ukuran beda nilai yang saling tabrak (lihat
  // catatan bug serupa di Card.tsx prop `padded`).
  aspectVideo?: boolean;
}

// Dashed-box generic buat semua bagian yang belum dibangun (peta, teaser Kampung KB, carousel
// Berita/Galeri di beranda, dst) — satu implementasi dipakai ulang lewat MapPlaceholder.tsx dkk,
// bukan bikin dashed-box baru tiap butuh placeholder.
export function SectionPlaceholder({
  icon: Icon,
  label,
  title,
  variant = "default",
  aspectVideo = false,
}: SectionPlaceholderProps) {
  return (
    <div>
      {title && (
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      )}
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center ${
          aspectVideo ? "aspect-video w-full" : "py-16"
        } ${variant === "accent" ? "border-accent/30 bg-accent/5" : "border-border bg-muted"}`}
      >
        <Icon
          className={`h-8 w-8 ${variant === "accent" ? "text-accent" : "text-muted-foreground"}`}
        />
        <p className="max-w-sm text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
