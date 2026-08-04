"use client";

import { useEffect, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { compressImage } from "@/lib/image-compression";
import { getPublicImageUrl } from "@/lib/image-url";
import { scrollToFirstError } from "@/lib/form-scroll";
import type { KampungKb, KampungKbPokja } from "@/lib/types";

function FieldLabel({
  htmlFor,
  children,
  required,
  size = "md",
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  size?: "md" | "sm";
}) {
  const sizeClasses =
    size === "sm"
      ? "text-xs font-bold uppercase tracking-wider text-muted-foreground"
      : "text-sm font-bold text-foreground";

  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block ${sizeClasses}`}>
      {children}
      {required && <span className="ml-1 text-destructive font-bold">*</span>}
    </label>
  );
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-lg border ${
    hasError ? "border-destructive ring-1 ring-destructive/40" : "border-border"
  } bg-card px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all`;
}

const DEFAULT_RW_REF = "rw-05";

export default function PengaturanKampungKbPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [rwRef, setRwRef] = useState(DEFAULT_RW_REF);
  const [namaProgram, setNamaProgram] = useState("");
  const [ketua, setKetua] = useState("");
  const [skTahun, setSkTahun] = useState("2023");
  const [deskripsiProgram, setDeskripsiProgram] = useState("");

  // Lists
  const [fungsiList, setFungsiList] = useState<string[]>([]);
  const [pengurusInti, setPengurusInti] = useState<Array<{ jabatan: string; nama: string }>>([]);
  const [pokjaList, setPokjaList] = useState<KampungKbPokja[]>([]);

  // Foto Highlight Upload (langsung upload, tanpa crop — foto lanskap, bukan pasfoto)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoUploading, setFotoUploading] = useState(false);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/kampung-kb");
        if (!res.ok) throw new Error("Gagal memuat pengaturan Kampung KB.");
        const data: KampungKb = await res.json();

        setRwRef(data.rw_ref || DEFAULT_RW_REF);
        setNamaProgram(data.nama_program || "");
        setKetua(data.ketua || "");
        setSkTahun(data.sk_tahun || "2023");
        setDeskripsiProgram(data.deskripsi_program || "");
        setFotoUrl(data.foto_highlight_url || null);
        setFotoPreview(data.foto_highlight_url ? getPublicImageUrl(data.foto_highlight_url) : null);
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

  // ── Foto Highlight Handlers ──────────────────────────────────────────────
  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFotoPreview(URL.createObjectURL(file));
    setFotoError(null);
    setFotoUploading(true);

    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("file", compressed, compressed.name);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload foto gagal.");

      const data = await res.json();
      setFotoUrl(data.url);
    } catch (err) {
      setFotoError(err instanceof Error ? err.message : "Upload foto gagal.");
    } finally {
      setFotoUploading(false);
      if (e.target) e.target.value = "";
    }
  }

  function handleRemoveFoto() {
    setFotoUrl(null);
    setFotoPreview(null);
    setFotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    if (fotoUploading) {
      setError("Tunggu hingga foto highlight selesai diupload sebelum menyimpan.");
      scrollToFirstError(["fotoArea"]);
      return;
    }

    setSubmitting(true);
    try {
      const payload: KampungKb = {
        rw_ref: rwRef,
        nama_program: namaProgram.trim(),
        ketua: ketua.trim(),
        sk_tahun: skTahun.trim(),
        deskripsi_program: deskripsiProgram.trim(),
        foto_highlight_url: fotoUrl || "",
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
    <div className="max-w-4xl">
      <AdminPageHeader title="Pengaturan Kampung KB" />
      <p className="mb-4 text-xs text-muted-foreground font-medium">
        Kelola informasi program Kampung KB (foto highlight, tujuan, pengurus inti, &amp; pokja) yang tampil pada website utama.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 font-bold">
          ✓ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Card 1: Informasi Umum & Header Foto */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="font-heading text-lg font-extrabold text-foreground">
              1. Informasi Umum &amp; Foto Highlight
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nama program, ketua pelaksana, tahun SK, dan foto utama yang tampil di halaman Kampung KB.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="namaProgram" required>
                Nama Program Kampung KB
              </FieldLabel>
              <input
                id="namaProgram"
                type="text"
                value={namaProgram}
                onChange={(e) => setNamaProgram(e.target.value)}
                placeholder="mis. Guyub Hanyawiji"
                className={inputClass()}
              />
            </div>

            <div>
              <FieldLabel htmlFor="ketua" required>
                Ketua Pelaksana
              </FieldLabel>
              <input
                id="ketua"
                type="text"
                value={ketua}
                onChange={(e) => setKetua(e.target.value)}
                placeholder="mis. Mujiono, S.Pd.I., M.Pd.I."
                className={inputClass()}
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="skTahun">Tahun SK Penetapan Kelurahan</FieldLabel>
            <input
              id="skTahun"
              type="text"
              value={skTahun}
              onChange={(e) => setSkTahun(e.target.value)}
              placeholder="mis. 2023"
              className={inputClass()}
            />
          </div>

          <div>
            <FieldLabel htmlFor="deskripsiProgram" required>
              Deskripsi Utama Program
            </FieldLabel>
            <textarea
              id="deskripsiProgram"
              rows={4}
              value={deskripsiProgram}
              onChange={(e) => setDeskripsiProgram(e.target.value)}
              placeholder="Tuliskan deskripsi lengkap Kampung KB..."
              className={`${inputClass()} resize-y`}
            />
          </div>

          {/* Upload Foto Highlight — upload langsung + kompresi, tanpa crop paksa (foto lanskap) */}
          <div id="fotoArea">
            <FieldLabel htmlFor="fotoInput">Foto Highlight Utama</FieldLabel>

            <input
              ref={fileInputRef}
              id="fotoInput"
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={handleFotoChange}
            />

            <div
              className={`relative flex min-h-[200px] overflow-hidden flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all ${
                fotoError ? "border-destructive/60 bg-destructive/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              {fotoPreview ? (
                <div className="relative w-full p-2 flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoPreview}
                    alt="Preview Foto Highlight"
                    className="max-h-64 w-full rounded-lg object-cover bg-black/5"
                  />
                  {fotoUploading && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 rounded-lg bg-black/75 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md shadow-md animate-pulse">
                      <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Mengompres &amp; mengupload foto…</span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                      strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                      <circle cx="8.5" cy="9.5" r="1.5" />
                      <path d="m5 17 4.5-5 3 3.5L16 11l4 5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Klik untuk upload foto highlight</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, WebP, dikompresi otomatis (maks 500 KB)</p>
                  </div>
                </div>
              )}
            </div>

            {fotoError && <p className="mt-1 text-xs text-destructive font-semibold">{fotoError}</p>}

            {fotoPreview && (
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Ganti Foto
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={handleRemoveFoto}
                  className="text-xs font-bold text-destructive hover:underline"
                >
                  Hapus Foto
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Card 2: Tujuan Program */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-heading text-lg font-extrabold text-foreground">
                2. Tujuan Program Kampung KB
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Format <span className="font-bold text-foreground">Judul Tujuan: Keterangan penjelas</span> agar judul di-bold otomatis.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFungsi}
              className="shrink-0 rounded-lg border border-border bg-muted px-3.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              + Tambah Tujuan
            </button>
          </div>

          <div className="space-y-3">
            {fungsiList.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                Belum ada tujuan program. Klik &quot;+ Tambah Tujuan&quot; untuk menambahkan.
              </p>
            ) : (
              fungsiList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleFungsiChange(idx, e.target.value)}
                    className={inputClass()}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFungsi(idx)}
                    className="shrink-0 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Card 3: Pengurus Inti */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-heading text-lg font-extrabold text-foreground">3. Pengurus Inti</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Susunan penasehat, penanggung jawab, sekretaris, &amp; bendahara.</p>
            </div>
            <button
              type="button"
              onClick={handleAddPengurus}
              className="shrink-0 rounded-lg border border-border bg-muted px-3.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              + Tambah Pengurus
            </button>
          </div>

          {pengurusInti.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
              Belum ada pengurus inti. Klik &quot;+ Tambah Pengurus&quot; untuk menambahkan.
            </p>
          ) : (
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
                    className={`${inputClass()} py-1.5 font-bold`}
                  />
                  <input
                    type="text"
                    value={p.nama}
                    onChange={(e) => handlePengurusChange(idx, "nama", e.target.value)}
                    placeholder="Nama Lengkap"
                    className={`${inputClass()} py-1.5`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Card 4: Pokja (Kelompok Kerja) */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-heading text-lg font-extrabold text-foreground">4. Kelompok Kerja (Pokja)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Daftar pokja beserta program kerja masing-masing.</p>
            </div>
            <button
              type="button"
              onClick={handleAddPokja}
              className="shrink-0 rounded-lg border border-border bg-muted px-3.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              + Tambah Pokja
            </button>
          </div>

          {pokjaList.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
              Belum ada pokja. Klik &quot;+ Tambah Pokja&quot; untuk menambahkan.
            </p>
          ) : (
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
                      <label className="mb-1 block text-[11px] font-bold text-foreground">Nama Pokja</label>
                      <input
                        type="text"
                        value={pokja.nama}
                        onChange={(e) => handlePokjaMetaChange(pokjaIdx, "nama", e.target.value)}
                        className={`${inputClass()} py-1.5 font-bold`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-foreground">Ketua Pokja</label>
                      <input
                        type="text"
                        value={pokja.ketua}
                        onChange={(e) => handlePokjaMetaChange(pokjaIdx, "ketua", e.target.value)}
                        className={`${inputClass()} py-1.5`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-foreground">Anggota Pokja</label>
                      <input
                        type="text"
                        value={pokja.anggota}
                        onChange={(e) => handlePokjaMetaChange(pokjaIdx, "anggota", e.target.value)}
                        className={`${inputClass()} py-1.5`}
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
                            className={`${inputClass()} py-1.5`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePokjaProgram(pokjaIdx, progIdx)}
                            className="shrink-0 text-xs font-bold text-destructive hover:underline"
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
          )}
        </section>

        {/* Sticky Bottom Action Bar */}
        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-md">
          <p className="text-xs text-muted-foreground font-medium">
            {fotoUploading ? (
              <span className="font-semibold text-primary">Mengompres &amp; mengupload foto…</span>
            ) : (
              "Pastikan seluruh field bertanda * sudah terisi."
            )}
          </p>
          <button
            type="submit"
            disabled={submitting || fotoUploading}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Menyimpan…
              </>
            ) : (
              "Simpan Perubahan Kampung KB"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
