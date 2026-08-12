"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { KampungKbIcon } from "@/components/ui/icons";
import type { Rw } from "@/lib/types";

export default function AdminWilayahPage() {
  const [rwList, setRwList] = useState<Rw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setUserTier(d?.tier ?? null))
      .catch(() => null);
  }, []);

  async function fetchWilayah() {
    setLoading(true);
    setError(null);
    try {
      const [rwRes, countsRes] = await Promise.all([
        fetch("/api/admin/wilayah"),
        fetch("/api/admin/persetujuan/counts"),
      ]);

      if (!rwRes.ok) throw new Error("Gagal memuat data wilayah RW.");
      const rwData = await rwRes.json();
      setRwList(rwData);

      if (countsRes.ok) {
        const counts = await countsRes.json();
        setPendingCount(counts.wilayah ?? 0);
      }
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
    <div className="space-y-6">
      <AdminPageHeader title="Wilayah Administratif (RW)" actions={<RefreshButton onClick={fetchWilayah} />} />

      {/* Banner Persetujuan — hanya Tier 1 & 2 */}
      {(userTier === 1 || userTier === 2) && pendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 border border-orange-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-orange-900">
                {pendingCount} Pengajuan Perubahan Wilayah / Ketua RW Menunggu Persetujuan Anda
              </p>
              <p className="text-[11px] text-orange-700">Diajukan oleh Admin RW</p>
            </div>
          </div>
          <Link
            href="/admin/persetujuan/wilayah"
            className="shrink-0 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-orange-700 transition-colors shadow-xs"
          >
            Review &amp; Setujui →
          </Link>
        </div>
      )}

      <p className="text-xs text-muted-foreground font-medium">
        Pilih RW dari daftar di bawah ini untuk memperbarui data statistik, potensi, maupun susunan pengurus RW.
      </p>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
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
                  <Badge variant="accent" className="inline-flex items-center gap-1">
                    <KampungKbIcon className="h-3 w-3 fill-current" />
                    <span>Kampung KB</span>
                  </Badge>
                ) : (
                  <span className="text-[11px] font-semibold text-muted-foreground">Reguler</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2">
                <span>Total: <strong className="text-foreground">{rw.jumlah_rt} RT</strong></span>
                <span>Statistik: <strong className="text-foreground">{rw.statistik.jumlah_kk} KK / {rw.statistik.jumlah_jiwa} Jiwa</strong></span>
              </div>

              <div className="flex items-center justify-end pt-1 border-t border-border/50">
                <Link
                  href={`/admin/wilayah/${rw.id}/edit`}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                >
                  Edit Data RW
                </Link>
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
              <th className="px-4 py-3">Nama RW</th>
              <th className="px-4 py-3">Cakupan Dusun</th>
              <th className="px-4 py-3">Jumlah RT</th>
              <th className="px-4 py-3">Statistik Demografi</th>
              <th className="px-4 py-3">Status Wilayah</th>
              <th className="px-4 py-3 text-right">Aksi</th>
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
                  <td className="px-4 py-3 font-bold text-foreground">{rw.nama_rw}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{rw.cakupan_dusun}</td>
                  <td className="px-4 py-3 text-foreground">{rw.jumlah_rt} RT</td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {rw.statistik.jumlah_kk} KK / {rw.statistik.jumlah_jiwa} Jiwa
                  </td>
                  <td className="px-4 py-3">
                    {rw.is_kampung_kb ? (
                      <Badge variant="accent" className="inline-flex items-center gap-1">
                        <KampungKbIcon className="h-3 w-3 fill-current" />
                        <span>Kampung KB</span>
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Reguler</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/admin/wilayah/${rw.id}/edit`}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-2xs"
                      >
                        Edit
                      </Link>
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
