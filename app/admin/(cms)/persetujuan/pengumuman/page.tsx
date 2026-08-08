"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalModal } from "@/components/admin/ApprovalModal";
import type { PengumumanItem } from "@/lib/types";

const TIER_LABEL: Record<number, string> = {
  3: "Tier 3 — Admin RW",
  4: "Tier 4 — Admin Kampung KB",
};

export default function PersetujuanPengumumanPage() {
  const [data, setData] = useState<PengumumanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<PengumumanItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function fetchPendingList() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/persetujuan/pengumuman");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingList();
  }, []);

  function openModal(item: PengumumanItem, action: "approve" | "reject") {
    setSelectedItem(item);
    setActionType(action);
    setModalOpen(true);
  }

  async function handleConfirm(note: string) {
    if (!selectedItem) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/persetujuan/pengumuman/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType, note }),
      });

      if (res.ok) {
        setData((prev) => prev.filter((i) => i.id !== selectedItem.id));
        setModalOpen(false);
      } else {
        alert("Gagal memproses persetujuan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Persetujuan Pengumuman"
        description="Daftar pengajuan pengumuman dari Admin RW / Kampung KB yang memerlukan verifikasi Admin Kelurahan."
      />

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Memuat daftar pengajuan pengumuman…
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Tidak ada pengajuan pengumuman yang menunggu persetujuan.
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-orange-200/80 pb-3">
                <div className="space-y-1">
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-800 border border-orange-300">
                    ⏳ Menunggu Persetujuan
                  </span>
                  <h3 className="font-heading text-base font-bold text-foreground leading-snug">{item.judul}</h3>
                  <p className="text-xs text-muted-foreground">🎯 Target: {item.target_pengumuman}</p>
                </div>

                <div className="text-xs text-muted-foreground font-medium shrink-0">
                  Pengusul: <strong className="text-foreground">{item.pengusul || item.penulis}</strong> ({TIER_LABEL[item.submitted_by_tier ?? 3] ?? "-"})
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.isi}</p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-orange-200">
                <Link
                  href={`/admin/persetujuan/pengumuman/${item.id}/preview`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>Preview Pengumuman Lengkap</span>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(item, "reject")}
                    className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal(item, "approve")}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                  >
                    Setujui
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
        action={actionType}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isLoading={processing}
      />
    </div>
  );
}
