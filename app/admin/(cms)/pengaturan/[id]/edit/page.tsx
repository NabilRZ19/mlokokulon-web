"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import { compressImage } from "@/lib/image-compression";
import { scrollToFirstError } from "@/lib/form-scroll";
import { getPublicImageUrl } from "@/lib/image-url";

export default function EditStrukturPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [urutan, setUrutan] = useState(1);
  const [levelHirarki, setLevelHirarki] = useState("custom");
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [objectPosition, setObjectPosition] = useState<"top" | "center">("top");

  function handleLevelChange(val: string) {
    setLevelHirarki(val);
    if (val !== "custom") setUrutan(Number(val));
  }

  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/struktur/${id}`);
        if (!res.ok) throw new Error("Gagal memuat data jabatan.");
        const data = await res.json();
        setNama(data.nama ?? "");
        setJabatan(data.jabatan ?? "");
        setUrutan(data.urutan ?? 1);
        // Jika urutan cocok dgn level preset, tampilkan preset; else custom
        const presetLevels = ["1", "2", "3", "4", "5"];
        const matchedLevel = presetLevels.find((l) => Number(l) === data.urutan);
        setLevelHirarki(matchedLevel ?? "custom");
        setFotoUrl(data.foto_url ?? null);
        setPreview(data.foto_url ? getPublicImageUrl(data.foto_url) : null);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setRawImage(URL.createObjectURL(selected));
    setCropperOpen(true);
    if (e.target) e.target.value = "";
  }

  async function handleCropComplete(croppedBlob: Blob, previewUrl: string) {
    setPreview(previewUrl);
    setFotoUrl(null);
    setUploadError(null);
    setUploading(true);
    try {
      const croppedFile = new File([croppedBlob], "pejabat-crop.webp", { type: "image/webp" });
      const compressed = await compressImage(croppedFile);
      const fd = new FormData();
      fd.append("file", compressed, compressed.name);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload foto gagal.");
      const data = await res.json();
      setFotoUrl(data.url);
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
    if (!nama.trim()) errorIds.push("nama");
    if (!jabatan.trim()) errorIds.push("jabatan");
    if (!fotoUrl) errorIds.push("fotoArea");

    if (errorIds.length > 0) {
      setError(!nama.trim() || !jabatan.trim() ? "Field Nama dan Jabatan tidak boleh kosong." : "Foto pejabat wajib tersedia.");
      scrollToFirstError(errorIds);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/struktur/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          jabatan,
          foto_url: fotoUrl,
          urutan: Number(urutan),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan perubahan jabatan.");
      }

      router.push("/admin/pengaturan");
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
        Memuat data jabatan…
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
      <AdminPageHeader title="Edit Jabatan / Pejabat Kelurahan" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div>
            <label htmlFor="nama" className="mb-1 block text-sm font-bold text-foreground">
              Nama Lengkap &amp; Gelar <span className="text-destructive">*</span>
            </label>
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Lurah Mlokomanis Kulon, S.STP."
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label htmlFor="jabatan" className="mb-1 block text-sm font-bold text-foreground">
              Jabatan Resmi <span className="text-destructive">*</span>
            </label>
            <input
              id="jabatan"
              type="text"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Lurah / Sekretaris Kelurahan / Kasi Pemerintahan"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Pilihan Tingkat Hirarki Jabatan */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <label htmlFor="levelHirarki" className="block text-sm font-bold text-foreground">
              Tingkat Hirarki Jabatan <span className="text-destructive">*</span>
            </label>
            <select
              id="levelHirarki"
              value={levelHirarki}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="1">Level 1 — Lurah / Kepala Kelurahan (Paling Atas)</option>
              <option value="2">Level 2 — Sekretaris Kelurahan (Seklu)</option>
              <option value="3">Level 3 — Kepala Seksi / Kasi</option>
              <option value="4">Level 4 — Kepala Urusan / Kaur</option>
              <option value="5">Level 5 — Pelaksana &amp; Staf Lapangan</option>
              <option value="custom">Kustom (Isi Nomor Urutan Sendiri)</option>
            </select>

            {levelHirarki === "custom" && (
              <div className="pt-2">
                <label htmlFor="urutan" className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Nomor Urutan Tampilan
                </label>
                <input
                  id="urutan"
                  type="number"
                  min={1}
                  value={urutan}
                  onChange={(e) => setUrutan(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground"
                />
              </div>
            )}
            <p className="text-xs text-primary font-semibold">
              Posisi dalam bagan struktur otomatis disesuaikan berdasarkan tingkat hirarki.
            </p>
          </div>

          {/* Upload Foto */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground">
              Foto Resmi Pejabat <span className="text-destructive">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors min-h-[160px]"
              >
                {preview ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className={`h-28 w-28 rounded-full border-2 border-primary bg-black/5 ${
                        fitMode === "cover" ? "object-cover" : "object-contain"
                      } ${objectPosition === "top" ? "object-top" : "object-center"}`}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold text-primary hover:underline">Ganti Foto</span>
                      {rawImage && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCropperOpen(true); }}
                          className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary hover:bg-primary hover:text-white"
                        >
                          Crop Ulang
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Klik untuk upload pasfoto resmi
                    </p>
                  </div>
                )}
                {uploading && <p className="mt-2 text-xs font-bold text-primary">Mengompres &amp; upload foto…</p>}
              </div>

              {/* Opsi Penyesuaian Foto */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Pengaturan Tampilan Foto
                </p>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground block">Metode Fit Gambar:</span>
                  <div className="flex gap-2">
                    {(["cover", "contain"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFitMode(mode)}
                        className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                          fitMode === mode
                            ? "bg-primary text-white border-primary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {mode === "cover" ? "Cover" : "Contain"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground block">Fokus Posisi Foto:</span>
                  <div className="flex gap-2">
                    {(["top", "center"] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setObjectPosition(pos)}
                        className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                          objectPosition === pos
                            ? "bg-primary text-white border-primary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {pos === "top" ? "Atas Wajah (Top)" : "Tengah (Center)"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {fotoUrl && !uploading && (
              <p className="mt-1 text-xs font-bold text-emerald-600">Foto berhasil diupload ke MinIO</p>
            )}
            {uploadError && <p className="mt-1 text-xs font-semibold text-destructive">{uploadError}</p>}
          </div>
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

      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImage}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
