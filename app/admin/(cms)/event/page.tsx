"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CalendarIcon, ClockIcon, MapPinIcon } from "@/components/admin/icons";
import type { EventItem } from "@/lib/types";

export default function CmsEventPage() {
  const [data, setData] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [userTier, setUserTier] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/session").then((r) => r.json()).then((d) => setUserTier(d?.tier ?? null)).catch(() => null);
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/event");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  const pendingCount = useMemo(() => {
    return data.filter((item) => item.status === "pending").length;
  }, [data]);

  const filteredAndSorted = useMemo(() => {
    let result = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) => item.judul.toLowerCase().includes(q) || item.lokasi.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortOrder === "newest") return new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime();
      if (sortOrder === "oldest") return new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime();
      if (sortOrder === "title-asc") return a.judul.localeCompare(b.judul);
      if (sortOrder === "title-desc") return b.judul.localeCompare(a.judul);
      return 0;
    });

    return result;
  }, [data, search, sortOrder]);

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/event/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) => prev.filter((item) => item.id !== deleteId));
      }
    } catch {
      alert("Gagal menghapus event.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Event Mendatang"
        description="Kelola jadwal kegiatan, musyawarah, dan agenda kerja kelurahan."
        actions={
          <Link
            href="/admin/event/tambah"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <span>+ Buat Agenda Event</span>
          </Link>
        }
      />

      {/* Banner Persetujuan — hanya Tier 1 & 2 */}
      {(userTier === 1 || userTier === 2) && pendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 border border-orange-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-orange-900">
                {pendingCount} Agenda Event Menunggu Persetujuan Anda
              </p>
              <p className="text-[11px] text-orange-700">Diajukan oleh Admin RW atau Admin Kelurahan</p>
            </div>
          </div>
          <Link
            href="/admin/persetujuan/event"
            className="shrink-0 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-700 transition-colors shadow-xs"
          >
            Review &amp; Setujui →
          </Link>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs">
        <input
          type="text"
          placeholder="Cari event atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-72"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-bold shrink-0">Urutkan:</span>
          <select
            value={sortOrder}
            onChange={(e: any) => setSortOrder(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="newest">Terdekat</option>
            <option value="oldest">Terjauh</option>
            <option value="title-asc">Judul (A–Z)</option>
            <option value="title-desc">Judul (Z–A)</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat daftar event…
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada agenda event.
          </div>
        ) : (
          filteredAndSorted.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 space-y-3 shadow-xs transition-colors ${
                item.status === "pending"
                  ? "border-orange-200 bg-orange-50/30"
                  : item.status === "rejected"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2">
                  <Link href={`/admin/event/${item.id}/edit`} className="hover:text-primary hover:underline transition-colors">
                    {item.judul}
                  </Link>
                </h3>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  item.status === "published"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : item.status === "pending"
                    ? "bg-orange-100 text-orange-800 border-orange-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }`}>
                  {item.status === "published" ? "Published" : item.status === "pending" ? "Menunggu Persetujuan" : "Ditolak"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-emerald-800">Lokasi: {item.lokasi}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2">
                <span>{item.tanggal_mulai} · {item.jam_mulai}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                <Link
                  href={`/admin/event/${item.id}/edit`}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors shadow-2xs"
                >
                  Hapus
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
              <th className="px-4 py-3">Nama Agenda Event</th>
              <th className="px-4 py-3">Lokasi Acara</th>
              <th className="px-4 py-3">Waktu &amp; Tanggal</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat daftar event…
                </td>
              </tr>
            ) : filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada agenda event.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((item) => (
                <tr key={item.id} className={`hover:bg-muted/30 transition-colors ${
                  item.status === "pending" ? "bg-orange-50/50" :
                  item.status === "rejected" ? "bg-destructive/5" : ""
                }`}>
                  <td className="px-4 py-3 font-medium text-foreground max-w-md">
                    <div className="font-bold text-foreground truncate">
                      <Link href={`/admin/event/${item.id}/edit`} className="hover:text-primary hover:underline transition-colors">
                        {item.judul}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-800">
                    {item.lokasi}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {item.tanggal_mulai} {item.tanggal_selesai && item.tanggal_selesai !== item.tanggal_mulai ? `s/d ${item.tanggal_selesai}` : ""} ({item.jam_mulai})
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      item.status === "published" ? "bg-emerald-100 text-emerald-700" :
                      item.status === "pending" ? "bg-orange-100 text-orange-700" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {item.status === "published" ? "Published" : item.status === "pending" ? "Menunggu Persetujuan" : "Ditolak"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/event/${item.id}/edit`}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(item.id)}
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors shadow-2xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-foreground">Hapus Agenda Event?</h3>
            <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleting ? "Hapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
