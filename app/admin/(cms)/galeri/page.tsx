import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { galeriSeed } from "@/lib/seed-data";

export default function AdminGaleriPage() {
  return (
    <div>
      <AdminPageHeader
        title="Galeri"
        actions={
          <>
            <RefreshButton />
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
            >
              + Upload
            </button>
          </>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Media</th>
              <th className="px-4 py-3 font-medium">Judul</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {galeriSeed.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3">
                  <img src={g.url_media} alt={g.judul} className="h-10 w-10 rounded object-cover" />
                </td>
                <td className="px-4 py-3 text-foreground">{g.judul}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{g.tipe}</td>
                <td className="px-4 py-3 text-muted-foreground">{g.kategori ?? "—"}</td>
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
