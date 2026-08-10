"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InfoLinkButton } from "@/components/admin/InfoLinkButton";
import { ApprovalNoticeBanner } from "@/components/admin/ApprovalNoticeBanner";
import { compressImage } from "@/lib/image-compression";
import { getPublicImageUrl } from "@/lib/image-url";
import { scrollToFirstError } from "@/lib/form-scroll";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";

type Kategori = "pengumuman" | "kegiatan" | "pembangunan" | "berita" | "kampung-kb";
type Cakupan = "kelurahan" | "rw";

interface FotoItem {
  file?: File;
  previewUrl: string;
  uploadedUrl: string | null;
  uploading: boolean;
  error: string | null;
  masukGaleri: boolean;
  judulGaleri: string;
  /** true = foto lama dari DB (sudah punya URL), tidak perlu re-upload */
  isExisting?: boolean;
}

const MAX_FOTO_TAMBAHAN = 4;

const LIST_RW_OPTIONS = [
  { id: "rw-01", nama: "RW 01 - Bulurejo" },
  { id: "rw-02", nama: "RW 02 - Pocung" },
  { id: "rw-03", nama: "RW 03 - Bonagung" },
  { id: "rw-04", nama: "RW 04 - Tempuran" },
  { id: "rw-05", nama: "RW 05 - Pencil" },
  { id: "rw-06", nama: "RW 06 - Jaten" },
  { id: "rw-07", nama: "RW 07 - Pondok" },
  { id: "rw-08", nama: "RW 08 - Ngasinan" },
  { id: "rw-09", nama: "RW 09 - Soko Lor" },
  { id: "rw-10", nama: "RW 10 - Soko Kidul" },
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
  "kampung-kb": {
    label: "Kampung KB",
    bgClass: "bg-violet-50 text-violet-700 border-violet-200",
    activeClass: "bg-violet-600 text-white border-violet-600 shadow-sm",
    dotColor: "bg-violet-400",
  },
};

