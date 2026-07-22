"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { compressImage } from "@/lib/image-compression";

// ─── types lokal ──────────────────────────────────────────────────────────────
type Kategori = "pengumuman" | "kegiatan" | "pembangunan";
type Cakupan = "kelurahan" | "rw";

interface FotoItem {
  file: File;
  previewUrl: string;
  uploadedUrl: string | null;
  uploading: boolean;
  error: string | null;
  masukGaleri: boolean;
  judulGaleri: string;
}

const MAX_FOTO_TAMBAHAN = 4;

// ─── helper ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── sub-komponen ─────────────────────────────────────────────────────────────
function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  );
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-md border ${
    hasError ? "border-destructive" : "border-border"
  } bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow`;
}

// ─── kartu foto tambahan ──────────────────────────────────────────────────────
function FotoCard({
  item,
  index,
  onRemove,
  onToggleGaleri,
  onChangeJudul,
}: {
  item: FotoItem;
  index: number;
  onRemove: (i: number) => void;
  onToggleGaleri: (i: number) => void;
  onChangeJudul: (i: number, val: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-video w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.previewUrl}
          alt={`Foto tambahan ${index + 1}`}
          className="h-full w-full object-cover"
        />
        {item.uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-xs font-medium text-white">Mengompres &amp; upload…</span>
          </div>
        )}
        {item.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 px-2 text-center">
            <span className="text-xs text-white">{item.error}</span>
          </div>
        )}
        {item.uploadedUrl && !item.uploading && (
          <div className="absolute left-2 top-2 rounded bg-accent/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
            ✓ Terupload
          </div>
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Hapus foto"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/90 text-white transition-opacity hover:bg-destructive"
        >
          ×
        </button>
      </div>
      <div className="space-y-2 p-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={item.masukGaleri}
            onChange={() => onToggleGaleri(index)}
            className="accent-primary"
            id={`galeri-check-${index}`}
          />
          Tampilkan juga di Galeri
        </label>
        {item.masukGaleri && (
          <div>
            <label
              htmlFor={`galeri-judul-${index}`}
              className="mb-1 block text-xs text-muted-foreground"
            >
              Judul di Galeri
            </label>
            <input
              id={`galeri-judul-${index}`}
              type="text"
              value={item.judulGaleri}
              onChange={(e) => onChangeJudul(index, e.target.value)}
              placeholder="Otomatis dari judul berita jika kosong"
              className={inputClass()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── zona upload gambar (cover / headline) ────────────────────────────────────
function ImageUploadZone({
  id,
  preview,
  uploading,
  uploadedUrl,
  error,
  fieldError,
  file,
  inputRef,
  onPickClick,
}: {
  id: string;
  preview: string | null;
  uploading: boolean;
  uploadedUrl: string | null;
  error: string | null;
  fieldError?: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPickClick: () => void;
}) {
  return (
    <div>
      <div
        onClick={onPickClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onPickClick()}
        className={`relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors ${
          fieldError && !error
            ? "border-destructive/60 bg-destructive/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 w-full rounded object-contain"
          />
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="m5 17 4.5-5 3 3.5L16 11l4 5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Klik untuk pilih gambar</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                JPG, PNG, WebP — dikompresi otomatis ke WebP (maks 500 KB)
              </p>
            </div>
          </>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70">
            <span className="text-sm font-medium text-primary">Mengompres &amp; upload…</span>
          </div>
        )}
      </div>

      {file && !uploading && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{file.name}</span>
          <span className="ml-2 shrink-0">{formatBytes(file.size)}</span>
        </div>
      )}
      {uploadedUrl && !uploading && (
        <p className="mt-1 text-xs text-accent">✓ Berhasil diupload</p>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {fieldError && !error && (
        <p className="mt-1 text-xs text-destructive">{fieldError}</p>
      )}
      {preview && (
        <button
          type="button"
          onClick={onPickClick}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Ganti gambar
        </button>
      )}
    </div>
  );
}

