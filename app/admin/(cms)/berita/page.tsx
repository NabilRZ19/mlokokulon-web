"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
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

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat data berita…
          </div>
        ) : beritaList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada berita yang diterbitkan.
          </div>
        ) : (
          beritaList.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2">
                  {b.judul}
                </h3>
                <BeritaBadge kategori={b.kategori} />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                <span>{b.cakupan === "kelurahan" ? "Kelurahan" : b.rw_nama || "RW"}</span>
                <span>
                  {new Date(b.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Link
                  href={`/berita/${b.slug}`}
                  target="_blank"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Lihat ↗
                </Link>
                <Link
                  href={`/admin/berita/${b.id}/edit`}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id, b.judul)}
                  disabled={deletingId === b.id}
                  className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
                >
                  {deletingId === b.id ? "Hapus…" : "Hapus"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-muted-foreground font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Judul Artikel / Informasi</th>
              <th className="px-4 py-3">Kategori Berita</th>
              <th className="px-4 py-3">Cakupan Wilayah</th>
              <th className="px-4 py-3">Tanggal Terbit</th>
              <th className="px-4 py-3 text-right">Aksi</th>
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
                    <BeritaBadge kategori={b.kategori} />
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
                      <Link
                        href={`/admin/berita/${b.id}/edit`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
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
