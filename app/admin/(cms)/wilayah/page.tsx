import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { rwSeed } from "@/lib/seed-data";

export default function AdminWilayahPage() {
  return (
    <div>
      <AdminPageHeader title="Wilayah (RW)" actions={<RefreshButton />} />

      <p className="mb-4 text-sm text-muted-foreground">
        Tier 1 & Tier 3 — pilih RW mana pun dari daftar ini untuk diedit (tidak ada pembatasan RW
        per akun).
      </p>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nama RW</th>
              <th className="px-4 py-3 font-medium">Dusun</th>
              <th className="px-4 py-3 font-medium">Jumlah RT</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rwSeed.map((rw) => (
              <tr key={rw.id}>
                <td className="px-4 py-3 text-foreground">{rw.nama_rw}</td>
                <td className="px-4 py-3 text-muted-foreground">{rw.cakupan_dusun}</td>
                <td className="px-4 py-3 text-muted-foreground">{rw.jumlah_rt}</td>
                <td className="px-4 py-3">
                  {rw.is_kampung_kb && <Badge variant="accent">★ Kampung KB</Badge>}
                </td>
                <td className="px-4 py-3">
                  <button type="button" className="text-primary hover:underline">
                    Edit
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
