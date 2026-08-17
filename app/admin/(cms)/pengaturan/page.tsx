"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { getPublicImageUrl } from "@/lib/image-url";
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

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat struktur kelurahan…
          </div>
        ) : strukturList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada data perangkat kelurahan.
          </div>
        ) : (
          strukturList.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPublicImageUrl(s.foto_url)}
                  alt={s.nama}
                  className="h-12 w-12 rounded-xl object-contain bg-muted border border-border shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-sm font-bold text-foreground truncate">
                    <Link href={`/admin/pengaturan/${s.id}/edit`} className="hover:text-primary hover:underline transition-colors">
                      {s.nama}
                    </Link>
                  </h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">{s.jabatan}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  Urutan #{s.urutan}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Link
                  href={`/admin/pengaturan/${s.id}/edit`}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id, s.nama)}
                  disabled={deletingId === s.id}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 shadow-2xs"
                >
                  {deletingId === s.id ? "Hapus…" : "Hapus"}
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
              <th className="px-4 py-3">Foto Profile</th>
              <th className="px-4 py-3">Nama Pejabat</th>
              <th className="px-4 py-3">Jabatan Kelurahan</th>
              <th className="px-4 py-3">Urutan Bagan</th>
              <th className="px-4 py-3 text-right">Aksi</th>
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
                      src={getPublicImageUrl(s.foto_url)}
                      alt={s.nama}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground">
                    <Link href={`/admin/pengaturan/${s.id}/edit`} className="hover:text-primary hover:underline transition-colors">
                      {s.nama}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-muted-foreground">{s.jabatan}</td>
                  <td className="px-4 py-3 font-semibold text-primary">#{s.urutan}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pengaturan/${s.id}/edit`}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.nama)}
                        disabled={deletingId === s.id}
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 shadow-2xs"
                      >
                        {deletingId === s.id ? "Hapus…" : "Hapus"}
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
