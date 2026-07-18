import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { beritaSeed } from "@/lib/seed-data";

const KATEGORI_LABEL: Record<string, string> = {
  pengumuman: "Pengumuman",
  kegiatan: "Kegiatan",
  pembangunan: "Pembangunan",
};

export default function AdminBeritaPage() {
  return (
    <div>
      <AdminPageHeader
        title="Berita"
        actions={
          <>
            <RefreshButton />
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              + Tambah Berita
            </button>
          </>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Judul</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Cakupan</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {beritaSeed.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-foreground">{b.judul}</td>
                <td className="px-4 py-3">
                  <Badge>{KATEGORI_LABEL[b.kategori]}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {b.cakupan === "kelurahan" ? "Kelurahan" : b.rw_nama}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(b.tanggal).toLocaleDateString("id-ID")}
                </td>
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