// ─── halaman utama ─────────────────────────────────────────────────────────────
export default function TambahBeritaPage() {
  const router = useRouter();

  // ── field teks ─────────────────────────────────────────────────────────────
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [tanggal, setTanggal] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [kategori, setKategori] = useState<Kategori>("kegiatan");
  const [cakupan, setCakupan] = useState<Cakupan>("kelurahan");
  const [rwId, setRwId] = useState("");
  const [rwNama, setRwNama] = useState("");
  const [penulis, setPenulis] = useState("");

  // ── foto headline (cover) ──────────────────────────────────────────────────
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── foto tambahan (maks 4) ─────────────────────────────────────────────────
  const [fotoList, setFotoList] = useState<FotoItem[]>([]);
  const [fotoLimitError, setFotoLimitError] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // ── submit state ───────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── upload helper ──────────────────────────────────────────────────────────
  async function uploadFile(file: File): Promise<string> {
    const compressed = await compressImage(file);
    const fd = new FormData();
    fd.append("file", compressed, compressed.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload gagal");
    const data = await res.json();
    return data.url as string;
  }

  // ── handle foto headline ───────────────────────────────────────────────────
  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverUrl(null);
    setCoverError(null);
    setCoverUploading(true);
    try {
      const url = await uploadFile(file);
      setCoverUrl(url);
    } catch {
      setCoverError("Upload foto headline gagal. Coba lagi.");
    } finally {
      setCoverUploading(false);
    }
  }

  // ── handle foto tambahan (multi, maks 4) ──────────────────────────────────
  const handleFotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      setFotoLimitError(null);

      // Hitung slot yang masih tersedia
      const currentCount = fotoList.length;
      const remaining = MAX_FOTO_TAMBAHAN - currentCount;

      if (remaining <= 0) {
        setFotoLimitError(`Maksimal ${MAX_FOTO_TAMBAHAN} foto tambahan.`);
        e.target.value = "";
        return;
      }

      const allowed = files.slice(0, remaining);
      if (files.length > remaining) {
        setFotoLimitError(
          `Hanya ${remaining} foto yang ditambahkan (batas maks ${MAX_FOTO_TAMBAHAN} foto).`,
        );
      }

      const startIdx = currentCount;
      const newItems: FotoItem[] = allowed.map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
        uploadedUrl: null,
        uploading: true,
        error: null,
        masukGaleri: false,
        judulGaleri: "",
      }));

      setFotoList((prev) => [...prev, ...newItems]);

      await Promise.all(
        newItems.map(async (item, i) => {
          const idx = startIdx + i;
          try {
            const url = await uploadFile(item.file);
            setFotoList((prev) =>
              prev.map((f, j) =>
                j === idx ? { ...f, uploadedUrl: url, uploading: false } : f,
              ),
            );
          } catch {
            setFotoList((prev) =>
              prev.map((f, j) =>
                j === idx ? { ...f, error: "Upload gagal", uploading: false } : f,
              ),
            );
          }
        }),
      );

      e.target.value = "";
    },
    [fotoList.length],
  );

  function removeFoto(i: number) {
    setFotoList((prev) => prev.filter((_, j) => j !== i));
    setFotoLimitError(null);
  }

  function toggleGaleri(i: number) {
    setFotoList((prev) =>
      prev.map((f, j) => (j === i ? { ...f, masukGaleri: !f.masukGaleri } : f)),
    );
  }

  function changeJudulGaleri(i: number, val: string) {
    setFotoList((prev) =>
      prev.map((f, j) => (j === i ? { ...f, judulGaleri: val } : f)),
    );
  }

  // ── validasi ───────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!judul.trim()) errs.judul = "Judul tidak boleh kosong.";
    if (!isi.trim()) errs.isi = "Isi berita tidak boleh kosong.";
    if (!tanggal) errs.tanggal = "Tanggal wajib diisi.";
    if (!penulis.trim()) errs.penulis = "Nama penulis tidak boleh kosong.";
    if (!coverUrl) errs.cover = "Foto headline wajib diupload.";
    if (cakupan === "rw" && !rwId.trim()) errs.rw = "Isi ID RW untuk cakupan RW.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    if (coverUploading || fotoList.some((f) => f.uploading)) {
      setSubmitError("Tunggu hingga semua foto selesai diupload.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        judul,
        isi,
        tanggal,
        kategori,
        cakupan,
        rw_id: cakupan === "rw" ? rwId : undefined,
        rw_nama: cakupan === "rw" ? rwNama : undefined,
        gambar_cover_url: coverUrl,
        penulis,
        foto_tambahan: fotoList
          .filter((f) => f.uploadedUrl)
          .slice(0, MAX_FOTO_TAMBAHAN)
          .map((f) => f.uploadedUrl as string),
        galeri_foto: fotoList
          .filter((f) => f.uploadedUrl)
          .slice(0, MAX_FOTO_TAMBAHAN)
          .map((f) => ({
            url: f.uploadedUrl as string,
            judul: f.judulGaleri || judul,
            masukGaleri: f.masukGaleri,
          })),
      };

      const res = await fetch("/api/admin/berita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal menyimpan berita.");
      }

      router.push("/admin/berita");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  const isUploading = coverUploading || fotoList.some((f) => f.uploading);
  const fotoSlotsLeft = MAX_FOTO_TAMBAHAN - fotoList.length;

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <AdminPageHeader title="Tambah Berita" />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl space-y-8">

        {/* ── 1. Informasi Utama ──────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 font-heading text-base font-semibold text-foreground">
            Informasi Utama
          </h2>

          <div className="space-y-5">
            {/* Judul */}
            <div>
              <FieldLabel htmlFor="judul" required>Judul Berita</FieldLabel>
              <input
                id="judul"
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Masukkan judul berita…"
                className={inputClass(!!errors.judul)}
              />
              {errors.judul && <p className="mt-1 text-xs text-destructive">{errors.judul}</p>}
            </div>

            {/* Penulis */}
            <div>
              <FieldLabel htmlFor="penulis" required>Nama Penulis</FieldLabel>
              <input
                id="penulis"
                type="text"
                value={penulis}
                onChange={(e) => setPenulis(e.target.value)}
                placeholder="Nama penulis / redaksi…"
                className={inputClass(!!errors.penulis)}
              />
              {errors.penulis && <p className="mt-1 text-xs text-destructive">{errors.penulis}</p>}
            </div>

            {/* Tanggal / Kategori / Cakupan */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="tanggal" required>Tanggal Terbit</FieldLabel>
                <input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className={inputClass(!!errors.tanggal)}
                />
                {errors.tanggal && <p className="mt-1 text-xs text-destructive">{errors.tanggal}</p>}
              </div>
              <div>
                <FieldLabel htmlFor="kategori" required>Kategori</FieldLabel>
                <select
                  id="kategori"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as Kategori)}
                  className={inputClass()}
                >
                  <option value="pengumuman">Pengumuman</option>
                  <option value="kegiatan">Kegiatan</option>
                  <option value="pembangunan">Pembangunan</option>
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="cakupan" required>Cakupan</FieldLabel>
                <select
                  id="cakupan"
                  value={cakupan}
                  onChange={(e) => setCakupan(e.target.value as Cakupan)}
                  className={inputClass()}
                >
                  <option value="kelurahan">Seluruh Kelurahan</option>
                  <option value="rw">Per RW</option>
                </select>
              </div>
            </div>

            {/* Field RW — kondisional */}
            {cakupan === "rw" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="rwId" required>ID RW</FieldLabel>
                  <input
                    id="rwId"
                    type="text"
                    value={rwId}
                    onChange={(e) => setRwId(e.target.value)}
                    placeholder="Contoh: rw-01"
                    className={inputClass(!!errors.rw)}
                  />
                  {errors.rw && <p className="mt-1 text-xs text-destructive">{errors.rw}</p>}
                </div>
                <div>
                  <FieldLabel htmlFor="rwNama">Nama RW</FieldLabel>
                  <input
                    id="rwNama"
                    type="text"
                    value={rwNama}
                    onChange={(e) => setRwNama(e.target.value)}
                    placeholder="Contoh: RW 01"
                    className={inputClass()}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 2. Isi Berita ───────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 font-heading text-base font-semibold text-foreground">
            Isi Berita
          </h2>
          <div>
            <FieldLabel htmlFor="isi" required>Konten</FieldLabel>
            <textarea
              id="isi"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={14}
              placeholder="Tulis isi berita di sini…"
              className={`${inputClass(!!errors.isi)} resize-y font-sans leading-relaxed`}
            />
            {errors.isi && <p className="mt-1 text-xs text-destructive">{errors.isi}</p>}
            <p className="mt-1.5 text-xs text-muted-foreground">{isi.length} karakter</p>
          </div>
        </section>

        {/* ── 3. Foto Headline ────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Foto Headline
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Foto utama yang tampil besar di bagian atas halaman berita.
            </p>
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="cover-input"
            onChange={handleCoverChange}
          />

          <ImageUploadZone
            id="cover-input"
            preview={coverPreview}
            uploading={coverUploading}
            uploadedUrl={coverUrl}
            error={coverError}
            fieldError={errors.cover}
            file={coverFile}
            inputRef={coverInputRef}
            onPickClick={() => coverInputRef.current?.click()}
          />
        </section>

        {/* ── 4. Foto Tambahan (maks 4) ────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Foto Tambahan
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({fotoList.length}/{MAX_FOTO_TAMBAHAN})
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Opsional. Ditampilkan sebagai grid 2×2 di bawah isi berita.
                Centang &ldquo;Tampilkan di Galeri&rdquo; agar foto muncul di halaman Galeri publik.
              </p>
            </div>

            {fotoSlotsLeft > 0 && (
              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                className="shrink-0 rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                + Tambah Foto
              </button>
            )}
          </div>

          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="foto-tambahan-input"
            onChange={handleFotoChange}
          />

          {/* Pesan limit */}
          {fotoLimitError && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {fotoLimitError}
            </div>
          )}

          {fotoList.length === 0 ? (
            <div
              onClick={() => fotoInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fotoInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-10 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round"
                className="h-8 w-8 text-muted-foreground">
                <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="m5 17 4.5-5 3 3.5L16 11l4 5" />
              </svg>
              <p className="text-sm text-muted-foreground">
                Klik untuk pilih foto (maks {MAX_FOTO_TAMBAHAN} foto)
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {fotoList.map((item, i) => (
                <FotoCard
                  key={i}
                  item={item}
                  index={i}
                  onRemove={removeFoto}
                  onToggleGaleri={toggleGaleri}
                  onChangeJudul={changeJudulGaleri}
                />
              ))}
            </div>
          )}

          {/* Info slot tersisa */}
          {fotoList.length > 0 && fotoSlotsLeft > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Masih bisa tambah {fotoSlotsLeft} foto lagi.
            </p>
          )}
          {fotoSlotsLeft === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Batas maksimum {MAX_FOTO_TAMBAHAN} foto sudah tercapai.
            </p>
          )}
        </section>

        {/* ── Error global & Tombol submit ──────────────────────────────────── */}
        {submitError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || isUploading}
            className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Menyimpan…
              </>
            ) : (
              "Simpan Berita"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
