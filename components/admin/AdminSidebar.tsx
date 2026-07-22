"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPinIcon } from "@/components/ui/icons";
import type { SessionPayload } from "@/lib/auth";
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

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1 — Super Admin",
  2: "Tier 2 — Admin Kelurahan",
  3: "Tier 3 — Admin RW",
};

function getInitials(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Belum ada show/hide per-tier (nav tampil semua ke siapa pun) — itu bagian "fungsi", menyusul
// bareng wiring CRUD per tier.
export function AdminSidebar({ session }: { session: SessionPayload }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card overflow-y-auto z-30">
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
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
