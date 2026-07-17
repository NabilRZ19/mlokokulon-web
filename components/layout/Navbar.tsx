"use client";

import Link from "next/link";
import { useState } from "react";

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
  "rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-200";

// Struktur navbar sesuai preferensi user (lihat plan navbar update): Profil Desa jadi item
// top-level sendiri, Wilayah Administratif pindah ke dropdown Pemerintahan, urutan
// Layanan-lalu-Kampung KB, dan Kampung KB di-highlight pakai background warna (bukan badge)
// supaya tetap menonjol sesuai wajib PRD Bagian 8.
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pemerintahanOpen, setPemerintahanOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          Mlokomanis Kulon
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/" className="text-slate-700 hover:text-slate-900">
            Beranda
          </Link>

          <Link href="/profil" className="text-slate-700 hover:text-slate-900">
            Profil Desa
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setPemerintahanOpen((v) => !v)}
              onBlur={() => setTimeout(() => setPemerintahanOpen(false), 100)}
              className="text-slate-700 hover:text-slate-900"
            >
              Pemerintahan ▾
            </button>
            {pemerintahanOpen && (
              <div className="absolute left-0 mt-2 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-md">
                {pemerintahanLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/layanan" className="text-slate-700 hover:text-slate-900">
            Layanan
          </Link>

          <Link href="/kampung-kb" className={kampungKbClass}>
            Kampung KB
          </Link>

          {afterDropdownLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-700 hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm md:hidden"
          aria-label="Buka menu"
        >
          {mobileOpen ? "Tutup" : "Menu"}
        </button>
      </nav>

      {/* Mobile accordion menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-2 text-sm md:hidden">
          <Link href="/" className="block py-2 text-slate-700">
            Beranda
          </Link>
          <Link href="/profil" className="block py-2 text-slate-700">
            Profil Desa
          </Link>

          <div className="py-1 text-slate-500">Pemerintahan</div>
          {pemerintahanLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 pl-4 text-slate-700">
              {link.label}
            </Link>
          ))}

          <Link href="/layanan" className="block py-2 text-slate-700">
            Layanan
          </Link>

          <Link href="/kampung-kb" className={`my-1 block w-fit ${kampungKbClass}`}>
            Kampung KB
          </Link>

          {afterDropdownLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 text-slate-700">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
