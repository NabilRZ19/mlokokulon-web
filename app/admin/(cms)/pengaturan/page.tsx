import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { strukturKelurahanSeed } from "@/lib/seed-data";

export default function AdminPengaturanPage() {
  return (
    <div>
      <AdminPageHeader
        title="Struktur Kelurahan"
        actions={
          <>
            <RefreshButton />
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              + Tambah Jabatan
            </button>
          </>
        }
      />

      <p className="mb-4 text-sm text-muted-foreground">Tier 1 & Tier 2.</p>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Jabatan</th>
              <th className="px-4 py-3 font-medium">Urutan</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {strukturKelurahanSeed.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <img
                    src={s.foto_url}
                    alt={s.nama}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-4 py-3 text-foreground">{s.nama}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.jabatan}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.urutan}</td>
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
