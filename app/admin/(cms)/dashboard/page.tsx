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
import { MapPinIcon, KampungKbIcon } from "@/components/ui/icons";
import { db } from "@/lib/db/client";
import { adminUsers, layanan as layananTable } from "@/lib/db/schema";
import { getBeritaList, getGaleriList, getRwList, getUmkmList } from "@/lib/queries";
import { getSession } from "@/lib/session";

const TIER_LABEL: Record<number, string> = {
  1: "Super Admin",
  2: "Admin Kelurahan",
  3: "Admin RW",
};

interface ManagementItem {
  href: string;
  label: string;
  description: string;
  count: number;
  countLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  canAccess?: (tier: number) => boolean;
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  const tier = session?.tier ?? 1;

  const [beritaList, umkmList, galeriList, rwList] = await Promise.all([
    getBeritaList(),
    getUmkmList(),
    getGaleriList(),
    getRwList(),
  ]);

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

  const managementItems: ManagementItem[] = [
    {
      href: "/admin/berita",
      label: "Berita & Pengumuman",
      description: "Kelola artikel Warta, Pengumuman Resmi & Pembangunan",
      count: beritaList.length,
      countLabel: "Berita",
      icon: NewspaperIcon,
      accentBg: "bg-blue-50 border-blue-200/60 text-blue-700",
    },
    {
      href: "/admin/galeri",
      label: "Galeri Media",
      description: "Kelola foto & dokumentasi video kegiatan masyarakat",
      count: galeriList.length,
      countLabel: "Media",
      icon: ImageIcon,
      accentBg: "bg-indigo-50 border-indigo-200/60 text-indigo-700",
    },
    {
      href: "/admin/umkm",
      label: "UMKM & Potensi",
      description: "Kelola katalog produk, lokasi usaha & profil UMKM warga",
      count: umkmList.length,
      countLabel: "Usaha",
      icon: StoreIcon,
      accentBg: "bg-amber-50 border-amber-200/60 text-amber-700",
    },
    {
      href: "/admin/kampung-kb",
      label: "Kampung KB",
      description: "Kelola informasi highlight, tujuan & pokja Kampung KB",
      count: 1,
      countLabel: "Program",
      icon: KampungKbIcon,
      accentBg: "bg-emerald-50 border-emerald-200/60 text-emerald-700",
    },
    {
      href: "/admin/layanan",
      label: "Layanan Kelurahan",
      description: "Kelola jenis surat layanan publik & persyaratan administrasi",
      count: totalLayanan,
      countLabel: "Layanan",
      icon: LayananIcon,
      accentBg: "bg-sky-50 border-sky-200/60 text-sky-700",
      canAccess: (t) => t === 1 || t === 2,
    },
    {
      href: "/admin/wilayah",
      label: "Wilayah (RW)",
      description: "Edit profil demografi & statistik data wilayah RW",
      count: rwList.length,
      countLabel: "Wilayah RW",
      icon: MapPinIcon,
      accentBg: "bg-teal-50 border-teal-200/60 text-teal-700",
      canAccess: (t) => t === 1 || t === 3,
    },
    {
      href: "/admin/pengaturan",
      label: "Struktur Kelurahan",
      description: "Edit bagan organisasi & daftar nama pejabat kelurahan",
      count: 1,
      countLabel: "Struktur",
      icon: SettingsIcon,
      accentBg: "bg-slate-100 border-slate-200/60 text-slate-700",
      canAccess: (t) => t === 1 || t === 2,
    },
    {
      href: "/admin/users",
      label: "Kelola Admin",
      description: "Kelola akun pengguna, level akses (Tier) & ganti password",
      count: totalAdminUsers,
      countLabel: "Pengguna",
      icon: UserCogIcon,
      accentBg: "bg-rose-50 border-rose-200/60 text-rose-700",
      canAccess: (t) => t === 1 || t === 2,
    },
  ];

  const filteredItems = managementItems.filter(
    (item) => !item.canAccess || item.canAccess(tier)
  );

  return (
    <div className="space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Dashboard CMS
            </h1>
            <Badge variant="accent">{TIER_LABEL[tier]}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Kelola seluruh konten, layanan publik, dan data wilayah Kelurahan Mlokomanis Kulon.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted hover:text-primary"
          >
            <span>Lihat Website Publik</span>
            <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Ringkasan Parameter Data */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Berita</p>
          <p className="mt-1.5 font-heading text-2xl font-extrabold text-foreground">{beritaList.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Galeri</p>
          <p className="mt-1.5 font-heading text-2xl font-extrabold text-foreground">{galeriList.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">UMKM</p>
          <p className="mt-1.5 font-heading text-2xl font-extrabold text-foreground">{umkmList.length}</p>
        </div>
        {(tier === 1 || tier === 3) && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Data RW</p>
            <p className="mt-1.5 font-heading text-2xl font-extrabold text-foreground">{rwList.length}</p>
          </div>
        )}
        {(tier === 1 || tier === 2) && (
          <>
            <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Layanan</p>
              <p className="mt-1.5 font-heading text-2xl font-extrabold text-foreground">{totalLayanan}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pengguna Admin</p>
              <p className="mt-1.5 font-heading text-2xl font-extrabold text-foreground">{totalAdminUsers}</p>
            </div>
          </>
        )}
      </div>

      {/* Grid Pengelolaan Utama */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold text-foreground">
            Modul Pengelolaan CMS
          </h2>
          <span className="text-xs text-muted-foreground">
            {filteredItems.length} modul aktif
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group">
                <Card className="flex h-full flex-col justify-between p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${item.accentBg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                        {item.count} {item.countLabel}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary group-hover:underline pt-2 border-t border-border/40">
                    <span>Buka Kelola</span>
                    <span>→</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

