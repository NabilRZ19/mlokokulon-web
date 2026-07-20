"use client";

import Link from "next/link";
import { useState } from "react";
import { LockIcon } from "@/components/ui/icons";

const pemerintahanLinks = [
  { href: "/struktur", label: "Struktur Organisasi" },
  { href: "/wilayah", label: "Wilayah Administratif" },
];

const afterDropdownLinks = [
  { href: "/berita", label: "Berita" },
  { href: "/umkm", label: "UMKM & Potensi" },
  { href: "/kontak", label: "Kontak" },
];

const kampungKbClass =
  "rounded-md bg-accent px-3 py-1.5 text-accent-foreground transition-colors hover:bg-accent/90";

// Link nav biasa: hover ganti background (bukan cuma warna teks) supaya area klik jelas.
const navLinkClass =
  "rounded-md px-3 py-2 text-foreground transition-colors hover:bg-muted hover:text-primary";

// Struktur navbar sesuai preferensi user (lihat plan navbar update): Profil Desa jadi item
// top-level sendiri, Wilayah Administratif pindah ke dropdown Pemerintahan, urutan
// Layanan-lalu-Kampung KB, dan Kampung KB di-highlight pakai background warna (bukan badge)
// supaya tetap menonjol sesuai wajib PRD Bagian 8. Login Admin sengaja dipisah ke zona kanan
// sendiri (bukan ikut array menu publik) — cuma pintu masuk admin, bukan navigasi situs.
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pemerintahanOpen, setPemerintahanOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-white">
              MK
            </span>
            <span className="font-heading font-semibold text-foreground">Mlokomanis Kulon</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 text-sm md:flex">
            <Link href="/" className={navLinkClass}>
              Beranda
            </Link>

            <Link href="/profil" className={navLinkClass}>
              Profil Desa
            </Link>

            {/* Buka dropdown saat hover (desktop) atau klik/fokus (sentuh & keyboard) */}
            <div
              className="relative"
              onMouseEnter={() => setPemerintahanOpen(true)}
              onMouseLeave={() => setPemerintahanOpen(false)}
            >
              <button
                type="button"
                onClick={() => setPemerintahanOpen((v) => !v)}
                onBlur={() => setTimeout(() => setPemerintahanOpen(false), 100)}
                className={navLinkClass}
              >
                Pemerintahan ▾
              </button>
              {pemerintahanOpen && (
                <div className="absolute left-0 top-full w-52 rounded-md border border-border bg-card py-1 shadow-lg">
                  {pemerintahanLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-3 py-2 text-foreground hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/layanan" className={navLinkClass}>
              Layanan
            </Link>

            <Link href="/kampung-kb" className={kampungKbClass}>
              Kampung KB
            </Link>

            {afterDropdownLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
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
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground md:hidden"
            aria-label="Buka menu"
          >
            {mobileOpen ? "Tutup" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Mobile accordion menu */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-2 text-sm md:hidden">
          <Link href="/" className="block py-2 text-foreground">
            Beranda
          </Link>
          <Link href="/profil" className="block py-2 text-foreground">
            Profil Desa
          </Link>

          <div className="py-1 text-muted-foreground">Pemerintahan</div>
          {pemerintahanLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 pl-4 text-foreground">
              {link.label}
            </Link>
          ))}

          <Link href="/layanan" className="block py-2 text-foreground">
            Layanan
          </Link>

          <Link href="/kampung-kb" className={`my-1 block w-fit ${kampungKbClass}`}>
            Kampung KB
          </Link>

          {afterDropdownLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 text-foreground">
              {link.label}
            </Link>
          ))}

          <Link
            href="/admin/login"
            className="mt-2 flex items-center gap-1.5 border-t border-border py-3 text-muted-foreground"
          >
            <LockIcon className="h-3.5 w-3.5" />
            Login Admin
          </Link>
        </div>
      )}
    </header>
  );
}
