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

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Usaha</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Kontak</th>
              <th className="px-4 py-3 font-semibold">Jam Operasional</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
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
                  <td className="px-4 py-3 font-medium text-foreground">{u.nama}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.kategori}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.kontak}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.jam_operasional}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/umkm/${u.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Lihat
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
