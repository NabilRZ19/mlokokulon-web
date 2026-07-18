"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinIcon } from "@/components/ui/icons";
import {
  DashboardIcon,
  ImageIcon,
  LogOutIcon,
  NewspaperIcon,
  SettingsIcon,
  StoreIcon,
  UserCogIcon,
} from "./icons";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/berita", label: "Berita", icon: NewspaperIcon },
  { href: "/admin/galeri", label: "Galeri", icon: ImageIcon },
  { href: "/admin/umkm", label: "UMKM", icon: StoreIcon },
  { href: "/admin/wilayah", label: "Wilayah (RW)", icon: MapPinIcon },
  { href: "/admin/pengaturan", label: "Struktur Kelurahan", icon: SettingsIcon },
  { href: "/admin/users", label: "Kelola Admin", icon: UserCogIcon },
];

// Belum ada show/hide per-tier (nav tampil semua ke siapa pun) — itu bagian "fungsi", menyusul
// bareng guard tier & Firebase Auth beneran.
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2.5 border-b border-border px-4 py-4"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-white">
          MK
        </span>
        <span className="font-heading text-sm font-semibold text-foreground">Admin Panel</span>
      </Link>

      <nav className="flex-1 space-y-1 p-3 text-sm">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                active ? "bg-primary text-white" : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="m-3 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
      >
        <LogOutIcon className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
