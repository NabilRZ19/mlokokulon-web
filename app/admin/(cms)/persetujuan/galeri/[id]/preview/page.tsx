"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalModal } from "@/components/admin/ApprovalModal";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { getPublicImageUrl } from "@/lib/image-url";

interface PendingGaleriDetail {
  id: string;
  judul: string;
  tipe: "foto" | "video";
  url_media: string;
  kategori?: string;
  sumber_berita_id?: string;
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

export default function PreviewGaleriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<PendingGaleriDetail | null>(null);
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
      const res = await fetch(`/api/admin/persetujuan/galeri/${id}`);
      if (!res.ok) throw new Error("Gagal memuat detail galeri.");
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
      const res = await fetch(`/api/admin/persetujuan/galeri/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalAction, note }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal memproses persetujuan.");
      }
      setModalOpen(false);
      router.push("/admin/persetujuan/galeri");
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
        title="Preview Pengajuan Media Galeri"
        actions={
          <Link
            href="/admin/persetujuan/galeri"
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
          <span>Mode Preview Persetujuan Galeri (Pending Status)</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Media foto/video di bawah ini diajukan untuk diterbitkan pada galeri dokumentasi publik. Periksa kesesuaian judul, kategori, dan tampilan media sebelum memberikan approval.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Memuat preview galeri…
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive font-medium">
          {error || "Data galeri tidak ditemukan."}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Informasi Pengusul</h3>
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
                <span className="text-muted-foreground block text-[11px]">Kategori Media:</span>
                <strong className="text-sm text-foreground capitalize">{data.kategori || "Umum"}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-md space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                data.tipe === "foto" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
              }`}>
                {data.tipe === "foto" ? "📷 Foto" : "🎬 Video"}
              </span>
              {data.kategori && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground capitalize">
                  {data.kategori}
                </span>
              )}
            </div>

            <h2 className="font-heading text-lg font-bold text-foreground leading-snug">{data.judul}</h2>

            {data.tipe === "video" ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-black">
                <video
                  src={getPublicImageUrl(data.url_media)}
                  controls
                  className="w-full h-auto max-h-[360px]"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  onClick={() => setActiveImage({ url: getPublicImageUrl(data.url_media), title: data.judul })}
                  className="overflow-hidden rounded-2xl border border-border bg-muted cursor-pointer relative group"
                >
                  <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPublicImageUrl(data.url_media)}
                      alt={data.judul}
                      className="absolute inset-0 h-full w-full object-contain bg-black/5 transition-transform duration-300 group-hover:scale-102"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full shadow-md">🔍 Perbesar Foto</span>
                  </div>
                </div>
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setActiveImage({ url: getPublicImageUrl(data.url_media), title: data.judul })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
                  >
                    🔍 Lihat Foto (Ukuran Penuh)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {data && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-md shadow-2xl">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
              Persetujuan Media: <strong className="text-foreground">{data.judul}</strong>
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
                <span>Tolak Media</span>
              </button>
              <button
                type="button"
                onClick={() => openModal("approve")}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Setujui Media</span>
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
