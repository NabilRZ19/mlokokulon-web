"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalNoticeBanner } from "@/components/admin/ApprovalNoticeBanner";

export default function TambahEventPage() {
  const router = useRouter();

  const [session, setSession] = useState<{ nama: string; tier: number } | null>(null);

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split("T")[0]);
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [jamMulai, setJamMulai] = useState("08:00 WIB - Selesai");
  const [lokasi, setLokasi] = useState("Pendopo Kelurahan Mlokomanis Kulon");
  const [penulis, setPenulis] = useState("");
  const [gambarCoverUrl, setGambarCoverUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const json = await res.json();
          setSession(json);
          setPenulis(json.nama || "Panitia Kegiatan");
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
    <div className="space-y-6 max-w-3xl">
      <AdminPageHeader
        title="Buat Agenda Event Baru"
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

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">Judul Agenda Event *</label>
          <input
            type="text"
            required
            value={judul}
            onChange={(e) => handleJudulChange(e.target.value)}
            placeholder="Contoh: Posyandu Balita & Posbindu PTM Serentak"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Tanggal Mulai *</label>
            <input
              type="date"
              required
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Tanggal Selesai (Opsional jika 1 hari)</label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Jam Pelaksanaan *</label>
            <input
              type="text"
              required
              value={jamMulai}
              onChange={(e) => setJamMulai(e.target.value)}
              placeholder="Contoh: 08:00 WIB - 12:00 WIB"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Lokasi / Tempat Pelaksanaan *</label>
            <input
              type="text"
              required
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Balai RW 05 Pencil"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">Panitia / Penyelenggara *</label>
          <input
            type="text"
            required
            value={penulis}
            onChange={(e) => setPenulis(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">Deskripsi &amp; Agenda Acara *</label>
          <textarea
            required
            rows={6}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Tuliskan gambaran acara, susunan agenda, dan informasi penunjang..."
            className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Link
            href="/admin/event"
            className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Memproses..." : isTier34 ? "Ajukan Event" : "Simpan Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
