"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { getPublicImageUrl } from "@/lib/image-url";
import type { Galeri } from "@/lib/types";

export default function AdminGaleriPage() {
  const [items, setItems] = useState<Galeri[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchGaleri() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/galeri");
      if (!res.ok) throw new Error("Gagal memuat galeri.");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGaleri();
  }, []);

  async function handleDelete(id: string, judul: string) {
    if (!confirm(`Hapus media "${judul}" dari galeri?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/galeri/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus.");
      setItems((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Galeri Dokumentasi"
        actions={
          <>
            <RefreshButton onClick={fetchGaleri} />
            <Link
              href="/admin/galeri/tambah"
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-primary/90 transition-colors"
            >
              + Upload Media
            </Link>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Mobile Card Grid (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat galeri…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada item galeri.
          </div>
        ) : (
          items.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
              {g.tipe === "foto" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getPublicImageUrl(g.url_media)}
                  alt={g.judul}
                  className="h-16 w-16 rounded-lg object-contain bg-muted border border-border shrink-0"
                />
              ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-border text-xs font-bold text-primary">
                        Video
                      </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-heading text-sm font-bold text-foreground truncate">{g.judul}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize font-semibold text-primary">{g.tipe}</span>
                  <span>•</span>
                  <span>{g.kategori || "Umum"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/galeri/${g.id}/edit`}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(g.id, g.judul)}
                  disabled={deletingId === g.id}
                  className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50 shrink-0"
                >
                  {deletingId === g.id ? "…" : "Hapus"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Media</th>
              <th className="px-4 py-3 font-semibold">Judul</th>
              <th className="px-4 py-3 font-semibold">Tipe</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Sumber</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat galeri…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada item galeri.
                </td>
              </tr>
            ) : (
              items.map((g) => (
                <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    {g.tipe === "foto" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getPublicImageUrl(g.url_media)}
                        alt={g.judul}
                        className="h-12 w-12 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-border text-xs font-bold text-primary">
                        Video
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground max-w-xs truncate">
                    {g.judul}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground font-medium">
                    {g.tipe}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {g.kategori || "Umum"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {g.sumber_berita_id ? "Ditantang dari Berita" : "Upload Manual"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/galeri/${g.id}/edit`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id, g.judul)}
                        disabled={deletingId === g.id}
                        className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                      >
                        {deletingId === g.id ? "Hapus…" : "Hapus"}
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
