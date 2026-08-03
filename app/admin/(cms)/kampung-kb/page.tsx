"use client";

import { useEffect, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import { compressImage } from "@/lib/image-compression";
import { getPublicImageUrl } from "@/lib/image-url";
import { scrollToFirstError } from "@/lib/form-scroll";
import type { KampungKb, KampungKbPokja } from "@/lib/types";

export default function PengaturanKampungKbPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [namaProgram, setNamaProgram] = useState("");
  const [ketua, setKetua] = useState("");
  const [skTahun, setSkTahun] = useState("2023");
  const [deskripsiProgram, setDeskripsiProgram] = useState("");
  const [fotoHighlightUrl, setFotoHighlightUrl] = useState<string | null>(null);

  // Lists
  const [fungsiList, setFungsiList] = useState<string[]>([]);
  const [pengurusInti, setPengurusInti] = useState<Array<{ jabatan: string; nama: string }>>([]);
  const [pokjaList, setPokjaList] = useState<KampungKbPokja[]>([]);

  // Image Upload & Crop
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/kampung-kb");
        if (!res.ok) throw new Error("Gagal memuat pengaturan Kampung KB.");
        const data: KampungKb = await res.json();

        setNamaProgram(data.nama_program || "");
        setKetua(data.ketua || "");
        setSkTahun(data.sk_tahun || "2023");
        setDeskripsiProgram(data.deskripsi_program || "");
        setFotoHighlightUrl(data.foto_highlight_url || null);
        setFungsiList(data.fungsi || []);
        setPengurusInti(data.pengurus_inti || []);
        setPokjaList(data.pokja || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Image Handlers ──────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const rawUrl = URL.createObjectURL(selected);
    setRawImage(rawUrl);
    setCropperOpen(true);
    if (e.target) e.target.value = "";
  }

  async function handleCropComplete(croppedBlob: Blob, previewUrl: string) {
    setFotoHighlightUrl(previewUrl);
    setUploadError(null);
    setUploading(true);

    try {
      const croppedFile = new File([croppedBlob], "kampung-kb-crop.webp", { type: "image/webp" });
      const compressed = await compressImage(croppedFile);
      const fd = new FormData();
      fd.append("file", compressed, compressed.name);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload foto gagal.");

      const data = await res.json();
      setFotoHighlightUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  // ── Tujuan/Fungsi Handlers ─────────────────────────────────────────
  function handleAddFungsi() {
    setFungsiList((prev) => [...prev, "Judul Tujuan: Keterangan penjelas"]);
  }
  function handleRemoveFungsi(idx: number) {
    setFungsiList((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleFungsiChange(idx: number, val: string) {
    setFungsiList((prev) => prev.map((item, i) => (i === idx ? val : item)));
  }

  // ── Pengurus Inti Handlers ─────────────────────────────────────────
  function handleAddPengurus() {
    setPengurusInti((prev) => [...prev, { jabatan: "Jabatan Baru", nama: "" }]);
  }
  function handleRemovePengurus(idx: number) {
    setPengurusInti((prev) => prev.filter((_, i) => i !== idx));
  }
  function handlePengurusChange(idx: number, field: "jabatan" | "nama", val: string) {
    setPengurusInti((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  }

  // ── Pokja Handlers ──────────────────────────────────────────────────
  function handleAddPokja() {
    setPokjaList((prev) => [
      ...prev,
      {
        nama: `Pokja ${prev.length + 1}`,
        ketua: "",
        anggota: "",
        program: ["Program 1"],
      },
    ]);
  }
  function handleRemovePokja(idx: number) {
    setPokjaList((prev) => prev.filter((_, i) => i !== idx));
  }
  function handlePokjaMetaChange(idx: number, field: "nama" | "ketua" | "anggota", val: string) {
    setPokjaList((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  }

  // Pokja Program Item Handlers
  function handleAddPokjaProgram(pokjaIdx: number) {
    setPokjaList((prev) =>
      prev.map((p, i) => (i === pokjaIdx ? { ...p, program: [...p.program, ""] } : p))
    );
  }
  function handleRemovePokjaProgram(pokjaIdx: number, progIdx: number) {
    setPokjaList((prev) =>
      prev.map((p, i) => {
        if (i !== pokjaIdx) return p;
        return { ...p, program: p.program.filter((_, pi) => pi !== progIdx) };
      })
    );
  }
  function handlePokjaProgramChange(pokjaIdx: number, progIdx: number, val: string) {
    setPokjaList((prev) =>
      prev.map((p, i) => {
        if (i !== pokjaIdx) return p;
        return { ...p, program: p.program.map((item, pi) => (pi === progIdx ? val : item)) };
      })
    );
  }

  // ── Submit ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const errorIds: string[] = [];
    if (!namaProgram.trim()) errorIds.push("namaProgram");
    if (!ketua.trim()) errorIds.push("ketua");
    if (!deskripsiProgram.trim()) errorIds.push("deskripsiProgram");

    if (errorIds.length > 0) {
      setError("Field Nama Program, Ketua, dan Deskripsi wajib diisi.");
      scrollToFirstError(errorIds);
      return;
    }

    setSubmitting(true);
    try {
      const payload: KampungKb = {
        rw_ref: "rw-05",
        nama_program: namaProgram.trim(),
        ketua: ketua.trim(),
        sk_tahun: skTahun.trim(),
        deskripsi_program: deskripsiProgram.trim(),
        foto_highlight_url: fotoHighlightUrl || "",
        fungsi: fungsiList.filter((f) => f.trim().length > 0),
        pengurus_inti: pengurusInti.filter((p) => p.nama.trim().length > 0),
        pokja: pokjaList,
      };

      const res = await fetch("/api/admin/kampung-kb", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan pengaturan Kampung KB.");
      }

      setSuccessMsg("Pengaturan Kampung KB berhasil diperbarui!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Memuat pengaturan Kampung KB…
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <AdminPageHeader title="Pengaturan Kampung KB" />
      <p className="-mt-4 text-xs text-muted-foreground">
        Kelola informasi program Kampung KB (foto highlight, tujuan, pengurus inti, &amp; pokja) yang tampil pada website utama.
      </p>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 font-bold">
          ✓ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1: Informasi Umum & Header Foto */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-5">
          <h2 className="font-heading text-base font-bold text-foreground border-b border-border pb-3">
            1. Informasi Umum &amp; Foto Highlight
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="namaProgram" className="block text-xs font-bold text-foreground">
                Nama Program Kampung KB <span className="text-destructive">*</span>
              </label>
              <input
                id="namaProgram"
                type="text"
                value={namaProgram}
                onChange={(e) => setNamaProgram(e.target.value)}
                placeholder="mis. Guyub Hanyawiji"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="ketua" className="block text-xs font-bold text-foreground">
                Ketua Pelaksana <span className="text-destructive">*</span>
              </label>
              <input
                id="ketua"
                type="text"
                value={ketua}
                onChange={(e) => setKetua(e.target.value)}
                placeholder="mis. Mujiono, S.Pd.I., M.Pd.I."
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label htmlFor="skTahun" className="block text-xs font-bold text-foreground">
              Tahun SK Penetapan Kelurahan
            </label>
            <input
              id="skTahun"
              type="text"
              value={skTahun}
              onChange={(e) => setSkTahun(e.target.value)}
              placeholder="mis. 2023"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="deskripsiProgram" className="block text-xs font-bold text-foreground">
              Deskripsi Utama Program <span className="text-destructive">*</span>
            </label>
            <textarea
              id="deskripsiProgram"
              rows={4}
              value={deskripsiProgram}
              onChange={(e) => setDeskripsiProgram(e.target.value)}
              placeholder="Tuliskan deskripsi lengkap Kampung KB..."
              className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          {/* Upload Foto Highlight */}
          <div id="fotoArea">
            <label className="block text-xs font-bold text-foreground mb-1">
              Foto Highlight Utama
            </label>
            {fotoHighlightUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted max-w-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPublicImageUrl(fotoHighlightUrl)}
                  alt="Preview Highlight"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFotoHighlightUrl(null)}
                  className="absolute top-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white hover:bg-destructive"
                >
                  Ganti Foto
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <p className="text-xs font-bold text-foreground">Klik untuk upload foto highlight</p>
                <p className="text-[11px] text-muted-foreground mt-1">Format WEBP/JPG, maks 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploading && <p className="mt-1 text-xs text-primary font-bold">Mengompres &amp; mengupload foto…</p>}
            {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
          </div>
        </div>

        {/* Card 2: Tujuan Program */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">
              2. Tujuan Program Kampung KB
            </h2>
            <button
              type="button"
              onClick={handleAddFungsi}
              className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200"
            >
              + Tambah Tujuan
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Gunakan format <span className="font-bold text-foreground">Judul Tujuan: Keterangan penjelas</span> agar judul di-bold otomatis di halaman utama.
          </p>

          <div className="space-y-3">
            {fungsiList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleFungsiChange(idx, e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFungsi(idx)}
                  className="rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-bold text-destructive hover:bg-destructive/10"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Pengurus Inti */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">
              3. Pengurus Inti
            </h2>
            <button
              type="button"
              onClick={handleAddPengurus}
              className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200"
            >
              + Tambah Pengurus
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pengurusInti.map((p, idx) => (
              <div key={idx} className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-muted-foreground">Pengurus #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePengurus(idx)}
                    className="text-xs font-bold text-destructive hover:underline"
                  >
                    Hapus
                  </button>
                </div>
                <input
                  type="text"
                  value={p.jabatan}
                  onChange={(e) => handlePengurusChange(idx, "jabatan", e.target.value)}
                  placeholder="Jabatan"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-bold text-foreground"
                />
                <input
                  type="text"
                  value={p.nama}
                  onChange={(e) => handlePengurusChange(idx, "nama", e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Pokja (Kelompok Kerja) */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">
              4. Kelompok Kerja (Pokja)
            </h2>
            <button
              type="button"
              onClick={handleAddPokja}
              className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200"
            >
              + Tambah Pokja
            </button>
          </div>

          <div className="space-y-5">
            {pokjaList.map((pokja, pokjaIdx) => (
              <div key={pokjaIdx} className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="text-xs font-extrabold text-emerald-900">Pokja #{pokjaIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePokja(pokjaIdx)}
                    className="text-xs font-bold text-destructive hover:underline"
                  >
                    Hapus Pokja
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground">Nama Pokja</label>
                    <input
                      type="text"
                      value={pokja.nama}
                      onChange={(e) => handlePokjaMetaChange(pokjaIdx, "nama", e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1 text-xs font-bold text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground">Ketua Pokja</label>
                    <input
                      type="text"
                      value={pokja.ketua}
                      onChange={(e) => handlePokjaMetaChange(pokjaIdx, "ketua", e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground">Anggota Pokja</label>
                    <input
                      type="text"
                      value={pokja.anggota}
                      onChange={(e) => handlePokjaMetaChange(pokjaIdx, "anggota", e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    />
                  </div>
                </div>

                {/* Program Kerja Items */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-foreground">Daftar Program Kerja</label>
                    <button
                      type="button"
                      onClick={() => handleAddPokjaProgram(pokjaIdx)}
                      className="text-xs font-bold text-emerald-800 hover:underline"
                    >
                      + Tambah Program
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pokja.program.map((progItem, progIdx) => (
                      <div key={progIdx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700">•</span>
                        <input
                          type="text"
                          value={progItem}
                          onChange={(e) => handlePokjaProgramChange(pokjaIdx, progIdx, e.target.value)}
                          className="flex-1 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePokjaProgram(pokjaIdx, progIdx)}
                          className="text-xs font-bold text-destructive hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Menyimpan…" : "Simpan Perubahan Kampung KB"}
          </button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      {rawImage && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={rawImage}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
