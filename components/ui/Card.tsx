import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  // false untuk card berisi gambar full-bleed (mis. cover berita) — jangan andalkan
  // override "p-0" via className, dua utility padding beda nilai tidak reliable saling timpa.
  padded?: boolean;
}

export function Card({ children, className = "", padded = true }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md ${
        padded ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
