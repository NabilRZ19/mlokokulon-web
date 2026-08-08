"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import type { Umkm } from "@/lib/types";

export default function AdminUmkmPage() {
  const [umkmList, setUmkmList] = useState<Umkm[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [userTier, setUserTier] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama" | "nama-asc" | "nama-desc">("terbaru");

  async function fetchUmkm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/umkm");
      if (!res.ok) throw new Error("Gagal memuat UMKM.");
      const data = await res.json();
      setUmkmList(data);
      const pending = data.filter((u: Umkm) => u.status === "pending").length;
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
    fetchUmkm();
  }, []);

  const sortedUmkmList = umkmList.slice().sort((a, b) => {
    if (sortBy === "terbaru") return b.id.localeCompare(a.id);
    if (sortBy === "terlama") return a.id.localeCompare(b.id);
    if (sortBy === "nama-asc") return a.nama.localeCompare(b.nama, "id", { sensitivity: "base" });
    if (sortBy === "nama-desc") return b.nama.localeCompare(a.nama, "id", { sensitivity: "base" });
    return 0;
  });

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Hapus UMKM "${nama}" dari database?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/umkm/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus UMKM.");
      setUmkmList((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="UMKM & Potensi Kelurahan"
        actions={
          <>
            <RefreshButton onClick={fetchUmkm} />
            <Link
              href="/admin/umkm/tambah"
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-primary/90 transition-colors"
            >
              + Tambah UMKM
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
                {pendingCount} profil UMKM menunggu persetujuan Anda
              </p>
              <p className="text-xs text-orange-700">Diajukan oleh Admin RW atau Admin Kampung KB</p>
            </div>
          </div>
          <Link
            href="/admin/persetujuan/umkm"
            className="shrink-0 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition-colors"
          >
            Review Sekarang
          </Link>
        </div>
      )}

      {/* Sort Control Bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-2xs">
        <span className="text-xs font-bold text-muted-foreground">
          Total: <strong className="text-foreground">{sortedUmkmList.length} Usaha</strong>
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="cms-umkm-sort" className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            Urutkan:
          </label>
          <select
            id="cms-umkm-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="terbaru">Terbaru (Default)</option>
            <option value="terlama">Terlama</option>
            <option value="nama-asc">Nama Usaha (A–Z)</option>
            <option value="nama-desc">Nama Usaha (Z–A)</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat data UMKM…
          </div>
        ) : sortedUmkmList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada profil UMKM yang terdaftar.
          </div>
        ) : (
          sortedUmkmList.map((u) => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-heading text-sm font-bold text-foreground">{u.nama}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      u.status === "pending"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : u.status === "rejected"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}>
                      {u.status === "pending" ? "⏳ Pending" : u.status === "rejected" ? "✕ Ditolak" : "✓ Published"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-primary mt-0.5">{u.kategori}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary shrink-0">
                  {u.kontak || "UMKM"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2 gap-2">
                <span className="font-semibold text-foreground">{u.lokasi || "Kelurahan Mlokomanis Kulon"}</span>
                <span>{u.jam_operasional}</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Link
                  href={`/umkm/${u.slug}`}
                  target="_blank"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Lihat ↗
                </Link>
                <Link
                  href={`/admin/umkm/${u.id}/edit`}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(u.id, u.nama)}
                  disabled={deletingId === u.id}
                  className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
                >
                  {deletingId === u.id ? "Hapus…" : "Hapus"}
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
              <th className="px-4 py-3">Nama Usaha</th>
              <th className="px-4 py-3">Kategori Usaha</th>
              <th className="px-4 py-3">Kontak / WA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Jam Operasional</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat data UMKM…
                </td>
              </tr>
            ) : sortedUmkmList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada profil UMKM yang terdaftar.
                </td>
              </tr>
            ) : (
              sortedUmkmList.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">{u.nama}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    Kategori: <strong className="font-extrabold">{u.kategori}</strong>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    Kontak: <strong className="font-extrabold">{u.kontak}</strong>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      u.status === "published" ? "bg-emerald-100 text-emerald-700" :
                      u.status === "pending" ? "bg-orange-100 text-orange-700" :
                      u.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {u.status === "pending" ? "Menunggu" : u.status === "rejected" ? "Ditolak" : "Published"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    Jam: <strong className="font-bold">{u.jam_operasional}</strong>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/umkm/${u.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Lihat
                      </Link>
                      <Link
                        href={`/admin/umkm/${u.id}/edit`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.nama)}
                        disabled={deletingId === u.id}
                        className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                      >
                        {deletingId === u.id ? "Hapus…" : "Hapus"}
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
