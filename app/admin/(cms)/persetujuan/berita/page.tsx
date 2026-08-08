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
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
          <div className="text-3xl">✅</div>
          <p className="text-sm font-semibold text-foreground">Tidak ada berita yang menunggu persetujuan</p>
          <p className="text-xs text-muted-foreground">Semua konten berita sudah diproses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((item) => (
            <div key={item.id} className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 shadow-xs space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <BeritaBadge kategori={item.kategori as any} />
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                      ⏳ Menunggu Persetujuan
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2">{item.judul}</h3>
                </div>
                {item.gambar_cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.gambar_cover_url}
                    alt={item.judul}
                    className="h-16 w-24 rounded-lg object-cover border border-border shrink-0"
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
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-orange-200">
                <Link
                  href={`/berita/${item.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Preview Berita ↗
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(item, "reject")}
                    className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal(item, "approve")}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
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
