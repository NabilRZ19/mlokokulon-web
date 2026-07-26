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

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
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
                    <Link
                      href={`/admin/wilayah/${rw.id}/edit`}
                      className="rounded bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      Edit Data
                    </Link>
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
