import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  // "accent" dipakai khusus halaman Kampung KB — wajib menonjol/beda warna (PRD Bagian 6.4 & 8).
  variant?: "primary" | "accent";
  children?: ReactNode;
}

export function PageHeader({ title, description, variant = "primary", children }: PageHeaderProps) {
  const bg = variant === "accent" ? "bg-accent" : "bg-primary";

  return (
    <div className={`border-b border-border ${bg}`}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-white/85">{description}</p>}
        {children}
      </div>
    </div>
  );
}
