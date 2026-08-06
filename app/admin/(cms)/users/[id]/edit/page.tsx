"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface AdminUser {
  id: number;
  nama: string;
  email: string;
  tier: 1 | 2 | 3;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState<1 | 2 | 3>(2);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) throw new Error("Gagal memuat data akun admin.");
        const data: AdminUser = await res.json();
        setNama(data.nama);
        setEmail(data.email);
        setTier(data.tier);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nama.trim() || !email.trim() || !password.trim()) {
      setError("Seluruh field wajib diisi, termasuk password baru.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter untuk keamanan akun admin.");
      return;
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      setError("Password harus mengombinasikan huruf dan angka.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, tier: Number(tier) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memperbarui akun admin.");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Memuat data akun…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Edit Akun Admin" />

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
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold text-foreground">
              Password Baru <span className="text-destructive">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 karakter, kombinasi huruf & angka"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Password <strong>wajib diisi ulang</strong> setiap kali edit. Tidak ada opsi kosong-berarti-tetap.
            </p>
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
            {submitting ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
