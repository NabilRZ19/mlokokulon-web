"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function TambahUserPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState<1 | 2 | 3>(2);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nama.trim() || !email.trim() || !password.trim()) {
      setError("Seluruh field wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          email,
          password,
          tier: Number(tier),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal membuat akun admin.");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Tambah Akun Admin Baru" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div>
            <label htmlFor="nama" className="mb-1 block text-sm font-bold text-foreground">
              Nama Pengelola <span className="text-destructive">*</span>
            </label>
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama pengelola / perangkat"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold text-foreground">
              Email Login <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mlokokulon-ngadirojo.com"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold text-foreground">
              Password Login <span className="text-destructive">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label htmlFor="tier" className="mb-1 block text-sm font-bold text-foreground">
              Tingkat Akses (Tier) <span className="text-destructive">*</span>
            </label>
            <select
              id="tier"
              value={tier}
              onChange={(e) => setTier(Number(e.target.value) as 1 | 2 | 3)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value={1}>Tier 1: Super Admin (Akses Penuh + Kelola Akun Admin)</option>
              <option value={2}>Tier 2: Admin Kelurahan (CRUD Berita, Galeri, UMKM, Struktur)</option>
              <option value={3}>Tier 3: Admin RW (CRUD Berita, Galeri, UMKM, Edit Wilayah RW)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Membuat Akun…" : "Buat Akun Admin"}
          </button>
        </div>
      </form>
    </div>
  );
}
