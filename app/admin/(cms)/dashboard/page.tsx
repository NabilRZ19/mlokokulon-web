import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { beritaSeed, galeriSeed, rwSeed, umkmSeed } from "@/lib/seed-data";

const shortcuts = [
  { href: "/admin/berita", label: "Berita", description: "Kelola berita & pengumuman" },
  { href: "/admin/galeri", label: "Galeri", description: "Kelola foto & video" },
  { href: "/admin/umkm", label: "UMKM & Potensi", description: "Kelola katalog UMKM" },
  { href: "/admin/wilayah", label: "Wilayah (RW)", description: "Edit data tiap RW" },
  { href: "/admin/pengaturan", label: "Struktur Kelurahan", description: "Edit struktur organisasi" },
  { href: "/admin/users", label: "Kelola Admin", description: "Kelola akun admin (Tier 1)" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">
          Halo, (Nama Admin — Dummy)
        </h1>
        <p className="text-sm text-muted-foreground">Tier 1 — Super Admin</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <Stat label="Berita" value={`${beritaSeed.length}`} />
        </Card>
        <Card>
          <Stat label="UMKM" value={`${umkmSeed.length}`} />
        </Card>
        <Card>
          <Stat label="Galeri" value={`${galeriSeed.length}`} />
        </Card>
        <Card>
          <Stat label="RW" value={`${rwSeed.length}`} />
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full">
              <h2 className="font-heading font-semibold text-foreground">{s.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
