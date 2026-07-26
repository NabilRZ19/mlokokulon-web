"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import type { StrukturKelurahan } from "@/lib/types";

export default function AdminPengaturanPage() {
  const [strukturList, setStrukturList] = useState<StrukturKelurahan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchStruktur() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/struktur");
      if (!res.ok) throw new Error("Gagal memuat struktur kelurahan.");
      const data = await res.json();
      setStrukturList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStruktur();
  }, []);

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Hapus jabatan untuk "${nama}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/struktur/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus.");
      setStrukturList((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Struktur Perangkat Kelurahan"
        actions={
          <>
            <RefreshButton onClick={fetchStruktur} />
            <Link
              href="/admin/pengaturan/tambah"
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-primary/90 transition-colors"
            >
              + Tambah Jabatan / Pejabat
            </Link>
          </>
        }
      />

      <p className="mb-4 text-xs text-muted-foreground font-medium">
        Dikelola oleh Tier 1 (Super Admin) &amp; Tier 2 (Admin Kelurahan). Urutan menentukan posisi pada bagan struktur kelurahan.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Foto</th>
              <th className="px-4 py-3 font-semibold">Nama Pejabat</th>
              <th className="px-4 py-3 font-semibold">Jabatan</th>
              <th className="px-4 py-3 font-semibold">Urutan</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat struktur kelurahan…
                </td>
              </tr>
            ) : strukturList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada data perangkat kelurahan.
                </td>
              </tr>
            ) : (
              strukturList.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.foto_url}
                      alt={s.nama}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{s.nama}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.jabatan}</td>
                  <td className="px-4 py-3 text-muted-foreground font-semibold">{s.urutan}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.nama)}
                      disabled={deletingId === s.id}
                      className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                    >
                      {deletingId === s.id ? "Hapus…" : "Hapus"}
                    </button>
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
