"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import type { Rw } from "@/lib/types";

export default function AdminWilayahPage() {
  const [rwList, setRwList] = useState<Rw[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchWilayah() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/wilayah");
      if (!res.ok) throw new Error("Gagal memuat data wilayah RW.");
      const data = await res.json();
      setRwList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWilayah();
  }, []);

  async function handleDelete(id: string, namaRw: string) {
    if (!confirm(`Hapus "${namaRw}" dari database? Berita terkait RW ini tetap ada (rw_id akan jadi kosong).`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/wilayah/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menghapus RW.");
      }
      setRwList((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Wilayah Administratif (RW)" actions={<RefreshButton onClick={fetchWilayah} />} />

      <p className="mb-4 text-xs text-muted-foreground font-medium">
        Tier 1 &amp; Tier 3 — Pilih RW dari daftar di bawah ini untuk memperbarui data statistik, potensi, maupun susunan pengurus RW.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat data RW…
          </div>
        ) : rwList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada data RW terdaftar.
          </div>
        ) : (
          rwList.map((rw) => (
            <div key={rw.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">{rw.nama_rw}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Dusun {rw.cakupan_dusun}</p>
                </div>
                {rw.is_kampung_kb ? (
                  <Badge variant="accent">★ Kampung KB</Badge>
                ) : (
                  <span className="text-[11px] font-semibold text-muted-foreground">Reguler</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2">
                <span>Total: <strong className="text-foreground">{rw.jumlah_rt} RT</strong></span>
                <span>Statistik: <strong className="text-foreground">{rw.statistik.jumlah_kk} KK / {rw.statistik.jumlah_jiwa} Jiwa</strong></span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Link
                  href={`/admin/wilayah/${rw.id}/edit`}
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(rw.id, rw.nama_rw)}
                  disabled={deletingId === rw.id}
                  className="rounded-lg bg-destructive/10 px-3.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
                >
                  {deletingId === rw.id ? "Hapus…" : "Hapus"}
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
              <th className="px-4 py-3 font-semibold">Nama RW</th>
              <th className="px-4 py-3 font-semibold">Dusun</th>
              <th className="px-4 py-3 font-semibold">Jumlah RT</th>
              <th className="px-4 py-3 font-semibold">Statistik (KK / Jiwa)</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat data RW…
                </td>
              </tr>
            ) : rwList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada data RW terdaftar.
                </td>
              </tr>
            ) : (
              rwList.map((rw) => (
                <tr key={rw.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{rw.nama_rw}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rw.cakupan_dusun}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rw.jumlah_rt} RT</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {rw.statistik.jumlah_kk} KK / {rw.statistik.jumlah_jiwa} Jiwa
                  </td>
                  <td className="px-4 py-3">
                    {rw.is_kampung_kb ? (
                      <Badge variant="accent">★ Kampung KB</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Reguler</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/wilayah/${rw.id}/edit`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(rw.id, rw.nama_rw)}
                        disabled={deletingId === rw.id}
                        className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                      >
                        {deletingId === rw.id ? "Hapus…" : "Hapus"}
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
