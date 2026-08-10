"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalModal } from "@/components/admin/ApprovalModal";
import { getPublicImageUrl } from "@/lib/image-url";

interface PengurusItem {
  nama: string;
  jabatan: string;
  kategori?: "rw" | "rt" | "organisasi";
  organisasi?: string;
  icon?: string;
}

interface FullPayload {
  nama_rw?: string;
  cakupan_dusun?: string;
  jumlah_rt?: number;
  is_kampung_kb?: boolean;
  ketua_nama?: string;
  ketua_foto_url?: string | null;
  deskripsi_singkat?: string;
  potensi?: string;
  statistik?: { jumlah_kk?: number; jumlah_jiwa?: number };
  struktur_pengurus?: PengurusItem[];
}

interface PendingWilayahDetail {
  id: number;
  rw_id: string;
  diajukan_oleh_id: number;
  diajukan_oleh_nama: string;
  pengusul: string;
  ketua_nama_baru: string;
  ketua_foto_url_baru?: string;
  payload_json?: string | null;
  status: string;
  reviewer_note?: string;
  created_at: string;
  rw_nama: string;
  ketua_nama_lama?: string;
  ketua_foto_url_lama?: string;
}

const ICON_LABEL: Record<string, string> = {
  sprout: "🌱",
  users: "👥",
  pkk: "💜",
  shield: "🛡️",
  trophy: "🏆",
  building: "🏛️",
};

