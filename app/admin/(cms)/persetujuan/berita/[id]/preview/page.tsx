"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalModal } from "@/components/admin/ApprovalModal";
import { BeritaBadge } from "@/components/berita/BeritaBadge";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { getPublicImageUrl } from "@/lib/image-url";

interface PendingBeritaDetail {
  id: string;
  judul: string;
  slug: string;
  isi: string;
  kategori: string;
  cakupan: string;
  rw_id?: string;
  rw_nama?: string;
  penulis: string;
  tanggal: string;
  gambar_cover_url: string;
  video_url?: string;
  video_title?: string;
  foto_tambahan: string[];
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

export default function PreviewBeritaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<PendingBeritaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [processing, setProcessing] = useState(false);
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  async function fetchDetail() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/persetujuan/berita/${id}`);
      if (!res.ok) throw new Error("Gagal memuat detail pengajuan berita.");
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
      const res = await fetch(`/api/admin/persetujuan/berita/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalAction, note }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal memproses persetujuan.");
      }
      setModalOpen(false);
      router.push("/admin/persetujuan/berita");
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
        title="Preview Pengajuan Berita"
        actions={
          <Link
            href="/admin/persetujuan/berita"
            className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            ← Kembali ke Daftar
          </Link>
        }
      />

      {/* Warning Notice Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 shadow-2xs space-y-1">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Mode Preview Persetujuan Konten (Pending Status)</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Konten di bawah ini adalah draf yang diajukan oleh Admin RW/Kampung KB dan belum dipublikasikan ke website publik. Tinjau seluruh isi konten di bawah sebelum memberikan persetujuan.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Memuat preview berita…
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive font-medium">
          {error || "Data berita tidak ditemukan."}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card Info Pengusul & Metadata */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Informasi Otorisasi Pengusul</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-foreground">
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Nama Pengusul:</span>
                <strong className="text-sm text-foreground">{data.pengusul || data.penulis || "-"}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Tingkat Admin:</span>
                <strong className="text-sm text-foreground">{TIER_LABEL[data.submitted_by_tier ?? 3] ?? "-"}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Cakupan Wilayah:</span>
                <strong className="text-sm text-foreground capitalize">{data.cakupan === "kelurahan" ? "Kelurahan" : data.rw_nama || "RW"}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Tanggal Pengajuan:</span>
                <strong className="text-sm text-foreground">
                  {new Date(data.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </strong>
              </div>
            </div>
          </div>

          {/* Tampilan Simulasi Halaman Berita Publik */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-8 shadow-md space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <BeritaBadge kategori={data.kategori as any} />
                <span className="text-xs text-muted-foreground font-medium">
                  {new Date(data.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="text-xs text-muted-foreground font-medium">• oleh {data.penulis}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground leading-snug">
                {data.judul}
              </h1>
            </div>

            {/* Gambar Cover */}
            {data.gambar_cover_url && (
              <div className="space-y-2">
                <div
                  onClick={() => setActiveImage({ url: getPublicImageUrl(data.gambar_cover_url), title: data.judul })}
                  className="overflow-hidden rounded-2xl border border-border aspect-[16/9] max-h-[420px] w-full bg-muted cursor-pointer relative group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPublicImageUrl(data.gambar_cover_url)}
                    alt={data.judul}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md">
                      🔍
                    </div>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground text-center sm:hidden">
                  Klik foto untuk melihat ukuran penuh
                </p>
                <div className="hidden sm:flex justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveImage({ url: getPublicImageUrl(data.gambar_cover_url), title: data.judul })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
                  >
                    🔍 Lihat Foto Cover (Ukuran Penuh)
                  </button>
                </div>
              </div>
            )}

            {/* Isi Konten Berita */}
            <div className="prose prose-sm sm:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {data.isi}
            </div>

            {/* Video Preview */}
            {data.video_url && (
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                <p className="text-xs font-bold text-foreground">Media Video / Link Terkait:</p>
                <a
                  href={data.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline break-all"
                >
                  🔗 {data.video_title || data.video_url} ↗
                </a>
              </div>
            )}

            {/* Galeri Foto Tambahan */}
            {data.foto_tambahan && data.foto_tambahan.length > 0 && (
              <div className="space-y-3 border-t border-border pt-6">
                <h3 className="font-heading text-sm font-bold text-foreground">Foto Dokumentasi Tambahan</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {data.foto_tambahan.map((url, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div
                        onClick={() => setActiveImage({ url: getPublicImageUrl(url), title: `Foto Tambahan #${idx + 1} — ${data.judul}` })}
                        className="aspect-[4/3] rounded-xl overflow-hidden border border-border bg-muted cursor-pointer relative group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getPublicImageUrl(url)} alt={`Foto tambahan ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <span className="text-white text-xs font-bold bg-black/60 px-2.5 py-1 rounded-full">Perbesar 🔍</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveImage({ url: getPublicImageUrl(url), title: `Foto Tambahan #${idx + 1} — ${data.judul}` })}
                        className="w-full text-center rounded-lg border border-border bg-card py-1 text-[11px] font-bold text-foreground hover:bg-muted transition-colors"
                      >
                        Lihat Foto #{idx + 1} 🔍
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Bar persetujuan */}
      {data && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-md shadow-2xl">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
              Keputusan Persetujuan untuk Berita: <strong className="text-foreground">{data.judul}</strong>
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
                <span>Tolak Berita</span>
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
        title={data?.judul ?? ""}
        action={modalAction}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isLoading={processing}
      />

      <ImageLightboxModal
        isOpen={!!activeImage}
        src={activeImage?.url ?? null}
        title={activeImage?.title}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}
