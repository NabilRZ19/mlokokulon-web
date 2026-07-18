import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Belum ada guard tier/auth beneran — siapa pun yang buka /admin/dashboard dst langsung bisa
// lihat shell ini. Menyusul saat Firebase Auth & guard tier diimplementasikan.
export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-foreground">(Nama Admin — Dummy)</span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Tier 1 — Super Admin
            </span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
