import Link from "next/link";
import {
  ImageIcon,
  LayananIcon,
  NewspaperIcon,
  SettingsIcon,
  StoreIcon,
  UserCogIcon,
} from "@/components/admin/icons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { MapPinIcon } from "@/components/ui/icons";
import { db } from "@/lib/db/client";
import { KampungKbIcon } from "@/components/ui/icons";
import { adminUsers, layanan as layananTable } from "@/lib/db/schema";
import { getBeritaList, getGaleriList, getRwList, getUmkmList } from "@/lib/queries";
import { getSession } from "@/lib/session";

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1: Super Admin",
  2: "Tier 2: Admin Kelurahan",
  3: "Tier 3: Admin RW",
};

const TIER_DESC: Record<number, string> = {
  1: "Super Admin — Memiliki akses penuh untuk mengelola seluruh data kelurahan, layanan, struktur organisasi, wilayah RW, dan manajemen akun admin.",
  2: "Admin Kelurahan — Mengelola berita, galeri, layanan kelurahan, UMKM, Kampung KB, struktur organisasi, serta manajemen akun admin.",
  3: "Admin RW — Mengelola konten berita, galeri, UMKM, serta pembaruan data & statistik wilayah RW Anda.",
};

interface Shortcut {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  canAccess?: (tier: number) => boolean;
}

const shortcuts: Shortcut[] = [
  {
    href: "/admin/berita",
    label: "Berita",
    description: "Kelola berita & pengumuman kelurahan",
    icon: NewspaperIcon,
  },
  {
    href: "/admin/galeri",
    label: "Galeri",
    description: "Kelola foto & video kegiatan",
    icon: ImageIcon,
  },
  {
    href: "/admin/layanan",
    label: "Layanan Kelurahan",
    description: "Kelola daftar layanan & persyaratan",
    icon: LayananIcon,
    canAccess: (t) => t === 1 || t === 2,
  },
  {
    href: "/admin/umkm",
    label: "UMKM & Potensi",
    description: "Kelola katalog produk & UMKM",
    icon: StoreIcon,
  },
  {
    href: "/admin/kampung-kb",
    label: "Kampung KB",
    description: "Kelola data & pengurus Kampung KB",
    icon: KampungKbIcon,
  },
  {
    href: "/admin/wilayah",
    label: "Wilayah (RW)",
    description: "Edit data & statistik wilayah RW",
    icon: MapPinIcon,
    canAccess: (t) => t === 1 || t === 3,
  },
  {
    href: "/admin/pengaturan",
    label: "Struktur Kelurahan",
    description: "Edit bagan & pejabat kelurahan",
    icon: SettingsIcon,
    canAccess: (t) => t === 1 || t === 2,
  },
  {
    href: "/admin/users",
    label: "Kelola Admin",
    description: "Kelola akun pengelola & password",
    icon: UserCogIcon,
    canAccess: (t) => t === 1 || t === 2,
  },
];

export default async function AdminDashboardPage() {
  const session = await getSession();
  const tier = session?.tier ?? 1;

  const [beritaList, umkmList, galeriList, rwList] = await Promise.all([
    getBeritaList(),
    getUmkmList(),
    getGaleriList(),
    getRwList(),
  ]);

  // Query tambahan untuk stats sesuai tier
  let totalAdminUsers = 0;
  let totalLayanan = 0;
  if (tier === 1 || tier === 2) {
    try {
      const [usersRows, layananRows] = await Promise.all([
        db.select({ id: adminUsers.id }).from(adminUsers),
        db.select({ id: layananTable.id }).from(layananTable),
      ]);
      totalAdminUsers = usersRows.length;
      totalLayanan = layananRows.length;
    } catch {
      // fallback jika error
    }
  }

  // Statistik Disesuaikan Per Tier
  const stats = [
    { label: "Berita", value: beritaList.length, icon: NewspaperIcon },
    { label: "UMKM", value: umkmList.length, icon: StoreIcon },
    { label: "Galeri", value: galeriList.length, icon: ImageIcon },
    ...(tier === 1 || tier === 3
      ? [{ label: "Data RW", value: rwList.length, icon: MapPinIcon }]
      : []),
    ...(tier === 1 || tier === 2
      ? [
          { label: "Layanan", value: totalLayanan, icon: LayananIcon },
          { label: "Akun Admin", value: totalAdminUsers, icon: UserCogIcon },
        ]
      : []),
  ];

  const availableShortcuts = shortcuts.filter(
    (s) => !s.canAccess || s.canAccess(tier)
  );

  return (
    <div className="space-y-8">
      {/* Header & Informasi Hak Akses Tier */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Halo, {session?.nama ?? "Admin"} 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Selamat datang di Panel Pengelolaan Situs Mlokomanis Kulon.
            </p>
          </div>
          {session && (
            <Badge variant={tier === 1 ? "accent" : "default"}>
              {TIER_LABEL[tier]}
            </Badge>
          )}
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-primary font-medium">
          ℹ️ {TIER_DESC[tier] || TIER_DESC[1]}
        </div>
      </div>

      {/* Ringkasan Statistik Live Disesuaikan Tier */}
      <div>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ringkasan Database Live ({TIER_LABEL[tier]})
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <Card key={s.label} className="flex items-center gap-3.5 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <Stat label={s.label} value={`${s.value}`} />
            </Card>
          ))}
        </div>
      </div>

      {/* Menu Cepat Disesuaikan Hak Akses Tier */}
      <div>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Menu Cepat Hak Akses Anda
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableShortcuts.map((s) => (
            <Link key={s.href} href={s.href}>
              <Card className="flex h-full items-start gap-3 transition-all hover:border-primary/50 hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">
                    {s.label}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
