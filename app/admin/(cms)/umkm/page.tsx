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

  async function fetchUmkm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/umkm");
      if (!res.ok) throw new Error("Gagal memuat UMKM.");
      const data = await res.json();
      setUmkmList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUmkm();
  }, []);

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
        title="UMKM & Potensi Desa"
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

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat data UMKM…
          </div>
        ) : umkmList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada profil UMKM yang terdaftar.
          </div>
        ) : (
          umkmList.map((u) => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">{u.nama}</h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">{u.kategori}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  {u.kontak}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2 gap-2">
                <span className="font-semibold text-foreground">{u.lokasi || "RW 05 — Pencil"}</span>
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
              <th className="px-4 py-3">Jam Operasional</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat data UMKM…
                </td>
              </tr>
            ) : umkmList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada profil UMKM yang terdaftar.
                </td>
              </tr>
            ) : (
              umkmList.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">{u.nama}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    Kategori: <strong className="font-extrabold">{u.kategori}</strong>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    Kontak: <strong className="font-extrabold">{u.kontak}</strong>
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
