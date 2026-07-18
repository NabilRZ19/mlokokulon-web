import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";

// Belum ada koleksi admin_users beneran di Firestore — baris di bawah dummy/placeholder murni
// untuk tampilan, bukan data asli. Email Tier 1 pertama yang disepakati:
// superadmin@mlokokulon-ngadirojo.com (dipakai nanti saat bootstrap script dibuat).
const dummyUsers = [
  { nama: "(Tim Dev KKN — Dummy)", email: "superadmin@mlokokulon-ngadirojo.com", tier: 1 },
  { nama: "(Admin Kelurahan — Dummy)", email: "admin.kelurahan@mlokokulon-ngadirojo.com", tier: 2 },
  { nama: "(Admin RW 05 — Dummy)", email: "admin.rw05@mlokokulon-ngadirojo.com", tier: 3 },
];

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1 — Super Admin",
  2: "Tier 2 — Admin Kelurahan",
  3: "Tier 3 — Admin RW",
};

export default function AdminUsersPage() {
  return (
    <div>
      <AdminPageHeader
        title="Kelola Admin"
        actions={
          <>
            <RefreshButton />
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              + Tambah Admin
            </button>
          </>
        }
      />

      <p className="mb-4 text-sm text-muted-foreground">Tier 1 saja.</p>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dummyUsers.map((u) => (
              <tr key={u.email}>
                <td className="px-4 py-3 text-foreground">{u.nama}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{TIER_LABEL[u.tier]}</td>
                <td className="px-4 py-3">
                  <button type="button" className="text-destructive hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
