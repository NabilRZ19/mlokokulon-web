"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import type { Berita } from "@/lib/types";

const KATEGORI_LABEL: Record<string, string> = {
  pengumuman: "Pengumuman",
  kegiatan: "Kegiatan",
  pembangunan: "Pembangunan",
  berita: "Berita",
};

export default function AdminBeritaPage() {
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchBerita() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/berita");
      if (!res.ok) {
        // Fallback or read response
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memuat berita.");
      }
      const data = await res.json();
      setBeritaList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBerita();
  }, []);

  async function handleDelete(id: string, judul: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus berita "${judul}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/berita/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menghapus berita.");
      }
      setBeritaList((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Berita & Pengumuman"
        actions={
          <>
            <RefreshButton onClick={fetchBerita} />
            <Link
              href="/admin/berita/tambah"
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-primary/90 transition-colors"
            >
              + Tambah Berita
            </Link>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Judul</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Cakupan</th>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat data berita…
                </td>
              </tr>
            ) : beritaList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada berita yang diterbitkan.
                </td>
              </tr>
            ) : (
              beritaList.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground max-w-md truncate">
                    {b.judul}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{KATEGORI_LABEL[b.kategori] || b.kategori}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {b.cakupan === "kelurahan" ? "Kelurahan" : b.rw_nama || "RW"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(b.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/berita/${b.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Lihat
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id, b.judul)}
                        disabled={deletingId === b.id}
                        className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                      >
                        {deletingId === b.id ? "Hapus…" : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
