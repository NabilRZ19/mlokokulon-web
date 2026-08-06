"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MapPinIcon } from "@/components/ui/icons";
import type { SessionPayload } from "@/lib/auth";
import {
  DashboardIcon,
  ImageIcon,
  LayananIcon,
  LogOutIcon,
  NewspaperIcon,
  SettingsIcon,
  StoreIcon,
  UserCogIcon,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  canAccess?: (tier: number) => boolean;
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/berita", label: "Berita", icon: NewspaperIcon },
  { href: "/admin/galeri", label: "Galeri", icon: ImageIcon },
  { href: "/admin/layanan", label: "Layanan Kelurahan", icon: LayananIcon },
  { href: "/admin/umkm", label: "UMKM", icon: StoreIcon },
  { href: "/admin/kampung-kb", label: "Pengaturan Kampung KB", icon: HeartIcon },
  { href: "/admin/wilayah", label: "Wilayah (RW)", icon: MapPinIcon, canAccess: (t) => t === 1 || t === 3 },
  { href: "/admin/pengaturan", label: "Struktur Kelurahan", icon: SettingsIcon, canAccess: (t) => t === 1 || t === 2 },
  { href: "/admin/users", label: "Kelola Admin", icon: UserCogIcon, canAccess: (t) => t === 1 || t === 2 },
];

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1: Super Admin",
  2: "Tier 2: Admin Kelurahan",
  3: "Tier 3: Admin RW",
};

function getInitials(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AdminSidebar({ session }: { session: SessionPayload }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Otomatis tutup drawer saat pindah halaman di mobile
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex h-full w-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/images/logo-wonogiri.png"
            alt="Logo Kabupaten Wonogiri"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span className="font-heading text-sm font-semibold text-foreground">Admin Panel</span>
        </Link>
        {/* Tombol Tutup di Mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground hover:bg-muted md:hidden font-bold"
          aria-label="Tutup Menu"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3 text-sm overflow-y-auto">
        {/* Tombol Home untuk kembali ke Beranda Utama Publik */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-primary font-semibold transition-colors hover:bg-primary/10 mb-3"
          title="Buka Situs Publik Mlokomanis Kulon"
        >
          <div className="flex items-center gap-2.5">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>

            <span>Lihat Situs Publik</span>
          </div>
          <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>

        {navItems
          .filter((item) => !item.canAccess || item.canAccess(session.tier))
          .map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  active ? "bg-primary text-white font-semibold" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-bold text-primary">
            {getInitials(session.nama)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{session.nama}</p>
            <p className="truncate text-xs text-muted-foreground">{TIER_LABEL[session.tier]}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted font-semibold"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Top Mobile Bar (Hanya Tampil di Layar < md) ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"
            aria-label="Buka Menu Sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/logo-wonogiri.png"
              alt="Logo Kabupaten Wonogiri"
              width={28}
              height={28}
              className="h-7 w-auto object-contain"
            />
            <span className="font-heading text-sm font-bold text-foreground">CMS Mlokomanis</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-primary hover:bg-muted"
            title="Lihat Beranda Publik"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-bold text-primary">
            {getInitials(session.nama)}
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay (Slide-out dari Kiri) ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full w-72 bg-card shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar (Tampil di Layar >= md) ── */}
      <aside className="hidden sticky top-0 md:flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card overflow-y-auto z-30">
        {sidebarContent}
      </aside>
    </>
  );
}
