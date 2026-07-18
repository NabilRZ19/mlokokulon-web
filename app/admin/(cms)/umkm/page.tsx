import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { umkmSeed } from "@/lib/seed-data";

export default function AdminUmkmPage() {
  return (
    <div>
      <AdminPageHeader
        title="UMKM & Potensi"
        actions={
          <>
            <RefreshButton />
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              + Tambah UMKM
            </button>
          </>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Kontak</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {umkmSeed.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-foreground">{u.nama}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.kategori}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.kontak}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button type="button" className="text-primary hover:underline">
                      Edit
                    </button>
                    <button type="button" className="text-destructive hover:underline">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
