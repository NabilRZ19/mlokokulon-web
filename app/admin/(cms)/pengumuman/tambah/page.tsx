"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalNoticeBanner } from "@/components/admin/ApprovalNoticeBanner";
import { compressImage } from "@/lib/image-compression";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";

export default function TambahPengumumanPage() {
  const router = useRouter();

  const [session, setSession] = useState<{ nama: string; tier: number } | null>(null);

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [targetPengumuman, setTargetPengumuman] = useState("Seluruh Warga Kelurahan");
  const [isi, setIsi] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [penulis, setPenulis] = useState("");

  // Cover / Thumbnail Upload State (Direct Upload)
  const [gambarCoverUrl, setGambarCoverUrl] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [rawCoverImage, setRawCoverImage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const json = await res.json();
          setSession(json);
          setPenulis(json.nama || "Seksi Kelurahan");
        }
      } catch {
        // ignore
      }
    }
    fetchSession();
  }, []);

  function handleJudulChange(v: string) {
    setJudul(v);
    setSlug(
      v
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
    );
  }

  // Direct Cover File Upload Handling
  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const rawUrl = URL.createObjectURL(selected);
    setRawCoverImage(rawUrl);
    setCropperOpen(true);
    if (e.target) e.target.value = "";
  }

  async function handleCoverCropComplete(croppedBlob: Blob, previewUrl: string) {
    setCoverPreview(previewUrl);
    setCoverUploading(true);
    setCoverError(null);
    try {
      const croppedFile = new File([croppedBlob], "cover.webp", { type: "image/webp" });
      const fd = new FormData();
      fd.append("file", croppedFile, croppedFile.name);
      fd.append("folder", "pengumuman");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload foto cover gagal.");
      const data = await res.json();
      setGambarCoverUrl(data.url);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Upload gagal.");
      setCoverPreview(null);
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
      const res = await fetch("/api/admin/pengumuman", {
        method: "POST",
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
        throw new Error(json.error || "Gagal menyimpan pengumuman.");
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
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader
        title="Buat Pengumuman Baru"
        description="Kelola dan publikasikan pengumuman resmi kelurahan."
        actions={
          <Link
            href="/admin/pengumuman"
            className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted"
          >
            ← Kembali
          </Link>
        }
      />

      <ApprovalNoticeBanner contentType="pengumuman" />

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-bold text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Informasi Utama Pengumuman ── */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">1. Informasi Utama Pengumuman</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Judul, penerima (kepada), dan tanggal terbit pengumuman.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Judul Pengumuman *</label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => handleJudulChange(e.target.value)}
              placeholder="Contoh: Jadwal Pelayanan Administrasi Keliling Kelurahan"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Kepada (Target Pengumuman) *</label>
              <input
                type="text"
                required
                value={targetPengumuman}
                onChange={(e) => setTargetPengumuman(e.target.value)}
                placeholder="Contoh: Seluruh Warga, Ketua RT/RW, Ibu Hamil"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Tanggal Pengumuman *</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
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
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </section>

        {/* ── Section 2: Foto Thumbnail / Cover Pengumuman (Direct Upload) ── */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">2. Foto Thumbnail / Cover Pengumuman</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Unggah foto atau flyer utama pengumuman (Pilih foto lalu sesuaikan crop area).</p>
            </div>
            <span className="text-xs font-bold text-muted-foreground">(Opsional)</span>
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={handleCoverFileChange}
          />

          {coverPreview ? (
            <div className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview} alt="Preview Cover" className="max-h-72 w-full object-contain rounded-xl bg-black/5" />
              {coverUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white backdrop-blur-xs">
                  Mengompres &amp; mengunggah gambar secara langsung...
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                >
                  Ganti Foto
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="rounded-xl bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors"
                >
                  Hapus Foto
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => coverInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                  <circle cx="8.5" cy="9.5" r="1.5" />
                  <path d="m5 17 4.5-5 3 3.5L16 11l4 5" />
                </svg>
              </div>
              <span className="text-xs font-bold text-primary">+ Klik / Pilih Foto Thumbnail Pengumuman (Pilih foto lalu sesuaikan crop area)</span>
              <span className="text-[11px] text-muted-foreground mt-1">Format WebP, JPG, PNG (Otomatis Kompresi WebP)</span>
            </div>
          )}
          {coverError && <p className="text-xs text-destructive font-semibold">{coverError}</p>}
        </section>

        {/* ── Section 3: Isi Konten Pengumuman ── */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">3. Isi Konten Pengumuman</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tuliskan narasi atau informasi detail pengumuman secara lengkap.</p>
          </div>

          <div className="space-y-1.5">
            <textarea
              required
              rows={10}
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder="Tuliskan detail isi pengumuman secara jelas dan lugas..."
              className="w-full rounded-xl border border-border bg-background p-4 text-xs text-foreground focus:ring-2 focus:ring-primary/50 font-sans leading-relaxed"
            />
          </div>
        </section>

        {/* Form Actions */}
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
            {submitting ? "Memproses..." : isTier34 ? "Ajukan Pengumuman" : "Simpan Pengumuman"}
          </button>
        </div>
      </form>
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawCoverImage}
        mode="cover"
        defaultRatio="16:9"
        allowedRatios={["16:9", "4:3", "3:2", "1:1", "3:4", "9:16", "original"]}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCoverCropComplete}
      />
    </div>
  );
}
