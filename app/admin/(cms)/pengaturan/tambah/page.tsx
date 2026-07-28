"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import { compressImage } from "@/lib/image-compression";

export default function TambahStrukturPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [urutan, setUrutan] = useState(1);
  const [levelHirarki, setLevelHirarki] = useState("1");
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [objectPosition, setObjectPosition] = useState<"top" | "center">("top");

  // Otomatis sinkronkan urutan dengan level hirarki
  function handleLevelChange(val: string) {
    setLevelHirarki(val);
    if (val !== "custom") {
      setUrutan(Number(val));
    }
  }

  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const rawUrl = URL.createObjectURL(selected);
    setRawImage(rawUrl);
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

    if (!nama.trim() || !jabatan.trim()) {
      setError("Field Nama dan Jabatan tidak boleh kosong.");
      return;
    }

    if (!fotoUrl) {
      setError("Foto pejabat wajib diupload.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/struktur", {
        method: "POST",
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
        throw new Error(data.error || "Gagal menyimpan jabatan struktur.");
      }

      router.push("/admin/pengaturan");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title="Tambah Jabatan / Pejabat Kelurahan" />

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
              Tingkat Hirarki Jabatan di Kelurahan <span className="text-destructive">*</span>
            </label>
            <select
              id="levelHirarki"
              value={levelHirarki}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="1">Level 1 — Lurah / Kepala Kelurahan (Pimpinan Utama - Paling Atas)</option>
              <option value="2">Level 2 — Sekretaris Kelurahan (Seklu)</option>
              <option value="3">Level 3 — Kepala Seksi / Kasi (Pemerintahan, Trantib, Ekbang)</option>
              <option value="4">Level 4 — Kepala Urusan / Kaur (Umum, Keuangan)</option>
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
              Posisi dalam bagan struktur otomatis disesuaikan berdasarkan tingkat hirarki yang dipilih.
            </p>
          </div>

          {/* Upload Foto & Setting Opsi Penyesuaian (Crop / Fit Mode) */}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setCropperOpen(true);
                          }}
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
                      Klik untuk upload pasfoto resmi (WebP, JPG, PNG — Kompresi Otomatis)
                    </p>
                  </div>
                )}
                {uploading && (
                  <p className="mt-2 text-xs font-bold text-primary">Mengompres &amp; upload foto…</p>
                )}
              </div>

              {/* Opsi Penyesuaian Foto Biar Tidak Terpotong */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Pengaturan Tampilan Foto
                </p>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground block">
                    Metode Fit Gambar:
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFitMode("cover")}
                      className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                        fitMode === "cover"
                          ? "bg-primary text-white border-primary"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      Penuhi Bingkai (Cover)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode("contain")}
                      className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                        fitMode === "contain"
                          ? "bg-primary text-white border-primary"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      Utuh Pasfoto (Contain)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground block">
                    Fokus Posisi Foto:
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setObjectPosition("top")}
                      className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                        objectPosition === "top"
                          ? "bg-primary text-white border-primary"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      Atas Wajah (Top)
                    </button>
                    <button
                      type="button"
                      onClick={() => setObjectPosition("center")}
                      className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                        objectPosition === "center"
                          ? "bg-primary text-white border-primary"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      Tengah (Center)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {fotoUrl && (
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
            {submitting ? "Menyimpan…" : "Simpan Pejabat"}
          </button>
        </div>
      </form>

      {/* Interactive Crop Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImage}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
