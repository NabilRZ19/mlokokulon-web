import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent";
}

// variant "accent" dipakai khusus untuk highlight Kampung KB (PRD Bagian 6.4 & 8:
// harus menonjol/beda warna dari elemen lain).
export function Badge({ children, variant = "default" }: BadgeProps) {
  const styles =
    variant === "accent"
      ? "bg-accent text-accent-foreground border-accent"
      : "bg-muted text-muted-foreground border-border";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {children}
    </span>
  );
}