function inputClass(hasError?: boolean, isLarge?: boolean) {
  return `w-full rounded-lg border ${
    hasError ? "border-destructive ring-1 ring-destructive/40" : "border-border"
  } bg-card ${
    isLarge ? "px-4 py-3 text-lg font-bold" : "px-3.5 py-2.5 text-sm font-medium"
  } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all`;
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
        <img src={item.previewUrl} alt={`Foto tambahan ${index + 1}`} className="h-full w-full object-cover" />
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
        {item.isExisting && (
          <div className="absolute left-2 top-2 rounded bg-muted-foreground/80 px-2 py-0.5 text-[10px] font-bold text-white">
            Foto Lama
          </div>
        )}
        {item.uploadedUrl && !item.uploading && !item.isExisting && (
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
        {!item.isExisting && (
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
            <input
              type="checkbox"
              checked={item.masukGaleri}
              onChange={() => onToggleGaleri(index)}
              className="accent-primary h-4 w-4"
            />
            Tampilkan juga di Galeri Publik
          </label>
        )}
        {item.masukGaleri && !item.isExisting && (
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Judul di Galeri</label>
            <input
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

export default function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [kategori, setKategori] = useState<Kategori>("berita");
  const [cakupan, setCakupan] = useState<Cakupan>("kelurahan");
  const [rwId, setRwId] = useState("");
  const [rwNama, setRwNama] = useState("");
  const [penulis, setPenulis] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [userTier, setUserTier] = useState<number>(1);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.tier) setUserTier(d.tier);
        if (d?.nama) setUserName(d.nama);
      })
      .catch(() => null);
  }, []);

  // Cover foto — existing URL (dari DB) atau URL baru setelah re-upload
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [rawCoverImage, setRawCoverImage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  const [fotoList, setFotoList] = useState<FotoItem[]>([]);
  const [fotoLimitError, setFotoLimitError] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchBerita() {
      try {
        const res = await fetch(`/api/admin/berita/${id}`);
        if (!res.ok) throw new Error("Gagal memuat data berita.");
        const data = await res.json();

        setJudul(data.judul ?? "");
        setIsi(data.isi ?? "");
        setTanggal(data.tanggal ?? new Date().toISOString().split("T")[0]);
        setKategori(data.kategori ?? "berita");
        setCakupan(data.cakupan ?? "kelurahan");
        setRwId(data.rw_id ?? "");
        setRwNama(data.rw_nama ?? "");
        setPenulis(data.penulis ?? "");
        setVideoUrl(data.video_url ?? "");
        setVideoTitle(data.video_title ?? "");

        // Cover — preserve existing URL, show public URL as preview
        if (data.gambar_cover_url) {
          setCoverUrl(data.gambar_cover_url);
          setCoverPreview(getPublicImageUrl(data.gambar_cover_url));
        }

        // Foto tambahan — mark sebagai existing (sudah punya uploadedUrl)
        if (Array.isArray(data.foto_tambahan) && data.foto_tambahan.length > 0) {
          setFotoList(
            data.foto_tambahan.map((url: string) => ({
              previewUrl: getPublicImageUrl(url),
              uploadedUrl: url,
              uploading: false,
              error: null,
              masukGaleri: false,
              judulGaleri: "",
              isExisting: true,
            }))
          );
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    fetchBerita();
  }, [id]);

  async function uploadFile(file: File): Promise<string> {
    const compressed = await compressImage(file);
    const fd = new FormData();
    fd.append("file", compressed, compressed.name);
    fd.append("folder", "berita");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload gagal");
    const data = await res.json();
    return data.url as string;
  }

  function handleRemoveCover() {
    setCoverFile(null);
    setCoverPreview(null);
    setCoverUrl(null);
    setCoverError(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      fd.append("folder", "berita");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload foto cover gagal.");
      const data = await res.json();
      setCoverUrl(data.url);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Upload gagal.");
      setCoverPreview(null);
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
        setFotoLimitError(`Hanya ${remaining} foto yang ditambahkan.`);
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
        isExisting: false,
      }));

      setFotoList((prev) => [...prev, ...newItems]);

      await Promise.all(
        newItems.map(async (item, i) => {
          const idx = startIdx + i;
          try {
            const url = await uploadFile(item.file!);
            setFotoList((prev) =>
              prev.map((f, j) => (j === idx ? { ...f, uploadedUrl: url, uploading: false } : f))
            );
          } catch {
            setFotoList((prev) =>
              prev.map((f, j) => (j === idx ? { ...f, error: "Upload gagal", uploading: false } : f))
            );
          }
        })
      );

      e.target.value = "";
    },
    [fotoList.length]
  );

  function removeFoto(i: number) {
    setFotoList((prev) => prev.filter((_, j) => j !== i));
    setFotoLimitError(null);
  }

  function toggleGaleri(i: number) {
    setFotoList((prev) => prev.map((f, j) => (j === i ? { ...f, masukGaleri: !f.masukGaleri } : f)));
  }

  function changeJudulGaleri(i: number, val: string) {
    setFotoList((prev) => prev.map((f, j) => (j === i ? { ...f, judulGaleri: val } : f)));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const errorIds: string[] = [];

    if (!judul.trim()) {
      errs.judul = "Judul berita tidak boleh kosong.";
      errorIds.push("judul");
    }
    if (!isi.trim()) {
      errs.isi = "Isi berita tidak boleh kosong.";
      errorIds.push("isi");
    }
    if (!tanggal) {
      errs.tanggal = "Tanggal terbit wajib diisi.";
      errorIds.push("tanggal");
    }
    if (!penulis.trim()) {
      errs.penulis = "Nama penulis wajib diisi.";
      errorIds.push("penulis");
    }
    if (!coverUrl) {
      errs.cover = "Foto headline wajib tersedia.";
      errorIds.push("coverArea");
    }
    if (cakupan === "rw" && !rwId.trim()) {
      errs.rw = "Pilih wilayah RW.";
      errorIds.push("rwSelect");
    }

    setErrors(errs);
    if (errorIds.length > 0) {
      scrollToFirstError(errorIds);
    }
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
        video_url: videoUrl.trim() || undefined,
        video_title: videoTitle.trim() || undefined,
        penulis,
        pengusul: userName || penulis.trim() || "Admin",
        foto_tambahan: fotoList
          .filter((f) => f.uploadedUrl)
          .slice(0, MAX_FOTO_TAMBAHAN)
          .map((f) => f.uploadedUrl as string),
        // Hanya foto BARU yang masukGaleri yang akan di-insert ke galeri
        galeri_foto: fotoList
          .filter((f) => f.uploadedUrl && !f.isExisting)
          .map((f) => ({
            url: f.uploadedUrl as string,
            judul: f.judulGaleri || judul,
            masukGaleri: f.masukGaleri,
          })),
      };

      const res = await fetch(`/api/admin/berita/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal menyimpan perubahan berita.");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Memuat data berita…
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
      <AdminPageHeader title="Edit Berita" />

      <ApprovalNoticeBanner contentType="berita" />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl space-y-8">

        {/* ── 1. Informasi Utama ────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="font-heading text-lg font-extrabold text-foreground">1. Informasi Utama Berita</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Judul, tanggal, penulis, dan kategori berita.</p>
          </div>

          <div className="space-y-6">
            <div>
              <FieldLabel htmlFor="judul" size="lg" required>Judul Berita</FieldLabel>
              <input
                id="judul"
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Tulis judul berita yang menarik & informatif…"
                className={inputClass(!!errors.judul, true)}
              />
              {errors.judul && <p className="mt-1 text-xs text-destructive font-semibold">{errors.judul}</p>}
            </div>

            <div>
              <FieldLabel htmlFor="kategori" size="sm" required>Pilihan Kategori</FieldLabel>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
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
                      {conf.dotColor && <span className={`h-2 w-2 rounded-full ${conf.dotColor} animate-pulse`} />}
                      <span>{conf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="tanggal" size="sm" required>Tanggal Terbit</FieldLabel>
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
                <FieldLabel htmlFor="penulis" size="sm" required>Nama Penulis / Redaksi</FieldLabel>
                <input
                  id="penulis"
                  type="text"
                  value={penulis}
                  onChange={(e) => setPenulis(e.target.value)}
                  placeholder="Contoh: Sekretaris Kelurahan"
                  className={inputClass(!!errors.penulis)}
                />
                {errors.penulis && <p className="mt-1 text-xs text-destructive font-semibold">{errors.penulis}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="cakupan" size="sm" required>Cakupan Wilayah</FieldLabel>
                <select
                  id="cakupan"
                  value={cakupan}
                  onChange={(e) => {
                    const val = e.target.value as Cakupan;
                    setCakupan(val);
                    if (val === "kelurahan") { setRwId(""); setRwNama(""); }
                  }}
                  className={inputClass()}
                >
                  <option value="kelurahan">Seluruh Kelurahan</option>
                  <option value="rw">Wilayah Spesifik (RW)</option>
                </select>
              </div>
            </div>

            {cakupan === "rw" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <FieldLabel htmlFor="rwSelect" size="sm" required>Pilih Wilayah Rukun Warga (RW)</FieldLabel>
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
                  <option value="">-- Pilih Wilayah RW --</option>
                  {LIST_RW_OPTIONS.map((rw) => (
                    <option key={rw.id} value={rw.id}>{rw.nama}</option>
                  ))}
                </select>
                {errors.rw && <p className="mt-1 text-xs text-destructive font-semibold">{errors.rw}</p>}
                {rwNama && (
                  <p className="text-xs text-emerald-700 font-semibold pt-1">
                    ✓ Otomatis terhubung ke: <strong>{rwNama}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── 2. Foto Headline ──────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">2. Foto Headline (Cover Utama)</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Ganti foto jika perlu. Biarkan jika tidak berubah.</p>
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={handleCoverChange}
          />

          <div>
            <div className={`relative flex min-h-[220px] overflow-hidden flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all ${
              errors.cover ? "border-destructive/60 bg-destructive/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}>
              {coverPreview ? (
                <div className="relative w-full p-2 flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="Preview Headline" className="max-h-80 w-full rounded-lg object-contain bg-black/5" />
                  {coverUploading && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 rounded-lg bg-black/75 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md animate-pulse">
                      Mengompres &amp; mengupload foto headline…
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => coverInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 p-8"
                >
                  <p className="text-sm font-bold text-foreground">Pilih Foto Headline Utama</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Pilih foto lalu sesuaikan crop area</p>
                </div>
              )}
            </div>

            {coverUrl && !coverUploading && (
              <p className="mt-1 text-xs font-bold text-emerald-600">✓ Foto headline siap</p>
            )}
            {coverError && <p className="mt-1 text-xs text-destructive font-semibold">{coverError}</p>}
            {errors.cover && !coverError && <p className="mt-1 text-xs text-destructive font-semibold">{errors.cover}</p>}
            {coverPreview && (
              <div className="mt-2 flex items-center gap-3">
                <button type="button" onClick={() => coverInputRef.current?.click()} className="text-xs font-bold text-primary hover:underline">
                  Ganti Foto Headline
                </button>
                <span className="text-muted-foreground">•</span>
                <button type="button" onClick={handleRemoveCover} className="text-xs font-bold text-destructive hover:underline">
                  Hapus Foto
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── 3. Isi Berita ────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">3. Isi Konten Berita</h2>
          </div>
          <div>
            <FieldLabel htmlFor="isi" size="md" required>Teks Konten Berita</FieldLabel>
            <textarea
              id="isi"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={14}
              placeholder="Tuliskan paragraf berita selengkap mungkin di sini…"
              className={`${inputClass(!!errors.isi)} resize-y font-sans text-base leading-relaxed p-4`}
            />
            {errors.isi && <p className="mt-1 text-xs text-destructive font-semibold">{errors.isi}</p>}
            <div className="mt-2 flex justify-end text-xs text-muted-foreground font-medium">
              <span>{isi.length} Karakter</span>
            </div>
          </div>
        </section>

        {/* ── 4. Media & Tautan Eksternal (Opsional) ────────────────────────── */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                4. Media &amp; Tautan Eksternal (Opsional)
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sematkan video (YouTube, TikTok), dokumen (Google Drive), atau link media eksternal terkait berita ini.
              </p>
            </div>
            <InfoLinkButton />
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="videoTitle" size="sm">
                Judul / Label Tautan Media (Opsional)
              </FieldLabel>
              <input
                id="videoTitle"
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Contoh: Video Dokumentasi Liputan / Berkas Lampiran Google Drive / Video TikTok"
                className={inputClass()}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Judul atau keterangan yang akan ditampilkan di atas media pada halaman berita publik.
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="videoUrl" size="sm">
                Link Media / Tautan Eksternal (YouTube, TikTok, Google Drive, dll)
              </FieldLabel>
              <input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/... atau https://drive.google.com/... atau https://vt.tiktok.com/..."
                className={inputClass()}
              />
            </div>
            {videoUrl.trim() && (
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
                <p className="text-xs font-semibold text-foreground">Preview Tautan Media:</p>
                {(() => {
                  const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                  if (ytMatch) {
                    return (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full border-0"
                        />
                      </div>
                    );
                  }
                  const isDrive = videoUrl.includes("drive.google.com");
                  const isTikTok = videoUrl.includes("tiktok.com");
                  const isIG = videoUrl.includes("instagram.com");

                  return (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary font-medium flex items-center gap-2">
                      <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shrink-0">
                        {isDrive ? "Google Drive" : isTikTok ? "TikTok" : isIG ? "Instagram" : "Link Eksternal"}
                      </span>
                      <span className="font-mono text-[11px] truncate flex-1 underline">{videoUrl}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </section>

        {/* ── 5. Foto Tambahan (Dokumentasi Opsional) ──────────────────────── */}
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
                Foto lama otomatis ditampilkan. Hapus yang tidak perlu, atau tambah foto baru.
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
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
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
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-10 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
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

        {/* ── Action Bar ──────────────────────────────────────────────────── */}
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
                  {userTier === 3 || userTier === 4 ? "Mengajukan…" : "Menyimpan…"}
                </>
              ) : (
                "Simpan Perubahan Berita"
              )}
            </button>
          </div>
        </div>
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={rawCoverImage}
          mode="cover"
          defaultRatio="16:9"
          allowedRatios={["16:9", "4:3", "3:2", "1:1"]}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCoverCropComplete}
        />
      </form>
    </div>
  );
}
