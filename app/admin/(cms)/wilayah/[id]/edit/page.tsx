"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface PengurusItem {
  nama: string;
  jabatan: string;
}

export default function EditWilayahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [namaRw, setNamaRw] = useState("");
  const [cakupanDusun, setCakupanDusun] = useState("");
  const [jumlahRt, setJumlahRt] = useState(0);
  const [jumlahKk, setJumlahKk] = useState(0);
  const [jumlahJiwa, setJumlahJiwa] = useState(0);
  const [isKampungKb, setIsKampungKb] = useState(false);
  const [potensi, setPotensi] = useState("");
  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRwData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/wilayah/${id}`);
        if (!res.ok) throw new Error("Gagal mengambil data RW");
        const data = await res.json();

        setNamaRw(data.nama_rw);
        setCakupanDusun(data.cakupan_dusun);
        setJumlahRt(data.jumlah_rt);
        setJumlahKk(data.statistik?.jumlah_kk ?? 0);
        setJumlahJiwa(data.statistik?.jumlah_jiwa ?? 0);
        setIsKampungKb(data.is_kampung_kb);
        setPotensi(data.potensi || "");
        const existingPengurus: PengurusItem[] = data.struktur_pengurus || [];
        if (!existingPengurus.some((p) => p.jabatan.toLowerCase().includes("ketua"))) {
          setPengurusList([{ nama: "", jabatan: "Ketua RW" }, ...existingPengurus]);
        } else {
          setPengurusList(existingPengurus);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    loadRwData();
  }, [id]);

  function handleAddPengurus() {
    setPengurusList((prev) => [...prev, { nama: "", jabatan: "Anggota" }]);
  }

  function handleRemovePengurus(index: number) {
    setPengurusList((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePengurusChange(index: number, field: "nama" | "jabatan", val: string) {
    setPengurusList((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: val } : p))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      const payload = {
        nama_rw: namaRw,
        cakupan_dusun: cakupanDusun,
        jumlah_rt: Number(jumlahRt),
        is_kampung_kb: isKampungKb,
        potensi,
        statistik: {
          jumlah_kk: Number(jumlahKk),
          jumlah_jiwa: Number(jumlahJiwa),
        },
        struktur_pengurus: pengurusList.filter((p) => p.nama.trim().length > 0),
      };

      const res = await fetch(`/api/admin/wilayah/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memperbarui data RW.");
      }

      router.push("/admin/wilayah");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat data RW…</div>;
  }

  return (
    <div>
      <AdminPageHeader title={`Edit Data ${namaRw || "RW"}`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="namaRw" className="mb-1 block text-sm font-bold text-foreground">
                Nama RW <span className="text-destructive">*</span>
              </label>
              <input
                id="namaRw"
                type="text"
                value={namaRw}
                onChange={(e) => setNamaRw(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label htmlFor="cakupanDusun" className="mb-1 block text-sm font-bold text-foreground">
                Cakupan Dusun <span className="text-destructive">*</span>
              </label>
              <input
                id="cakupanDusun"
                type="text"
                value={cakupanDusun}
                onChange={(e) => setCakupanDusun(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="jumlahRt" className="mb-1 block text-sm font-bold text-foreground">
                Jumlah RT
              </label>
              <input
                id="jumlahRt"
                type="number"
                value={jumlahRt}
                onChange={(e) => setJumlahRt(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label htmlFor="jumlahKk" className="mb-1 block text-sm font-bold text-foreground">
                Jumlah KK
              </label>
              <input
                id="jumlahKk"
                type="number"
                value={jumlahKk}
                onChange={(e) => setJumlahKk(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label htmlFor="jumlahJiwa" className="mb-1 block text-sm font-bold text-foreground">
                Jumlah Jiwa
              </label>
              <input
                id="jumlahJiwa"
                type="number"
                value={jumlahJiwa}
                onChange={(e) => setJumlahJiwa(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-foreground">
              <input
                type="checkbox"
                checked={isKampungKb}
                onChange={(e) => setIsKampungKb(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              Wilayah Ini Ditetapkan Sebagai Kampung KB
            </label>
          </div>

          <div>
            <label htmlFor="potensi" className="mb-1 block text-sm font-bold text-foreground">
              Potensi Wilayah RW
            </label>
            <textarea
              id="potensi"
              rows={3}
              value={potensi}
              onChange={(e) => setPotensi(e.target.value)}
              placeholder="Deskripsi potensi pertanian, peternakan, atau UMKM khas di wilayah RW ini…"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
            />
          </div>

          {/* ── Seksi 2: Susunan Pengurus & Kelembagaan RW ── */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <div>
                <h3 className="font-heading text-base font-extrabold text-foreground">
                  Susunan Pengurus &amp; Kelembagaan RW
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kelola daftar nama Ketua RW, Sekretaris, Bendahara, dan pengurus kelembagaan wilayah RW ini.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddPengurus}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
              >
                + Tambah Pengurus
              </button>
            </div>

            {/* Label Tag Header Kolom */}
            {pengurusList.length > 0 && (
              <div className="flex gap-2 text-xs font-extrabold uppercase tracking-wider text-primary px-1 pt-1">
                <span className="w-7 shrink-0 text-center">No</span>
                <span className="flex-1">Nama Lengkap Pengurus</span>
                <span className="w-2/5">Jabatan di RW</span>
                <span className="w-16 shrink-0 text-right">Aksi</span>
              </div>
            )}

            <div className="space-y-2.5">
              {pengurusList.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {idx + 1}
                  </div>
                  <input
                    type="text"
                    value={p.nama}
                    onChange={(e) => handlePengurusChange(idx, "nama", e.target.value)}
                    placeholder="Nama Lengkap Pengurus"
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    type="text"
                    value={p.jabatan}
                    onChange={(e) => handlePengurusChange(idx, "jabatan", e.target.value)}
                    placeholder="Jabatan (Ketua RW / Sekretaris / Bendahara)"
                    className="w-2/5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePengurus(idx)}
                    className="px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
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
            disabled={submitting}
            className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Menyimpan…" : "Simpan Perubahan RW"}
          </button>
        </div>
      </form>
    </div>
  );
}
