"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { compressImage } from "@/lib/image-compression";

type Kategori = "pengumuman" | "kegiatan" | "pembangunan" | "berita";
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

const LIST_RW_OPTIONS = [
  { id: "rw-01", nama: "RW 01 — Dusun Pencil" },
  { id: "rw-02", nama: "RW 02 — Dusun Pencil" },
  { id: "rw-03", nama: "RW 03 — Dusun Ngadirojo" },
  { id: "rw-04", nama: "RW 04 — Dusun Tempuran" },
  { id: "rw-05", nama: "RW 05 — Dusun Pencil" },
  { id: "rw-06", nama: "RW 06 — Dusun Mlokomanis" },
  { id: "rw-07", nama: "RW 07 — Dusun Mlokomanis" },
  { id: "rw-08", nama: "RW 08 — Dusun Kerjo" },
  { id: "rw-09", nama: "RW 09 — Dusun Kerjo" },
  { id: "rw-10", nama: "RW 10 — Dusun Mlokomanis" },
];

const KATEGORI_CONFIG: Record<
  Kategori,
  { label: string; bgClass: string; activeClass: string; dotColor?: string }
> = {
  berita: {
    label: "Berita",
    bgClass: "bg-primary/5 text-primary border-primary/20",
    activeClass: "bg-primary text-white border-primary shadow-sm",
  },
  pengumuman: {
    label: "Pengumuman",
    bgClass: "bg-red-50 text-red-700 border-red-200",
    activeClass: "bg-red-600 text-white border-red-600 shadow-sm",
    dotColor: "bg-red-400",
  },
  kegiatan: {
    label: "Kegiatan",
    bgClass: "bg-blue-50 text-blue-700 border-blue-200",
    activeClass: "bg-blue-600 text-white border-blue-600 shadow-sm",
  },
  pembangunan: {
    label: "Pembangunan",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
  },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FieldLabel({
  htmlFor,
  children,
  required,
  size = "md",
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  size?: "lg" | "md" | "sm";
}) {
  const sizeClasses = {
    lg: "text-base font-extrabold text-foreground",
    md: "text-sm font-bold text-foreground",
    sm: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
  };

  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block ${sizeClasses[size]}`}>
      {children}
      {required && <span className="ml-1 text-destructive font-bold">*</span>}
    </label>
  );
}

function inputClass(hasError?: boolean, isLarge?: boolean) {
  return `w-full rounded-lg border ${
    hasError ? "border-destructive ring-1 ring-destructive/40" : "border-border"
  } bg-card ${
    isLarge ? "px-4 py-3 text-lg font-bold" : "px-3.5 py-2.5 text-sm font-medium"
  } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all`;
}

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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
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
          <div className="absolute left-2 top-2 rounded bg-accent/90 px-2 py-0.5 text-[10px] font-bold text-white">
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
      <div className="space-y-2 p-3.5">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
          <input
            type="checkbox"
            checked={item.masukGaleri}
            onChange={() => onToggleGaleri(index)}
            className="accent-primary h-4 w-4"
            id={`galeri-check-${index}`}
          />
          Tampilkan juga di Galeri Publik
        </label>
        {item.masukGaleri && (
          <div>
            <label
              htmlFor={`galeri-judul-${index}`}
              className="mb-1 block text-[11px] font-medium text-muted-foreground"
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

function ImageUploadZone({
  preview,
  uploading,
  uploadedUrl,
  error,
  fieldError,
  file,
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
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all ${
          fieldError && !error
            ? "border-destructive/60 bg-destructive/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview Headline"
            className="max-h-72 w-full rounded-lg object-contain p-2"
          />
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="m5 17 4.5-5 3 3.5L16 11l4 5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">Pilih Foto Headline Utama</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                JPG, PNG, WebP — Dikompres otomatis (maks 500 KB)
              </p>
            </div>
          </>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-xs">
            <span className="text-sm font-bold text-primary">Mengompres &amp; mengupload foto…</span>
          </div>
        )}
      </div>

      {file && !uploading && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span className="truncate">{file.name}</span>
          <span className="ml-2 shrink-0">{formatBytes(file.size)}</span>
        </div>
      )}
      {uploadedUrl && !uploading && (
        <p className="mt-1 text-xs font-bold text-accent">✓ Foto headline berhasil diupload</p>
      )}
      {error && <p className="mt-1 text-xs text-destructive font-medium">{error}</p>}
      {fieldError && !error && (
        <p className="mt-1 text-xs text-destructive font-medium">{fieldError}</p>
      )}
      {preview && (
        <button
          type="button"
          onClick={onPickClick}
          className="mt-2 text-xs font-bold text-primary hover:underline"
        >
          Ganti Foto Headline
        </button>
      )}
    </div>
  );
}

export default function TambahBeritaPage() {
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [kategori, setKategori] = useState<Kategori>("berita");
  const [cakupan, setCakupan] = useState<Cakupan>("kelurahan");
  const [rwId, setRwId] = useState("");
  const [rwNama, setRwNama] = useState("");
  const [penulis, setPenulis] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [fotoList, setFotoList] = useState<FotoItem[]>([]);
  const [fotoLimitError, setFotoLimitError] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function uploadFile(file: File): Promise<string> {
    const compressed = await compressImage(file);
    const fd = new FormData();
    fd.append("file", compressed, compressed.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload gagal");
    const data = await res.json();
    return data.url as string;
  }

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

  const handleFotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      setFotoLimitError(null);

      const currentCount = fotoList.length;
      const remaining = MAX_FOTO_TAMBAHAN - currentCount;

      if (remaining <= 0) {
        setFotoLimitError(`Maksimal ${MAX_FOTO_TAMBAHAN} foto tambahan.`);
        e.target.value = "";
        return;
      }

      const allowed = files.slice(0, remaining);
      if (files.length > remaining) {
        setFotoLimitError(`Hanya ${remaining} foto yang ditambahkan (batas maks ${MAX_FOTO_TAMBAHAN} foto).`);
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
              prev.map((f, j) => (j === idx ? { ...f, uploadedUrl: url, uploading: false } : f)),
            );
          } catch {
            setFotoList((prev) =>
              prev.map((f, j) => (j === idx ? { ...f, error: "Upload gagal", uploading: false } : f)),
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

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!judul.trim()) errs.judul = "Judul berita tidak boleh kosong.";
    if (!isi.trim()) errs.isi = "Isi berita tidak boleh kosong.";
    if (!tanggal) errs.tanggal = "Tanggal terbit wajib diisi.";
    if (!penulis.trim()) errs.penulis = "Nama penulis wajib diisi.";
    if (!coverUrl) errs.cover = "Foto headline wajib diupload.";
    if (cakupan === "rw" && !rwId.trim()) errs.rw = "Pilih wilayah RW.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

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

  return (
    <div>
      <AdminPageHeader title="Tambah Berita" />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl space-y-8">

        {/* ── 1. Informasi Utama & Judul (Hirarki Utama: Font Besar) ────────── */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="font-heading text-lg font-extrabold text-foreground">
              1. Informasi Utama Berita
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Isi judul utama, tanggal terbit, nama penulis, dan tentukan kategori berita.
            </p>
          </div>

          <div className="space-y-6">
            {/* Judul Berita (Fitur Utama: Font Paling Besar) */}
            <div>
              <FieldLabel htmlFor="judul" size="lg" required>
                Judul Berita
              </FieldLabel>
              <input
                id="judul"
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Tulis judul berita yang menarik &amp; informatif…"
                className={inputClass(!!errors.judul, true)}
              />
              {errors.judul && <p className="mt-1 text-xs text-destructive font-semibold">{errors.judul}</p>}
            </div>

            {/* Pilihan Kategori dengan Pembeda Warna Visual (Visual Badges) */}
            <div>
              <FieldLabel htmlFor="kategori" size="sm" required>
                Pilihan Kategori
              </FieldLabel>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {(Object.keys(KATEGORI_CONFIG) as Kategori[]).map((key) => {
                  const conf = KATEGORI_CONFIG[key];
                  const isSelected = kategori === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setKategori(key)}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-bold transition-all ${
                        isSelected ? conf.activeClass : conf.bgClass
                      }`}
                    >
                      {conf.dotColor && (
                        <span className={`h-2 w-2 rounded-full ${conf.dotColor} animate-pulse`} />
                      )}
                      <span>{conf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tanggal Terbit, Penulis & Cakupan Wilayah */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="tanggal" size="sm" required>
                  Tanggal Terbit
                </FieldLabel>
                <input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className={inputClass(!!errors.tanggal)}
                />
                {errors.tanggal && <p className="mt-1 text-xs text-destructive font-semibold">{errors.tanggal}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="penulis" size="sm" required>
                  Nama Penulis / Redaksi
                </FieldLabel>
                <input
                  id="penulis"
                  type="text"
                  value={penulis}
                  onChange={(e) => setPenulis(e.target.value)}
                  placeholder="Nama penulis…"
                  className={inputClass(!!errors.penulis)}
                />
                {errors.penulis && <p className="mt-1 text-xs text-destructive font-semibold">{errors.penulis}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="cakupan" size="sm" required>
                  Cakupan Wilayah
                </FieldLabel>
                <select
                  id="cakupan"
                  value={cakupan}
                  onChange={(e) => {
                    const val = e.target.value as Cakupan;
                    setCakupan(val);
                    if (val === "kelurahan") {
                      setRwId("");
                      setRwNama("");
                    }
                  }}
                  className={inputClass()}
                >
                  <option value="kelurahan">Seluruh Kelurahan</option>
                  <option value="rw">Wilayah Spesifik (RW)</option>
                </select>
              </div>
            </div>

            {/* Auto-Filled Dropdown RW (Single Select Auto-Connect) */}
            {cakupan === "rw" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <FieldLabel htmlFor="rwSelect" size="sm" required>
                  Pilih Wilayah Rukun Warga (RW)
                </FieldLabel>
                <select
                  id="rwSelect"
                  value={rwId}
                  onChange={(e) => {
                    const selected = LIST_RW_OPTIONS.find((r) => r.id === e.target.value);
                    if (selected) {
                      setRwId(selected.id);
                      setRwNama(selected.nama.split("—")[0].trim());
                    } else {
                      setRwId("");
                      setRwNama("");
                    }
                  }}
                  className={inputClass(!!errors.rw)}
                >
                  <option value="">-- Pilih Wilayah RW (Otomatis Terhubung) --</option>
                  {LIST_RW_OPTIONS.map((rw) => (
                    <option key={rw.id} value={rw.id}>
                      {rw.nama}
                    </option>
                  ))}
                </select>
                {errors.rw && <p className="mt-1 text-xs text-destructive font-semibold">{errors.rw}</p>}
                {rwNama && (
                  <p className="text-xs text-emerald-700 font-semibold pt-1">
                    ✓ Otomatis terhubung ke: <strong>{rwNama}</strong> (ID Database: <code className="bg-emerald-100 px-1 py-0.5 rounded">{rwId}</code>)
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── 2. Foto Headline (Ditukar Posisi: Sebelum Isi Berita) ──────────── */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                2. Foto Headline (Cover Utama)
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Foto utama yang akan tampil besar di bagian paling atas halaman berita.
              </p>
            </div>
            <span className="text-xs font-bold text-destructive">* Wajib</span>
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

        {/* ── 3. Isi Berita (Ditukar Posisi: Setelah Foto Headline) ──────────── */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                3. Isi Konten Berita
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tulis narasi berita atau detail pengumuman secara lengkap.
              </p>
            </div>
            <span className="text-xs font-bold text-destructive">* Wajib</span>
          </div>

          <div>
            <FieldLabel htmlFor="isi" size="md" required>
              Teks Konten Berita
            </FieldLabel>
            <textarea
              id="isi"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={14}
              placeholder="Tuliskan paragraf berita selengkap mungkin di sini…"
              className={`${inputClass(!!errors.isi)} resize-y font-sans text-base leading-relaxed p-4`}
            />
            {errors.isi && <p className="mt-1 text-xs text-destructive font-semibold">{errors.isi}</p>}
            <div className="mt-2 flex justify-between text-xs text-muted-foreground font-medium">
              <span>Gunakan pemisah Enter untuk membuat paragraf baru.</span>
              <span>{isi.length} Karakter</span>
            </div>
          </div>
        </section>

        {/* ── 4. Foto Tambahan (Dokumentasi Opsional) ──────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                4. Foto Tambahan (Dokumentasi)
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  ({fotoList.length}/{MAX_FOTO_TAMBAHAN})
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Opsional. Ditampilkan sebagai grid 2×2 di bawah isi berita.
              </p>
            </div>

            {fotoSlotsLeft > 0 && (
              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                className="shrink-0 rounded-lg border border-border bg-muted px-3.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
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

          {fotoLimitError && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 font-medium">
              {fotoLimitError}
            </div>
          )}

          {fotoList.length === 0 ? (
            <div
              onClick={() => fotoInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fotoInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-10 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round"
                className="h-8 w-8 text-muted-foreground">
                <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="m5 17 4.5-5 3 3.5L16 11l4 5" />
              </svg>
              <p className="text-xs font-semibold text-muted-foreground">
                Klik untuk pilih foto tambahan (maks {MAX_FOTO_TAMBAHAN} foto)
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
        </section>

        {/* ── Sticky Bottom Action Bar ──────────────────────────────────────── */}
        {submitError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium">
            {submitError}
          </div>
        )}

        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-md">
          <p className="text-xs text-muted-foreground font-medium">
            {isUploading ? (
              <span className="font-semibold text-primary">Mengompres &amp; mengupload foto…</span>
            ) : (
              "Pastikan seluruh field bertanda * sudah terisi."
            )}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || isUploading}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </form>
    </div>
  );
}
