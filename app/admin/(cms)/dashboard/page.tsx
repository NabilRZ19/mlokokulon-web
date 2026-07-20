import Link from "next/link";
import {
  ImageIcon,
  NewspaperIcon,
  SettingsIcon,
  StoreIcon,
  UserCogIcon,
} from "@/components/admin/icons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { MapPinIcon } from "@/components/ui/icons";
import { getSession } from "@/lib/session";
import { beritaSeed, galeriSeed, rwSeed, umkmSeed } from "@/lib/seed-data";

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1 — Super Admin",
  2: "Tier 2 — Admin Kelurahan",
  3: "Tier 3 — Admin RW",
};

const stats = [
  { label: "Berita", value: beritaSeed.length, icon: NewspaperIcon },
  { label: "UMKM", value: umkmSeed.length, icon: StoreIcon },
  { label: "Galeri", value: galeriSeed.length, icon: ImageIcon },
  { label: "RW", value: rwSeed.length, icon: MapPinIcon },
];

const shortcuts = [
  {
    href: "/admin/berita",
    label: "Berita",
    description: "Kelola berita & pengumuman",
    icon: NewspaperIcon,
  },
  { href: "/admin/galeri", label: "Galeri", description: "Kelola foto & video", icon: ImageIcon },
  {
    href: "/admin/umkm",
    label: "UMKM & Potensi",
    description: "Kelola katalog UMKM",
    icon: StoreIcon,
  },
  {
    href: "/admin/wilayah",
    label: "Wilayah (RW)",
    description: "Edit data tiap RW",
    icon: MapPinIcon,
  },
  {
    href: "/admin/pengaturan",
    label: "Struktur Kelurahan",
    description: "Edit struktur organisasi",
    icon: SettingsIcon,
  },
  {
    href: "/admin/users",
    label: "Kelola Admin",
    description: "Kelola akun admin (Tier 1)",
    icon: UserCogIcon,
  },
];

export default async function AdminDashboardPage() {
  // Guard sudah dijalankan di layout — session di sini dijamin ada, tapi tetap fallback jaga-jaga.
  const session = await getSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Halo, {session?.nama ?? "Admin"}
        </h1>
        {session && (
          <div className="mt-2">
            <Badge>{TIER_LABEL[session.tier]}</Badge>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ringkasan
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <Stat label={s.label} value={`${s.value}`} />
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Menu Cepat
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((s) => (
            <Link key={s.href} href={s.href}>
              <Card className="flex h-full items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{s.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
