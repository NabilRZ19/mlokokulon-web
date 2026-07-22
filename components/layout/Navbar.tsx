"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LockIcon } from "@/components/ui/icons";

// ─── Inline Icons ─────────────────────────────────────────────────────────────
function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconSprout() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-emerald-200"
    >
      <path d="M7 20h10" />
      <path d="M12 20v-8" />
      <path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7Z" />
    </svg>
  );
}

const pemerintahanLinks = [
  { href: "/struktur", label: "Struktur Organisasi" },
  { href: "/wilayah", label: "Wilayah Administratif" },
];

const afterDropdownLinks = [
  { href: "/berita", label: "Berita" },
  { href: "/umkm", label: "UMKM & Potensi" },
  { href: "/kontak", label: "Kontak" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pemerintahanOpen, setPemerintahanOpen] = useState(false);

  const isKampungKbActive = pathname === "/kampung-kb";
  const isPemerintahanActive = pemerintahanLinks.some((l) => pathname === l.href);

  // Class penanda khusus Kampung KB — beraksen warna hijau (#16a34a), berbentuk pill badge
  const kampungKbClass = `inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-heading text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
    isKampungKbActive ? "ring-2 ring-emerald-600/50 bg-emerald-700 shadow-md" : ""
  }`;

  // Helper untuk nav link biasa (dengan penanda aktif)
  const getNavLinkClass = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `inline-flex items-center justify-center rounded-md px-2.5 py-2 text-sm transition-colors ${
      isActive
        ? "bg-primary/10 font-semibold text-primary"
        : "text-foreground hover:bg-muted hover:text-primary"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-white shadow-sm">
              MK
            </span>
            <span className="font-heading font-semibold text-foreground">Mlokomanis Kulon</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 text-sm md:flex">
            {/* Tombol Home/Beranda disimbolkan Ikon Rumah */}
            <Link
              href="/"
              aria-label="Beranda"
              title="Beranda"
              className={getNavLinkClass("/")}
            >
              <IconHome />
            </Link>

            <Link href="/profil" className={getNavLinkClass("/profil")}>
              Profil
            </Link>

            {/* Dropdown Pemerintahan */}
            <div
              className="relative"
              onMouseEnter={() => setPemerintahanOpen(true)}
              onMouseLeave={() => setPemerintahanOpen(false)}
            >
              <button
                type="button"
                onClick={() => setPemerintahanOpen((v) => !v)}
                onBlur={() => setTimeout(() => setPemerintahanOpen(false), 100)}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  isPemerintahanActive
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                Pemerintahan ▾
              </button>
              {pemerintahanOpen && (
                <div className="absolute left-0 top-full w-52 rounded-md border border-border bg-card py-1 shadow-lg">
                  {pemerintahanLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2 text-sm transition-colors ${
                        pathname === link.href
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/layanan" className={getNavLinkClass("/layanan")}>
              Layanan
            </Link>

            {/* Tombol Kampung KB (Menonjol beraksen Hijau / Accent dengan Ikon Tunas) */}
            <Link href="/kampung-kb" className={kampungKbClass}>
              <IconSprout />
              <span>Kampung KB</span>
            </Link>

            {afterDropdownLinks.map((link) => (
              <Link key={link.href} href={link.href} className={getNavLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/login"
            className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary md:inline-flex"
          >
            <LockIcon className="h-3.5 w-3.5" />
            Admin
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground md:hidden hover:bg-muted"
            aria-label="Buka menu"
          >
            {mobileOpen ? "Tutup" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Mobile accordion menu */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-3 text-sm md:hidden bg-card">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 py-2 ${pathname === "/" ? "font-bold text-primary" : "text-foreground"}`}
          >
            <IconHome />
            <span>Beranda</span>
          </Link>

          <Link
            href="/profil"
            onClick={() => setMobileOpen(false)}
            className={`block py-2 ${pathname === "/profil" ? "font-bold text-primary" : "text-foreground"}`}
          >
            Profil
          </Link>

          <div className="py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pemerintahan
          </div>
          {pemerintahanLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 pl-4 ${pathname === link.href ? "font-bold text-primary" : "text-foreground"}`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/layanan"
            onClick={() => setMobileOpen(false)}
            className={`block py-2 ${pathname === "/layanan" ? "font-bold text-primary" : "text-foreground"}`}
          >
            Layanan
          </Link>

          {/* Kampung KB di Mobile Menu */}
          <div className="py-2">
            <Link
              href="/kampung-kb"
              onClick={() => setMobileOpen(false)}
              className={kampungKbClass}
            >
              <IconSprout />
              <span>Kampung KB</span>
            </Link>
          </div>

          {afterDropdownLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 ${pathname.startsWith(link.href) ? "font-bold text-primary" : "text-foreground"}`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/admin/login"
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-muted-foreground hover:text-primary"
          >
            <LockIcon className="h-3.5 w-3.5" />
            Login Admin
          </Link>
        </div>
      )}
    </header>
  );
}
