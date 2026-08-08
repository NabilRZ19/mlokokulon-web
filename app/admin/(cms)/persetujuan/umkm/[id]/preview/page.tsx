"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalModal } from "@/components/admin/ApprovalModal";
import { getPublicImageUrl } from "@/lib/image-url";

interface PendingUmkmDetail {
  id: string;
  nama: string;
  slug: string;
  kategori: string;
  deskripsi: string;
  link_gmaps: string;
  kontak: string;
  jam_operasional: string;
  lokasi?: string | null;
  foto_utama_url: string | null;
  foto_urls: string[];
  produk_unggulan: { produk: string; foto_url: string | null }[];
  submitted_by_tier?: number;
  pengusul?: string;
  created_by: string;
  status: string;
  reviewer_note?: string;
}

const TIER_LABEL: Record<number, string> = {
  3: "Tier 3 — Admin RW",
  4: "Tier 4 — Admin Kampung KB",
};

export default function PreviewUmkmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<PendingUmkmDetail | null>(null);
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
      const res = await fetch(`/api/admin/persetujuan/umkm/${id}`);
      if (!res.ok) throw new Error("Gagal memuat detail profil UMKM.");
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
      const res = await fetch(`/api/admin/persetujuan/umkm/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalAction, note }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal memproses persetujuan.");
      }
      setModalOpen(false);
      router.push("/admin/persetujuan/umkm");
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
        title="Preview Pengajuan Profil UMKM"
        actions={
          <Link
            href="/admin/persetujuan/umkm"
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
          <span>Mode Preview Persetujuan Profil UMKM (Pending Status)</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Profil usaha UMKM ini diajukan untuk diterbitkan pada katalog publik. Tinjau kelengkapan informasi usaha dan foto produk sebelum memberikan keputusan approval.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Memuat preview UMKM…
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive font-medium">
          {error || "Data UMKM tidak ditemukan."}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Informasi Otorisasi Pengusul</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-foreground">
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Nama Pengusul:</span>
                <strong className="text-sm text-foreground">{data.pengusul || "Admin"}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Tingkat Admin:</span>
                <strong className="text-sm text-foreground">{TIER_LABEL[data.submitted_by_tier ?? 3] ?? "-"}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Kategori Usaha:</span>
                <strong className="text-sm text-foreground">{data.kategori}</strong>
              </div>
            </div>
          </div>

          {/* Card Preview Profil UMKM */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-border pb-6">
              <div className="space-y-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {data.kategori}
                </span>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">{data.nama}</h1>
                <p className="text-xs font-bold text-muted-foreground">📍 {data.lokasi || "Kelurahan Mlokomanis Kulon"}</p>
              </div>
              {data.link_gmaps && (
                <a
                  href={data.link_gmaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border bg-muted px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
                >
                  📍 Buka di Google Maps ↗
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Foto Utama & Foto Usaha */}
              <div className="lg:col-span-5 space-y-3">
                <div className="overflow-hidden rounded-2xl border border-border aspect-[4/3] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPublicImageUrl(data.foto_utama_url || data.foto_urls[0] || "/images/placeholder.jpg")}
                    alt={data.nama}
                    className="h-full w-full object-cover"
                  />
                </div>
                {data.foto_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {data.foto_urls.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getPublicImageUrl(url)} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rincian Usaha */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="text-muted-foreground font-medium block">Jam Operasional:</span>
                    <strong className="text-foreground">{data.jam_operasional}</strong>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="text-muted-foreground font-medium block">Kontak Penanggung Jawab:</span>
                    <strong className="text-foreground">{data.kontak}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading text-sm font-bold text-foreground">Deskripsi Usaha</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{data.deskripsi}</p>
                </div>

                {data.produk_unggulan.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <h3 className="font-heading text-sm font-bold text-foreground">Produk Unggulan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.produk_unggulan.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-2.5">
                          {p.foto_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getPublicImageUrl(p.foto_url)} alt={p.produk} className="h-10 w-10 rounded-lg object-cover border border-border shrink-0" />
                          )}
                          <span className="text-xs font-bold text-foreground">{p.produk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-md shadow-2xl">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
              Persetujuan Profil UMKM: <strong className="text-foreground">{data.nama}</strong>
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
                <span>Tolak Profil</span>
              </button>
              <button
                type="button"
                onClick={() => openModal("approve")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Setujui &amp; Terbitkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ApprovalModal
        isOpen={modalOpen}
        title={data?.nama ?? ""}
        action={modalAction}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isLoading={processing}
      />
    </div>
  );
}
