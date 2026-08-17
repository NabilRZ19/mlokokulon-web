"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { Badge } from "@/components/ui/Badge";

interface AdminUser {
  id: number;
  nama: string;
  email: string;
  tier: 1 | 2 | 3 | 4;
}

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1: Super Admin",
  2: "Tier 2: Admin Kelurahan",
  3: "Tier 3: Admin RW",
  4: "Tier 4: Admin Kampung KB",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memuat daftar admin.");
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleDelete(id: number, nama: string) {
    if (!confirm(`Hapus akun admin untuk "${nama}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menghapus admin.");
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Kelola Akun Admin"
        actions={
          <>
            <RefreshButton onClick={fetchUsers} />
            <Link
              href="/admin/users/tambah"
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-primary/90 transition-colors"
            >
              + Tambah Admin
            </Link>
          </>
        }
      />

      <p className="mb-4 text-xs text-muted-foreground font-medium">
        Halaman pengelolaan akun admin (Tier 1 &amp; Tier 2). Pengelolaan hak akses 3-tier kelurahan.
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
            Memuat akun admin…
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada akun terdaftar.
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    <Link href={`/admin/users/${u.id}/edit`} className="hover:text-primary hover:underline transition-colors">
                      {u.nama}
                    </Link>
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{u.email}</p>
                </div>
                <Badge variant={u.tier === 1 ? "accent" : "default"}>
                  {TIER_LABEL[u.tier] || `Tier ${u.tier}`}
                </Badge>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Link
                  href={`/admin/users/${u.id}/edit`}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(u.id, u.nama)}
                  disabled={deletingId === u.id}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 shadow-2xs"
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
              <th className="px-4 py-3">Nama Admin</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Akses Tier</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat akun admin…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada akun terdaftar.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">
                    <Link href={`/admin/users/${u.id}/edit`} className="hover:text-primary hover:underline transition-colors">
                      {u.nama}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.tier === 1 ? "accent" : "default"}>
                      {TIER_LABEL[u.tier] || `Tier ${u.tier}`}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${u.id}/edit`}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.nama)}
                        disabled={deletingId === u.id}
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50 shadow-2xs"
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
