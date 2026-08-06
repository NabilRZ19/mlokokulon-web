"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InfoLinkButton } from "@/components/admin/InfoLinkButton";
import { compressImage } from "@/lib/image-compression";
import { scrollToFirstError } from "@/lib/form-scroll";

type TipeMedia = "foto" | "video";

export default function TambahGaleriPage() {
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [tipe, setTipe] = useState<TipeMedia>("foto");
  const [kategori, setKategori] = useState("umum");
  const [videoUrl, setVideoUrl] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setUploadedUrl(null);
    setUploadError(null);
    setUploading(true);

    try {
      const compressed = await compressImage(selected);
      const fd = new FormData();
      fd.append("file", compressed, compressed.name);
      fd.append("folder", "galeri");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Gagal mengupload foto");

      const data = await res.json();
      setUploadedUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errorIds: string[] = [];
    if (!judul.trim()) errorIds.push("judul");

    const finalUrl = tipe === "foto" ? uploadedUrl : videoUrl;
    if (!finalUrl) {
      errorIds.push(tipe === "foto" ? "fotoArea" : "videoUrl");
    }

    if (errorIds.length > 0) {
      setError(!judul.trim() ? "Judul media tidak boleh kosong." : tipe === "foto" ? "Foto wajib diupload terlebih dahulu." : "URL Video wajib diisi.");
      scrollToFirstError(errorIds);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/galeri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          tipe,
          url_media: finalUrl,
          kategori,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menambah media galeri.");
      }

      router.push("/admin/galeri");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Upload Media Galeri" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div>
            <label htmlFor="judul" className="mb-1 block text-sm font-bold text-foreground">
              Judul Media / Keterangan Dokumentasi <span className="text-destructive">*</span>
            </label>
            <input
              id="judul"
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Misal: Dokumentasi Musrenbang Kelurahan Mlokomanis Kulon"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipe" className="mb-1 block text-sm font-bold text-foreground">
                Tipe Media
              </label>
              <select
                id="tipe"
                value={tipe}
                onChange={(e) => setTipe(e.target.value as TipeMedia)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="foto">Foto Dokumentasi</option>
                <option value="video">Link Video (YouTube/MP4)</option>
              </select>
            </div>

            <div>
              <label htmlFor="kategori" className="mb-1 block text-sm font-bold text-foreground">
                Kategori Galeri
              </label>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="umum">Umum</option>
                <option value="kegiatan">Kegiatan Kelurahan</option>
                <option value="kampung-kb">Kampung KB</option>
                <option value="pembangunan">Pembangunan</option>
                <option value="umkm">Potensi / UMKM</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Kampung KB = program Keluarga Berencana unggulan kelurahan.
              </p>
            </div>
          </div>

          {tipe === "foto" ? (
            <div>
              <label className="mb-1 block text-sm font-bold text-foreground">
                File Foto <span className="text-destructive">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Preview Upload"
                    className="max-h-48 rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Pilih Foto dari Perangkat</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      WebP, JPG, PNG, kompresi otomatis (maks 500 KB)
                    </p>
                  </div>
                )}
                {uploading && (
                  <p className="mt-2 text-xs font-bold text-primary">Mengompres &amp; mengupload foto…</p>
                )}
              </div>

              {file && !uploading && (
                <p className="mt-1 text-xs text-muted-foreground">{file.name}</p>
              )}
              {uploadedUrl && (
                <p className="mt-1 text-xs font-bold text-emerald-600">✓ Foto berhasil diupload ke MinIO</p>
              )}
              {uploadError && <p className="mt-1 text-xs font-semibold text-destructive">{uploadError}</p>}
            </div>
          ) : (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="videoUrl" className="block text-sm font-bold text-foreground">
                  URL Video (YouTube / Direct Link) <span className="text-destructive">*</span>
                </label>
                <InfoLinkButton />
              </div>
              <input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Menyimpan…" : "Simpan Media"}
          </button>
        </div>
      </form>
    </div>
  );
}
