"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import { compressImage } from "@/lib/image-compression";

export default function EditPengumumanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<{ nama: string; tier: number } | null>(null);

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [targetPengumuman, setTargetPengumuman] = useState("");
  const [isi, setIsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [penulis, setPenulis] = useState("");
  
  // Cover / Thumbnail Upload State
  const [gambarCoverUrl, setGambarCoverUrl] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [sessionRes, itemRes] = await Promise.all([
          fetch("/api/admin/session"),
          fetch(`/api/admin/pengumuman/${id}`),
        ]);

        if (sessionRes.ok) {
          const sJson = await sessionRes.json();
          setSession(sJson);
        }

        if (itemRes.ok) {
          const item = await itemRes.json();
          setJudul(item.judul);
          setSlug(item.slug);
          setTargetPengumuman(item.target_pengumuman);
          setIsi(item.isi);
          setTanggal(item.tanggal);
          setPenulis(item.penulis);
          setGambarCoverUrl(item.gambar_cover_url || null);
          setCoverPreview(item.gambar_cover_url || null);
        } else {
          setError("Pengumuman tidak ditemukan.");
        }
      } catch {
        setError("Gagal memuat data pengumuman.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const rawUrl = URL.createObjectURL(selected);
    setRawImage(rawUrl);
    setCropperOpen(true);
    if (e.target) e.target.value = "";
  }

  async function handleCropComplete(croppedBlob: Blob, previewUrl: string) {
    setCoverPreview(previewUrl);
    setCoverUploading(true);
    setCoverError(null);

    try {
      const file = new File([croppedBlob], "cover-pengumuman.webp", { type: "image/webp" });
      const compressed = await compressImage(file);

      const fd = new FormData();
      fd.append("file", compressed, compressed.name);
      fd.append("folder", "pengumuman");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload foto thumbnail pengumuman gagal.");

      const data = await res.json();
      setGambarCoverUrl(data.url);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setCoverUploading(false);
    }
  }

  function handleRemoveCover() {
    setGambarCoverUrl(null);
    setCoverPreview(null);
    setCoverError(null);
  }

  const isTier34 = session?.tier === 3 || session?.tier === 4;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/pengumuman/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          slug,
          target_pengumuman: targetPengumuman,
          isi,
          tanggal,
          gambar_cover_url: gambarCoverUrl,
          penulis,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal memperbarui pengumuman.");
      }

      router.push("/admin/pengumuman");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <AdminPageHeader
        title="Edit Pengumuman"
        actions={
          <Link
            href="/admin/pengumuman"
            className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted"
          >
            ← Kembali
          </Link>
        }
      />

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Memuat data pengumuman...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5">
          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-bold text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Judul Pengumuman *</label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Thumbnail / Foto Cover Pengumuman */}
          <div className="space-y-2 rounded-xl border border-border bg-background p-4">
            <label className="text-xs font-bold text-foreground block">Foto Thumbnail / Cover Pengumuman (Opsional)</label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={handleCoverFileChange}
            />

            {coverPreview ? (
              <div className="relative flex flex-col items-center overflow-hidden rounded-xl border border-border bg-card p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Preview Cover" className="max-h-60 w-full object-contain rounded-lg" />
                {coverUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white">
                    Mengompres &amp; mengunggah gambar...
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                  >
                    Ganti Foto
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="rounded-lg bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive hover:bg-destructive/20"
                  >
                    Hapus Foto
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <span className="text-xs font-bold text-primary">+ Unggah Foto Thumbnail Pengumuman</span>
                <span className="text-[11px] text-muted-foreground mt-1">Format WebP, JPG, PNG (Otomatis Kompresi)</span>
              </div>
            )}
            {coverError && <p className="text-xs text-destructive font-semibold">{coverError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Target Pengumuman *</label>
              <input
                type="text"
                required
                value={targetPengumuman}
                onChange={(e) => setTargetPengumuman(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Tanggal Pengumuman *</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Penulis / Instansi *</label>
            <input
              type="text"
              required
              value={penulis}
              onChange={(e) => setPenulis(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Isi Pengumuman *</label>
            <textarea
              required
              rows={8}
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Link
              href="/admin/pengumuman"
              className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting || coverUploading}
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Memproses..." : isTier34 ? "Ajukan Perubahan" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}

      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImage}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
