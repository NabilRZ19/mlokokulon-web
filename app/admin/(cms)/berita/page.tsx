"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
import { Badge } from "@/components/ui/Badge";
import type { Berita } from "@/lib/types";

// Status badge styling
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Menunggu Persetujuan", className: "bg-orange-100 text-orange-700" },
  rejected: { label: "Ditolak", className: "bg-destructive/10 text-destructive" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
};

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
  const [pendingCount, setPendingCount] = useState(0);
  const [userTier, setUserTier] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama" | "judul-asc" | "judul-desc">("terbaru");

  async function fetchBerita() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/berita");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memuat berita.");
      }
      const data = await res.json();
      setBeritaList(data);
      // Hitung pending untuk badge
      const pending = data.filter((b: Berita) => b.status === "pending").length;
      setPendingCount(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  // Deteksi tier via session endpoint
  useEffect(() => {
    fetch("/api/admin/session").then((r) => r.json()).then((d) => setUserTier(d?.tier ?? null)).catch(() => null);
  }, []);

  useEffect(() => {
    fetchBerita();
  }, []);

  const sortedBeritaList = beritaList.slice().sort((a, b) => {
    if (sortBy === "terbaru") return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    if (sortBy === "terlama") return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
    if (sortBy === "judul-asc") return a.judul.localeCompare(b.judul, "id", { sensitivity: "base" });
    if (sortBy === "judul-desc") return b.judul.localeCompare(a.judul, "id", { sensitivity: "base" });
    return 0;
  });

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
                {pendingCount} berita menunggu persetujuan Anda
              </p>
              <p className="text-xs text-orange-700">Diajukan oleh Admin RW atau Admin Kampung KB</p>
            </div>
          </div>
          <Link
            href="/admin/persetujuan/berita"
            className="shrink-0 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition-colors"
          >
            Review Sekarang
          </Link>
        </div>
      )}

      {/* Sort Control Bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-2xs">
        <span className="text-xs font-bold text-muted-foreground">
          Total: <strong className="text-foreground">{sortedBeritaList.length} Artikel</strong>
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="cms-berita-sort" className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            Urutkan:
          </label>
          <select
            id="cms-berita-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="terbaru">Terbaru (Tanggal ↓)</option>
            <option value="terlama">Terlama (Tanggal ↑)</option>
            <option value="judul-asc">Judul (A–Z)</option>
            <option value="judul-desc">Judul (Z–A)</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat data berita…
          </div>
        ) : sortedBeritaList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada berita yang diterbitkan.
          </div>
        ) : (
          sortedBeritaList.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2">
                  {b.judul}
                </h3>
                <BeritaBadge kategori={b.kategori} />
              </div>

              {/* Status badge */}
              {b.status && b.status !== "published" && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  STATUS_CONFIG[b.status]?.className ?? "bg-muted text-muted-foreground"
                }`}>
                  {STATUS_CONFIG[b.status]?.label ?? b.status}
                </span>
              )}

              {/* Catatan penolakan */}
              {b.status === "rejected" && b.reviewer_note && (
                <p className="text-xs text-destructive border border-destructive/20 rounded-lg px-3 py-2 bg-destructive/5">
                  <strong>Catatan:</strong> {b.reviewer_note}
                </p>
              )}

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

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                <Link
                  href={`/berita/${b.slug}`}
                  target="_blank"
                  className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
                >
                  Lihat ↗
                </Link>
                <Link
                  href={`/admin/berita/${b.id}/edit`}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id, b.judul)}
                  disabled={deletingId === b.id}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 shadow-2xs"
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
              <th className="px-4 py-3">Status</th>
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
            ) : sortedBeritaList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada berita yang diterbitkan.
                </td>
              </tr>
            ) : (
              sortedBeritaList.map((b) => (
                <tr key={b.id} className={`hover:bg-muted/30 transition-colors ${
                  b.status === "pending" ? "bg-orange-50/50" :
                  b.status === "rejected" ? "bg-destructive/5" : ""
                }`}>
                  <td className="px-4 py-3 max-w-md">
                    <div className="font-medium text-foreground truncate">{b.judul}</div>
                    {b.status === "rejected" && b.reviewer_note && (
                      <div className="text-xs text-destructive mt-0.5 truncate">Catatan: {b.reviewer_note}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <BeritaBadge kategori={b.kategori} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {b.cakupan === "kelurahan" ? "Kelurahan" : b.rw_nama || "RW"}
                  </td>
                  <td className="px-4 py-3">
                    {b.status && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        STATUS_CONFIG[b.status ?? "published"]?.className ?? "bg-muted text-muted-foreground"
                      }`}>
                        {STATUS_CONFIG[b.status ?? "published"]?.label ?? b.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(b.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/berita/${b.slug}`}
                        target="_blank"
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
                      >
                        Lihat ↗
                      </Link>
                      <Link
                        href={`/admin/berita/${b.id}/edit`}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id, b.judul)}
                        disabled={deletingId === b.id}
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 shadow-2xs"
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
