"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalNoticeBanner } from "@/components/admin/ApprovalNoticeBanner";
import { compressImage } from "@/lib/image-compression";

export default function TambahEventPage() {
  const router = useRouter();

  const [session, setSession] = useState<{ nama: string; tier: number } | null>(null);

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split("T")[0]);
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [jamMulai, setJamMulai] = useState("08:00 WIB");
  const [lokasi, setLokasi] = useState("Pendopo Kelurahan");
  const [penulis, setPenulis] = useState("");

  // Cover / Thumbnail Upload State (Direct Upload)
  const [gambarCoverUrl, setGambarCoverUrl] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const localUrl = URL.createObjectURL(selected);
    setCoverPreview(localUrl);
    setCoverUploading(true);
    setCoverError(null);

    try {
      const compressed = await compressImage(selected);

      const fd = new FormData();
      fd.append("file", compressed, compressed.name);
      fd.append("folder", "event");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload foto poster event gagal.");

      const data = await res.json();
      setGambarCoverUrl(data.url);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Upload gagal.");
      setCoverPreview(null);
    } finally {
      setCoverUploading(false);
      if (e.target) e.target.value = "";
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
      const res = await fetch("/api/admin/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          slug,
          deskripsi,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai || null,
          jam_mulai: jamMulai,
          lokasi,
          gambar_cover_url: gambarCoverUrl,
          penulis,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal menyimpan agenda event.");
      }

      router.push("/admin/event");
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
        title="Buat Agenda Event Baru"
        description="Kelola dan publikasikan kegiatan atau event mendatang di kelurahan."
        actions={
          <Link
            href="/admin/event"
            className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted"
          >
            ← Kembali
          </Link>
        }
      />

      <ApprovalNoticeBanner contentType="event" />

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-bold text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Informasi Utama Event ── */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">1. Informasi Utama Event</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Judul kegiatan, tempat/lokasi, dan penyelenggara.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Judul Event / Kegiatan *</label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => handleJudulChange(e.target.value)}
              placeholder="Contoh: Jalan Sehat Bersama Warga Kelurahan Mlokomanis Kulon"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Lokasi Pelaksanaan *</label>
              <input
                type="text"
                required
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Contoh: Pendopo Kelurahan Mlokomanis Kulon"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Panitia / Penyelenggara *</label>
              <input
                type="text"
                required
                value={penulis}
                onChange={(e) => setPenulis(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </section>

        {/* ── Section 2: Waktu Pelaksanaan Event ── */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">2. Waktu Pelaksanaan Event</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tanggal mulai, tanggal selesai, dan jam acara.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Tanggal Mulai *</label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Tanggal Selesai (Opsional)</label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Jam Pelaksanaan *</label>
              <input
                type="text"
                required
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                placeholder="Contoh: 08:00 WIB - Selesai"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </section>

        {/* ── Section 3: Poster / Flyer Event (Direct Upload) ── */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">3. Poster / Flyer Utama Event</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Unggah foto banner atau poster resmi kegiatan (Direct Upload &amp; Otomatis Kompresi).</p>
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
                  className="rounded-xl bg-emerald-600/10 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-600/20 transition-colors"
                >
                  Ganti Poster
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="rounded-xl bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors"
                >
                  Hapus Poster
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => coverInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                  <circle cx="8.5" cy="9.5" r="1.5" />
                  <path d="m5 17 4.5-5 3 3.5L16 11l4 5" />
                </svg>
              </div>
              <span className="text-xs font-bold text-emerald-700">+ Klik / Pilih Poster Event (Direct Upload)</span>
              <span className="text-[11px] text-muted-foreground mt-1">Format WebP, JPG, PNG (Otomatis Kompresi WebP)</span>
            </div>
          )}
          {coverError && <p className="text-xs text-destructive font-semibold">{coverError}</p>}
        </section>

        {/* ── Section 4: Deskripsi & Rincian Agenda ── */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-heading text-base font-bold text-foreground">4. Deskripsi &amp; Rincian Agenda</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tuliskan rincian susunan acara, syarat keikutsertaan, atau imbauan bagi warga.</p>
          </div>

          <div className="space-y-1.5">
            <textarea
              required
              rows={8}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan rincian agenda acara..."
              className="w-full rounded-xl border border-border bg-background p-4 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50 font-sans leading-relaxed"
            />
          </div>
        </section>

        {/* Form Actions */}
        <div className="pt-2 flex justify-end gap-3">
          <Link
            href="/admin/event"
            className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting || coverUploading}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Memproses..." : isTier34 ? "Ajukan Event" : "Simpan Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
