"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalNoticeBanner } from "@/components/admin/ApprovalNoticeBanner";

export default function TambahPengumumanPage() {
  const router = useRouter();

  const [session, setSession] = useState<{ nama: string; tier: number } | null>(null);

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [targetPengumuman, setTargetPengumuman] = useState("Seluruh Warga Kelurahan");
  const [isi, setIsi] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
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

  const isTier34 = session?.tier === 3 || session?.tier === 4;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/pengumuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          slug,
          target_pengumuman: targetPengumuman,
          isi,
          tanggal,
          gambar_cover_url: gambarCoverUrl,
          penulis,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal menyimpan pengumuman.");
      }

      router.push("/admin/pengumuman");
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
        title="Buat Pengumuman Baru"
        actions={
          <Link
            href="/admin/pengumuman"
            className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted"
          >
            ← Kembali
          </Link>
        }
      />

      <ApprovalNoticeBanner contentType="pengumuman" />

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-bold text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">Judul Pengumuman *</label>
          <input
            type="text"
            required
            value={judul}
            onChange={(e) => handleJudulChange(e.target.value)}
            placeholder="Contoh: Jadwal Pelayanan Administrasi Keliling"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Target Pengumuman (Untuk Siapa) *</label>
            <input
              type="text"
              required
              value={targetPengumuman}
              onChange={(e) => setTargetPengumuman(e.target.value)}
              placeholder="Contoh: Seluruh Warga, Ketua RT/RW, Ibu Hamil"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Tanggal Pengumuman *</label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">Penulis / Instansi *</label>
          <input
            type="text"
            required
            value={penulis}
            onChange={(e) => setPenulis(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">Isi Pengumuman *</label>
          <textarea
            required
            rows={8}
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Tuliskan detail isi pengumuman secara jelas dan lugas..."
            className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Link
            href="/admin/pengumuman"
            className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Memproses..." : isTier34 ? "Ajukan Pengumuman" : "Simpan Pengumuman"}
          </button>
        </div>
      </form>
    </div>
  );
}
