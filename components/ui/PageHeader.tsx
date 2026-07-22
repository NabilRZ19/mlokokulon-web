import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  // "badge" opsional untuk label kategorial/eyebrow tag di atas judul utama
  badge?: string;
  // "accent" dipakai khusus halaman Kampung KB — wajib menonjol/beda warna (PRD Bagian 6.4 & 8).
  variant?: "primary" | "accent";
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  variant = "primary",
  children,
}: PageHeaderProps) {
  const isAccent = variant === "accent";

  const gradientBg = isAccent
    ? "bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#064e3b]"
    : "bg-gradient-to-br from-[#0f172a] via-primary to-[#1e3a8a]";

  const glowColorLeft = isAccent ? "bg-primary/20" : "bg-secondary/20";
  const glowColorRight = isAccent ? "bg-emerald-500/25" : "bg-accent/20";

  return (
    <div className={`relative overflow-hidden border-b border-border ${gradientBg} py-12 sm:py-16 text-white`}>
      {/* Decorative ambient radial glows */}
      <div className={`pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full ${glowColorLeft} blur-3xl`} />
      <div className={`pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full ${glowColorRight} blur-3xl`} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl space-y-3">
          {/* Eyebrow Badge Pill */}
          {badge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md shadow-sm">
              <span className={`h-2 w-2 rounded-full ${isAccent ? "bg-emerald-400" : "bg-secondary"} animate-pulse`} />
              <span>{badge}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="font-sans text-base text-blue-100/90 sm:text-lg leading-relaxed max-w-2xl pt-1">
              {description}
            </p>
          )}

          {/* Optional Children (Stats, Action Buttons, Breadcrumbs) */}
          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
