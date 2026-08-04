"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface LayananItem {
  id: string;
  nama: string;
  kategori: string;
  deskripsi: string;
  persyaratan: string[];
  prosedur: string[];
  waktuProses: string;
  biaya: string;
  kontakPenanggungJawab?: string;
  urutan: number;
}

function IconClock() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-primary shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-emerald-700 shrink-0"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

export default function LayananAdminPage() {
  const [layananList, setLayananList] = useState<LayananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLayanan();
  }, []);

  async function fetchLayanan() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/layanan");
      if (!res.ok) throw new Error("Gagal mengambil daftar layanan.");
      const data = await res.json();
      setLayananList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${nama}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/layanan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus layanan.");
      setLayananList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kelola Layanan Kelurahan"
        actions={
          <Link
            href="/admin/layanan/tambah"
            className="rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
          >
            + Tambah Layanan Baru
          </Link>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Memuat data layanan…
          </div>
        ) : layananList.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum Ada Data Layanan
          </div>
        ) : (
          layananList.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">{item.nama}</h3>
                  <span className="inline-block mt-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {item.kategori}
                  </span>
                </div>
                <span className="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800 shrink-0">
                  {item.biaya}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{item.deskripsi}</p>

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50 gap-2">
                <span>Proses: <strong className="text-foreground">{item.waktuProses}</strong></span>
                <span>{item.persyaratan.length} Syarat · {item.prosedur.length} Langkah</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Link
                  href={`/admin/layanan/${item.id}/edit`}
                  className="rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.nama)}
                  disabled={deletingId === item.id}
                  className="rounded-lg bg-destructive/10 px-3.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
                >
                  {deletingId === item.id ? "Hapus…" : "Hapus"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Memuat data layanan…</div>
        ) : layananList.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-bold text-foreground">Belum Ada Data Layanan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Klik tombol di bawah untuk menambahkan jenis layanan publik baru.
            </p>
            <Link
              href="/admin/layanan/tambah"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
            >
              + Tambah Layanan
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">No</th>
                  <th className="px-5 py-3.5">Nama Layanan</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Waktu &amp; Biaya</th>
                  <th className="px-5 py-3.5 text-center">Syarat &amp; Prosedur</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {layananList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 text-center font-bold text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-heading font-extrabold text-foreground">{item.nama}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        <strong className="font-bold text-foreground">Deskripsi:</strong> {item.deskripsi}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium space-y-1">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <IconClock />
                        <span>Waktu: <strong className="font-extrabold text-foreground">{item.waktuProses}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <IconTag />
                        <span>Biaya: <strong className="font-extrabold text-emerald-800">{item.biaya}</strong></span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center text-xs">
                      <span className="inline-block rounded-md bg-muted px-2.5 py-1 font-semibold text-foreground border border-border/60">
                        <strong className="font-bold text-primary">{item.persyaratan?.length || 0}</strong> Syarat · <strong className="font-bold text-primary">{item.prosedur?.length || 0}</strong> Langkah
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/layanan/${item.id}/edit`}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id, item.nama)}
                          className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 disabled:opacity-50"
                        >
                          {deletingId === item.id ? "..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
