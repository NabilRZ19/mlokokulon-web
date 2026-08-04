"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { compressImage } from "@/lib/image-compression";
import { scrollToFirstError } from "@/lib/form-scroll";
import { getPublicImageUrl } from "@/lib/image-url";

export default function EditGaleriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [tipe, setTipe] = useState<"foto" | "video">("foto");
  const [urlMedia, setUrlMedia] = useState("");
  const [kategori, setKategori] = useState("umum");

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/galeri/${id}`);
        if (!res.ok) throw new Error("Gagal memuat data galeri.");
        const data = await res.json();
        setJudul(data.judul ?? "");
        setTipe(data.tipe ?? "foto");
        setUrlMedia(data.url_media ?? "");
        setKategori(data.kategori ?? "umum");
        setPreview(data.url_media ? getPublicImageUrl(data.url_media) : null);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("file", compressed, compressed.name);
      fd.append("folder", "galeri");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload gagal.");
      const data = await res.json();
      setUrlMedia(data.url);
      setPreview(getPublicImageUrl(data.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errorIds: string[] = [];
    if (!judul.trim()) errorIds.push("judul");
    if (!urlMedia) errorIds.push("urlMedia");

    if (errorIds.length > 0) {
      setError("Judul dan URL media wajib diisi.");
      scrollToFirstError(errorIds);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/galeri/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul, tipe, url_media: urlMedia, kategori }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan perubahan.");
      }

      router.push("/admin/galeri");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Memuat data galeri…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Edit Item Galeri" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div>
            <label htmlFor="judul" className="mb-1 block text-sm font-bold text-foreground">
              Judul Foto / Video <span className="text-destructive">*</span>
            </label>
            <input
              id="judul"
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Judul item galeri"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label htmlFor="tipe" className="mb-1 block text-sm font-bold text-foreground">
              Tipe Media <span className="text-destructive">*</span>
            </label>
            <select
              id="tipe"
              value={tipe}
              onChange={(e) => setTipe(e.target.value as "foto" | "video")}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="foto">Foto</option>
              <option value="video">Video (URL YouTube/MP4)</option>
            </select>
          </div>

          <div>
            <label htmlFor="kategori" className="mb-1 block text-sm font-bold text-foreground">
              Kategori
            </label>
            <select
              id="kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="umum">Umum</option>
              <option value="kampung-kb">Kampung KB</option>
              <option value="kegiatan">Kegiatan</option>
              <option value="pembangunan">Pembangunan</option>
            </select>
          </div>

          {tipe === "foto" ? (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-foreground">
                Foto Media <span className="text-destructive">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors min-h-[140px]"
              >
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                    <span className="mt-2 text-xs font-bold text-primary hover:underline">
                      {uploading ? "Mengupload…" : "Ganti Foto"}
                    </span>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-muted-foreground">
                    {uploading ? "Mengompres & mengupload…" : "Klik untuk upload foto"}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="urlMedia" className="mb-1 block text-sm font-bold text-foreground">
                URL Video <span className="text-destructive">*</span>
              </label>
              <input
                id="urlMedia"
                type="url"
                value={urlMedia}
                onChange={(e) => setUrlMedia(e.target.value)}
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
            {submitting ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
