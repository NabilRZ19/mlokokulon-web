"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { ApprovalModal } from "@/components/admin/ApprovalModal";

interface PendingWilayah {
  id: number;
  rw_id: string;
  rw_nama: string;
  diajukan_oleh_nama: string;
  pengusul: string;
  ketua_nama_baru: string;
  ketua_foto_url_baru?: string;
  status: string;
  reviewer_note?: string;
  created_at: string;
}

export default function PersetujuanWilayahPage() {
  const [list, setList] = useState<PendingWilayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [selectedItem, setSelectedItem] = useState<PendingWilayah | null>(null);
  const [processing, setProcessing] = useState(false);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/persetujuan/wilayah");
      if (!res.ok) throw new Error("Gagal memuat daftar pengajuan Ketua RW.");
      const data = await res.json();
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchList(); }, []);

  function openModal(item: PendingWilayah, action: "approve" | "reject") {
    setSelectedItem(item);
    setModalAction(action);
    setModalOpen(true);
  }

  async function handleConfirm(note: string) {
    if (!selectedItem) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/persetujuan/wilayah/${selectedItem.id}`, {
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
        title="Persetujuan Perubahan Ketua RW"
        actions={
          <>
            <RefreshButton onClick={fetchList} />
            <Link
              href="/admin/wilayah"
              className="rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              ← Kembali ke Wilayah
            </Link>
          </>
        }
      />

      <p className="mb-4 text-xs text-muted-foreground font-medium">
        Pengajuan perubahan Ketua RW yang diajukan oleh Admin RW/Kampung KB dan menunggu persetujuan. Jika disetujui, nama dan foto Ketua RW akan langsung diperbarui.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Memuat daftar pengajuan…
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
          <div className="text-3xl">✅</div>
          <p className="text-sm font-semibold text-foreground">Tidak ada pengajuan perubahan Ketua RW yang menunggu</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((item) => (
            <div key={item.id} className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 shadow-xs space-y-3">
              <div className="flex items-start gap-4">
                {/* Foto Baru */}
                {item.ketua_foto_url_baru && (
                  <div className="shrink-0 h-16 w-16 rounded-full border-2 border-orange-300 bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.ketua_foto_url_baru} alt="Foto Ketua Baru" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                      ⏳ Menunggu Persetujuan
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    {item.rw_nama} — Perubahan Ketua RW
                  </h3>
                  <p className="text-sm text-foreground mt-1">
                    Ketua Baru: <strong className="text-primary">{item.ketua_nama_baru}</strong>
                  </p>
                </div>
              </div>

              {/* Info Pengusul */}
              <div className="rounded-lg border border-orange-200 bg-white/60 p-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-orange-700 mb-1.5">Informasi Pengusul</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-foreground">
                  <div><span className="text-muted-foreground">Pengusul:</span> <strong>{item.pengusul}</strong></div>
                  <div><span className="text-muted-foreground">Admin Pengusul:</span> {item.diajukan_oleh_nama}</div>
                  <div>
                    <span className="text-muted-foreground">Tanggal Pengajuan:</span>{" "}
                    {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1 border-t border-orange-200">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(item, "reject")}
                    className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Tolak Perubahan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal(item, "approve")}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Setujui Perubahan</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApprovalModal
        isOpen={modalOpen}
        title={selectedItem ? `${selectedItem.rw_nama} — Ketua Baru: ${selectedItem.ketua_nama_baru}` : ""}
        action={modalAction}
        onClose={() => { setModalOpen(false); setSelectedItem(null); }}
        onConfirm={handleConfirm}
        isLoading={processing}
      />
    </div>
  );
}