export default function PreviewWilayahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<PendingWilayahDetail | null>(null);
  const [payload, setPayload] = useState<FullPayload | null>(null);
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
      if (json.payload_json) {
        try {
          setPayload(JSON.parse(json.payload_json));
        } catch {
          setPayload(null);
        }
      }
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

  // Group pengurus by kategori
  const rwCore = payload?.struktur_pengurus?.filter((p) => p.kategori === "rw") ?? [];
  const rtList = payload?.struktur_pengurus?.filter((p) => p.kategori === "rt") ?? [];
  const orgList = payload?.struktur_pengurus?.filter((p) => p.kategori === "organisasi") ?? [];

  // Group org members by organisasi name
  const orgMap: Record<string, { icon: string; members: PengurusItem[] }> = {};
  orgList.forEach((p) => {
    const key = p.organisasi || "Organisasi";
    if (!orgMap[key]) orgMap[key] = { icon: p.icon || "users", members: [] };
    orgMap[key].members.push(p);
  });

  return (
    <div className="space-y-6 pb-24">
      <AdminPageHeader
        title="Preview Pengajuan Perubahan Data RW"
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
          <span>Mode Preview Persetujuan Data RW (Menunggu Persetujuan)</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Tinjau seluruh perubahan data Wilayah RW yang diajukan oleh Admin RW, mulai dari data statistik kependudukan, perubahan Ketua RW, hingga susunan pengurus dan organisasi kemasyarakatan.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Memuat detail pengajuan…
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive font-medium">
          {error || "Data pengajuan tidak ditemukan."}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Informasi Pengusul */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Informasi Pengusul</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-foreground">
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Nama Pengusul</span>
                <strong className="text-sm text-foreground">{data.pengusul || data.diajukan_oleh_nama || "Admin"}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Wilayah RW</span>
                <strong className="text-sm text-foreground">{data.rw_nama}</strong>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <span className="text-muted-foreground block text-[11px]">Tanggal Pengajuan</span>
                <strong className="text-sm text-foreground">
                  {new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </strong>
              </div>
            </div>
          </div>

          {/* Perubahan Ketua RW */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Perubahan Ketua RW</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ketua Lama */}
              <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                  Ketua Saat Ini
                </span>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-xl border-2 border-border bg-muted overflow-hidden shadow-sm">
                    {data.ketua_foto_url_lama ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getPublicImageUrl(data.ketua_foto_url_lama)} alt="Foto Ketua Lama" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg className="h-7 w-7 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{data.ketua_nama_lama || "Belum Diisi"}</p>
                    <p className="text-xs text-muted-foreground">Ketua {data.rw_nama}</p>
                  </div>
                </div>
              </div>

              {/* Ketua Baru */}
              <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 space-y-3">
                <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-xs">
                  ✨ Ketua Baru Diajukan
                </span>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-xl border-2 border-primary bg-background overflow-hidden shadow-sm">
                    {data.ketua_foto_url_baru ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getPublicImageUrl(data.ketua_foto_url_baru)} alt="Foto Ketua Baru" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg className="h-7 w-7 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primary">{data.ketua_nama_baru}</p>
                    <p className="text-xs font-semibold text-foreground">Calon Ketua {data.rw_nama}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Perubahan Data RW dari payload_json */}
          {payload && (
            <>
              {/* Informasi Umum Wilayah */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Informasi Umum Wilayah</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="text-muted-foreground block">Nama RW</span>
                    <strong className="text-foreground text-sm">{payload.nama_rw || data.rw_nama}</strong>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="text-muted-foreground block">Cakupan Dusun</span>
                    <strong className="text-foreground text-sm">{payload.cakupan_dusun || "-"}</strong>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="text-muted-foreground block">Jumlah RT</span>
                    <strong className="text-foreground text-sm">{payload.jumlah_rt ?? "-"} RT</strong>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="text-muted-foreground block">Kampung KB</span>
                    <strong className="text-foreground text-sm">{payload.is_kampung_kb ? "Ya" : "Tidak"}</strong>
                  </div>
                </div>

                {/* Statistik Kependudukan */}
                {payload.statistik && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-foreground">Statistik Kependudukan</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-border bg-emerald-50 p-3 space-y-1">
                        <span className="text-muted-foreground block">Jumlah KK</span>
                        <strong className="text-emerald-700 text-base">{payload.statistik.jumlah_kk ?? "-"} KK</strong>
                      </div>
                      <div className="rounded-xl border border-border bg-blue-50 p-3 space-y-1">
                        <span className="text-muted-foreground block">Jumlah Jiwa</span>
                        <strong className="text-blue-700 text-base">{payload.statistik.jumlah_jiwa ?? "-"} Jiwa</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deskripsi Singkat */}
                {payload.deskripsi_singkat && (
                  <div className="space-y-1.5 border-t border-border pt-4">
                    <p className="text-xs font-bold text-foreground">Deskripsi Singkat</p>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{payload.deskripsi_singkat}</p>
                  </div>
                )}

                {/* Potensi Wilayah */}
                {payload.potensi && (
                  <div className="space-y-1.5 border-t border-border pt-4">
                    <p className="text-xs font-bold text-foreground">Potensi Wilayah</p>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{payload.potensi}</p>
                  </div>
                )}
              </div>

              {/* Pengurus Inti RW */}
              {rwCore.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Pengurus Inti RW</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rwCore.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                          RW
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{p.nama}</p>
                          <p className="text-muted-foreground">{p.jabatan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pengurus RT */}
              {rtList.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Pengurus RT</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rtList.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                          RT
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{p.nama}</p>
                          <p className="text-muted-foreground">{p.jabatan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organisasi Kemasyarakatan */}
              {Object.keys(orgMap).length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Organisasi Kemasyarakatan</h3>
                  <div className="space-y-4">
                    {Object.entries(orgMap).map(([orgName, { icon, members }]) => (
                      <div key={orgName} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{ICON_LABEL[icon] ?? "🏛️"}</span>
                          <p className="font-bold text-sm text-foreground">{orgName}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {members.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs rounded-lg border border-border bg-card px-2.5 py-2">
                              <span className="font-bold text-foreground">{m.nama}</span>
                              <span className="text-muted-foreground">&mdash; {m.jabatan}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {data && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-md shadow-2xl">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
              Persetujuan Perubahan Data: <strong className="text-foreground">{data.rw_nama}</strong>
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
        title={`Perubahan Data ${data?.rw_nama ?? ""}`}
        action={modalAction}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isLoading={processing}
      />
    </div>
  );
}
