"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getPublicImageUrl } from "@/lib/image-url";
import type { PengumumanItem } from "@/lib/types";

export default function CmsPengumumanPage() {
  const [data, setData] = useState<PengumumanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pengumuman");
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

  const filteredAndSorted = useMemo(() => {
    let result = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) => item.judul.toLowerCase().includes(q) || item.target_pengumuman.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      if (sortOrder === "oldest") return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
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
      const res = await fetch(`/api/admin/pengumuman/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) => prev.filter((item) => item.id !== deleteId));
      }
    } catch {
      alert("Gagal menghapus pengumuman.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengumuman Kelurahan"
        description="Kelola pengumuman dan himbauan resmi untuk warga dan kelembagaan."
        actions={
          <Link
            href="/admin/pengumuman/tambah"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <span>+ Buat Pengumuman</span>
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs">
        <input
          type="text"
          placeholder="Cari pengumuman..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50 w-full sm:w-72"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-bold shrink-0">Urutkan:</span>
          <select
            value={sortOrder}
            onChange={(e: any) => setSortOrder(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="title-asc">Judul (A–Z)</option>
            <option value="title-desc">Judul (Z–A)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Memuat daftar pengumuman…
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Belum ada data pengumuman.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSorted.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-xs transition-all"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300">
                    🎯 Target: {item.target_pengumuman}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                    item.status === "published"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : item.status === "pending"
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }`}>
                    {item.status === "published" ? "Published" : item.status === "pending" ? "Menunggu Persetujuan" : "Ditolak"}
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-foreground leading-snug">{item.judul}</h3>
                <p className="text-xs text-muted-foreground">
                  📅 Tanggal: {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • Penulis: {item.penulis}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Link
                  href={`/admin/pengumuman/${item.id}/edit`}
                  className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-foreground">Hapus Pengumuman?</h3>
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
