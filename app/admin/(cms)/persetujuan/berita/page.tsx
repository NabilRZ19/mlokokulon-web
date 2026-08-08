"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { ApprovalModal } from "@/components/admin/ApprovalModal";
import { BeritaBadge } from "@/components/berita/BeritaBadge";

interface PendingBerita {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  cakupan: string;
  rw_nama?: string;
  penulis: string;
  tanggal: string;
  gambar_cover_url: string;
  submitted_by_tier?: number;
  pengusul?: string;
  created_by: string;
  status: string;
}

const TIER_LABEL: Record<number, string> = {
  3: "Tier 3 — Admin RW",
  4: "Tier 4 — Admin Kampung KB",
};

export default function PersetujuanBeritaPage() {
  const [list, setList] = useState<PendingBerita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [selectedItem, setSelectedItem] = useState<PendingBerita | null>(null);
  const [processing, setProcessing] = useState(false);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/persetujuan/berita");
      if (!res.ok) throw new Error("Gagal memuat daftar berita pending.");
      const data = await res.json();
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchList(); }, []);

  function openModal(item: PendingBerita, action: "approve" | "reject") {
    setSelectedItem(item);
    setModalAction(action);
    setModalOpen(true);
  }

  async function handleConfirm(note: string) {
    if (!selectedItem) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/persetujuan/berita/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalAction, note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memproses.");
      }
      setModalOpen(false);
      setList((prev) => prev.filter((item) => item.id !== selectedItem.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setProcessing(false);
      setSelectedItem(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Persetujuan Berita"
        actions={
          <>
            <RefreshButton onClick={fetchList} />
            <Link
              href="/admin/berita"
              className="rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              ← Kembali ke Berita
            </Link>
          </>
        }
      />

      <p className="mb-4 text-xs text-muted-foreground font-medium">
        Konten berita yang diajukan oleh Admin RW (Tier 3) atau Admin Kampung KB (Tier 4) dan menunggu persetujuan Anda.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Memuat daftar berita pending…
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3 shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-bold text-foreground font-heading">Tidak Ada Berita Menunggu Persetujuan</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">Seluruh pengajuan berita dari Admin RW (Tier 3) dan Admin Kampung KB (Tier 4) telah diproses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((item) => (
            <div key={item.id} className="rounded-2xl border border-orange-200 bg-orange-50/30 p-4 sm:p-5 shadow-xs space-y-4">
              {/* Header Info */}
              <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <BeritaBadge kategori={item.kategori as any} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-800 border border-orange-200">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Menunggu Persetujuan</span>
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground leading-snug">{item.judul}</h3>
                </div>
                {item.gambar_cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.gambar_cover_url}
                    alt={item.judul}
                    className="h-36 w-full sm:h-20 sm:w-32 rounded-xl object-cover border border-border shrink-0 shadow-2xs"
                  />
                )}
              </div>

              {/* Info Pengusul */}
              <div className="rounded-lg border border-orange-200 bg-white/60 p-3 space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-orange-700 mb-1.5">Informasi Pengusul</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-foreground">
                  <div><span className="text-muted-foreground">Pengusul:</span> <strong>{item.pengusul || item.penulis || "-"}</strong></div>
                  <div><span className="text-muted-foreground">Penulis:</span> {item.penulis}</div>
                  <div><span className="text-muted-foreground">Tier Admin:</span> {TIER_LABEL[item.submitted_by_tier ?? 3] ?? "-"}</div>
                  <div><span className="text-muted-foreground">Cakupan:</span> {item.cakupan === "kelurahan" ? "Kelurahan" : item.rw_nama || "RW"}</div>
                  <div><span className="text-muted-foreground">Tanggal:</span> {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-orange-200">
                <Link
                  href={`/admin/persetujuan/berita/${item.id}/preview`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>Preview Konten Lengkap</span>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => openModal(item, "reject")}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal(item, "approve")}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApprovalModal
        isOpen={modalOpen}
        title={selectedItem?.judul ?? ""}
        action={modalAction}
        onClose={() => { setModalOpen(false); setSelectedItem(null); }}
        onConfirm={handleConfirm}
        isLoading={processing}
      />
    </div>
  );
}
