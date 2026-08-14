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
  const [pendingCount, setPendingCount] = useState(0);
  const [userTier, setUserTier] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama" | "judul-asc" | "judul-desc">("terbaru");

  async function fetchGaleri() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/galeri");
      if (!res.ok) throw new Error("Gagal memuat galeri.");
      const data = await res.json();
      setItems(data);
      const pending = data.filter((g: Galeri) => g.status === "pending").length;
      setPendingCount(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/admin/session").then((r) => r.json()).then((d) => setUserTier(d?.tier ?? null)).catch(() => null);
  }, []);

  useEffect(() => {
    fetchGaleri();
  }, []);

  const sortedItems = items.slice().sort((a, b) => {
    if (sortBy === "terbaru") return b.id.localeCompare(a.id);
    if (sortBy === "terlama") return a.id.localeCompare(b.id);
    if (sortBy === "judul-asc") return a.judul.localeCompare(b.judul, "id", { sensitivity: "base" });
    if (sortBy === "judul-desc") return b.judul.localeCompare(a.judul, "id", { sensitivity: "base" });
    return 0;
  });

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

      {/* Banner Persetujuan — hanya Tier 1 & 2 */}
      {(userTier === 1 || userTier === 2) && pendingCount > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700 border border-orange-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-orange-900">
                {pendingCount} item galeri menunggu persetujuan Anda
              </p>
              <p className="text-xs text-orange-700">Diajukan oleh Admin RW atau Admin Kampung KB</p>
            </div>
          </div>
          <Link
            href="/admin/persetujuan/galeri"
            className="shrink-0 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition-colors"
          >
            Review Sekarang
          </Link>
        </div>
      )}

      {/* Sort Control Bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-2xs">
        <span className="text-xs font-bold text-muted-foreground">
          Total: <strong className="text-foreground">{sortedItems.length} Media</strong>
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="cms-galeri-sort" className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            Urutkan:
          </label>
          <select
            id="cms-galeri-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="terbaru">Terbaru (Default)</option>
            <option value="terlama">Terlama</option>
            <option value="judul-asc">Judul (A–Z)</option>
            <option value="judul-desc">Judul (Z–A)</option>
          </select>
        </div>
      </div>

      {/* Mobile Card Grid (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat galeri…
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada item galeri.
          </div>
        ) : (
          sortedItems.map((g) => (
            <div
              key={g.id}
              className={`flex items-center gap-3 rounded-2xl border p-3 shadow-xs transition-colors ${
                g.status === "pending"
                  ? "border-orange-200 bg-orange-50/30"
                  : g.status === "rejected"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border bg-card"
              }`}
            >
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-heading text-sm font-bold text-foreground truncate">{g.judul}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    g.status === "pending"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : g.status === "rejected"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}>
                    {g.status === "pending" ? "⏳ Pending" : g.status === "rejected" ? "✕ Ditolak" : "✓ Published"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize font-semibold text-primary">{g.tipe}</span>
                  <span>•</span>
                  <span>{g.kategori || "Umum"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/galeri/${g.id}/edit`}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs shrink-0"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(g.id, g.judul)}
                  disabled={deletingId === g.id}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 shadow-2xs shrink-0"
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
          <thead className="border-b border-border bg-muted/50 text-muted-foreground font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Media</th>
              <th className="px-4 py-3">Judul Media</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sumber Media</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat galeri…
                </td>
              </tr>
            ) : sortedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada item galeri.
                </td>
              </tr>
            ) : (
              sortedItems.map((g) => (
                <tr
                  key={g.id}
                  className={`hover:bg-muted/30 transition-colors ${
                    g.status === "pending"
                      ? "bg-orange-50/50"
                      : g.status === "rejected"
                      ? "bg-destructive/5"
                      : ""
                  }`}
                >
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
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {g.kategori || "Umum"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      g.status === "published" ? "bg-emerald-100 text-emerald-700" :
                      g.status === "pending" ? "bg-orange-100 text-orange-700" :
                      g.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {g.status === "pending" ? "Menunggu" : g.status === "rejected" ? "Ditolak" : "Published"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-medium">
                    {g.sumber_berita_id ? "Ditantang dari Berita" : "Upload Manual"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/galeri/${g.id}/edit`}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(g.id, g.judul)}
                        disabled={deletingId === g.id}
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 shadow-2xs"
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
