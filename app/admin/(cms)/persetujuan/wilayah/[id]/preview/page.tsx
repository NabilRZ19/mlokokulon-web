"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalModal } from "@/components/admin/ApprovalModal";
import { getPublicImageUrl } from "@/lib/image-url";

interface PendingWilayahDetail {
  id: number;
  rw_id: string;
  diajukan_oleh_id: number;
  diajukan_oleh_nama: string;
  pengusul: string;
  ketua_nama_baru: string;
  ketua_foto_url_baru?: string;
  status: string;
  reviewer_note?: string;
  created_at: string;
  rw_nama: string;
  ketua_nama_lama?: string;
  ketua_foto_url_lama?: string;
}

export default function PreviewWilayahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<PendingWilayahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [processing, setProcessing] = useState(false);

  async function fetchDetail() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/persetujuan/wilayah/${id}`);
      if (!res.ok) throw new Error("Gagal memuat detail pengajuan Ketua RW.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDetail();
  }, [id]);

  function openModal(action: "approve" | "reject") {
    setModalAction(action);
    setModalOpen(true);
  }

  async function handleConfirm(note: string) {
    if (!data) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/persetujuan/wilayah/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalAction, note }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal memproses persetujuan.");
      }
      setModalOpen(false);
      router.push("/admin/persetujuan/wilayah");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Preview Pengajuan Perubahan Ketua RW"
        actions={
          <Link
            href="/admin/persetujuan/wilayah"
            className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            ← Kembali ke Daftar
          </Link>
        }
      />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 shadow-2xs space-y-1">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Mode Preview Persetujuan Ketua RW (Pending Status)</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Tinjau perbandingan data Ketua RW lama dengan calon Ketua RW baru yang diajukan oleh Admin RW. Jika Anda menyetujui pengajuan ini, nama dan pasfoto Ketua RW pada database akan diperbarui secara otomatis.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Memuat preview pengajuan Ketua RW…
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive font-medium">
          {error || "Data pengajuan tidak ditemukan."}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Informasi Pengusul</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-foreground">
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Nama Pengusul:</span>
                <strong className="text-sm text-foreground">{data.pengusul || data.diajukan_oleh_nama || "Admin"}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Wilayah RW:</span>
                <strong className="text-sm text-foreground">{data.rw_nama}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Tanggal Pengajuan:</span>
                <strong className="text-sm text-foreground">
                  {new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </strong>
              </div>
            </div>
          </div>

          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Data Ketua RW Lama */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                <span>Saat Ini (Jabatan Lama)</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className="h-28 w-28 rounded-full border-4 border-border bg-muted overflow-hidden shadow-md">
                  {data.ketua_foto_url_lama ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getPublicImageUrl(data.ketua_foto_url_lama)} alt="Foto Ketua Lama" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                      Tanpa Foto
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-foreground">{data.ketua_nama_lama || "Belum Diisi"}</h4>
                  <p className="text-xs text-muted-foreground">Ketua {data.rw_nama}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Proposed New Ketua RW */}
            <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-md space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-xs">
                <span>✨ Pengajuan Ketua Baru</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className="h-28 w-28 rounded-full border-4 border-primary bg-background overflow-hidden shadow-lg">
                  {data.ketua_foto_url_baru ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getPublicImageUrl(data.ketua_foto_url_baru)} alt="Foto Ketua Baru" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                      Tanpa Foto
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-primary">{data.ketua_nama_baru}</h4>
                  <p className="text-xs font-semibold text-foreground">Calon Ketua {data.rw_nama}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-md shadow-2xl">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
              Persetujuan Perubahan Ketua: <strong className="text-foreground">{data.rw_nama}</strong>
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => openModal("reject")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Tolak Perubahan</span>
              </button>
              <button
                type="button"
                onClick={() => openModal("approve")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Setujui Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ApprovalModal
        isOpen={modalOpen}
        title={`Perubahan Ketua ${data?.rw_nama ?? ""}`}
        action={modalAction}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isLoading={processing}
      />
    </div>
  );
}
