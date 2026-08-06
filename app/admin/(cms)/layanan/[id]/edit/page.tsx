"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { scrollToFirstError } from "@/lib/form-scroll";

export default function EditLayananPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [waktuProses, setWaktuProses] = useState("");
  const [biaya, setBiaya] = useState("");
  const [kontakPenanggungJawab, setKontakPenanggungJawab] = useState("");
  const [urutan, setUrutan] = useState(0);

  const [persyaratanList, setPersyaratanList] = useState<string[]>([]);
  const [prosedurList, setProsedurList] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/layanan/${id}`);
        if (!res.ok) throw new Error("Gagal mengambil data layanan.");
        const data = await res.json();

        setNama(data.nama);
        setKategori(data.kategori);
        setDeskripsi(data.deskripsi);
        setWaktuProses(data.waktuProses || "1 Hari Kerja");
        setBiaya(data.biaya || "Gratis (Rp 0)");
        setKontakPenanggungJawab(data.kontakPenanggungJawab || "");
        setUrutan(data.urutan || 0);
        setPersyaratanList(Array.isArray(data.persyaratan) ? data.persyaratan : []);
        setProsedurList(Array.isArray(data.prosedur) ? data.prosedur : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // ── Helper Persyaratan ──
  function handleAddSyarat() {
    setPersyaratanList((prev) => [...prev, ""]);
  }
  function handleRemoveSyarat(index: number) {
    setPersyaratanList((prev) => prev.filter((_, i) => i !== index));
  }
  function handleSyaratChange(index: number, val: string) {
    setPersyaratanList((prev) => prev.map((s, i) => (i === index ? val : s)));
  }

  // ── Helper Prosedur ──
  function handleAddProsedur() {
    setProsedurList((prev) => [...prev, ""]);
  }
  function handleRemoveProsedur(index: number) {
    setProsedurList((prev) => prev.filter((_, i) => i !== index));
  }
  function handleProsedurChange(index: number, val: string) {
    setProsedurList((prev) => prev.map((p, i) => (i === index ? val : p)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errorIds: string[] = [];
    if (!nama.trim()) errorIds.push("nama");
    if (!deskripsi.trim()) errorIds.push("deskripsi");

    if (errorIds.length > 0) {
      setError("Nama layanan dan deskripsi wajib diisi.");
      scrollToFirstError(errorIds);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama: nama.trim(),
        kategori: kategori.trim(),
        deskripsi: deskripsi.trim(),
        persyaratan: persyaratanList.filter((s) => s.trim().length > 0),
        prosedur: prosedurList.filter((p) => p.trim().length > 0),
        waktu_proses: waktuProses.trim(),
        biaya: biaya.trim(),
        kontak_penanggung_jawab: kontakPenanggungJawab.trim(),
        urutan: Number(urutan),
      };

      const res = await fetch(`/api/admin/layanan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memperbarui data layanan.");
      }

      router.push("/admin/layanan");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat data layanan…</div>;
  }

  return (
    <div>
      <AdminPageHeader title={`Edit Layanan "${nama}"`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nama" className="mb-1 block text-sm font-bold text-foreground">
                Nama Layanan <span className="text-destructive">*</span>
              </label>
              <input
                id="nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                required
              />
            </div>

            <div>
              <label htmlFor="kategori" className="mb-1 block text-sm font-bold text-foreground">
                Kategori Layanan <span className="text-destructive">*</span>
              </label>
              <input
                id="kategori"
                type="text"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="deskripsi" className="mb-1 block text-sm font-bold text-foreground">
              Deskripsi Singkat Layanan <span className="text-destructive">*</span>
            </label>
            <textarea
              id="deskripsi"
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="waktuProses" className="mb-1 block text-sm font-bold text-foreground">
                Waktu Proses Estimasi
              </label>
              <input
                id="waktuProses"
                type="text"
                value={waktuProses}
                onChange={(e) => setWaktuProses(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label htmlFor="biaya" className="mb-1 block text-sm font-bold text-foreground">
                Biaya Layanan
              </label>
              <input
                id="biaya"
                type="text"
                value={biaya}
                onChange={(e) => setBiaya(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-emerald-700"
              />
            </div>

            <div>
              <label htmlFor="urutan" className="mb-1 block text-sm font-bold text-foreground">
                Urutan Tampil
              </label>
              <input
                id="urutan"
                type="number"
                value={urutan}
                onChange={(e) => setUrutan(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label htmlFor="kontakPenanggungJawab" className="mb-1 block text-sm font-bold text-foreground">
              Kontak / Unit Pelaksana
            </label>
            <input
              id="kontakPenanggungJawab"
              type="text"
              value={kontakPenanggungJawab}
              onChange={(e) => setKontakPenanggungJawab(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* ── Persyaratan Berkas ── */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/10 pb-3">
              <div>
                <h3 className="font-heading text-base font-extrabold text-foreground">
                  Persyaratan Berkas &amp; Dokumen
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daftar berkas atau dokumen yang wajib dibawa/disiapkan warga.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSyarat}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
              >
                + Tambah Syarat
              </button>
            </div>

            <div className="space-y-2.5">
              {persyaratanList.map((syarat, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={syarat}
                    onChange={(e) => handleSyaratChange(idx, e.target.value)}
                    placeholder={`Persyaratan Berkas #${idx + 1}`}
                    className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSyarat(idx)}
                    className="px-2.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Alur Prosedur Pengurusan ── */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
              <div>
                <h3 className="font-heading text-base font-extrabold text-foreground">
                  Alur Prosedur Pengurusan
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Langkah-langkah yang dilalui warga untuk mengurus layanan ini.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddProsedur}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                + Tambah Langkah
              </button>
            </div>

            <div className="space-y-2.5">
              {prosedurList.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => handleProsedurChange(idx, e.target.value)}
                    placeholder={`Langkah Prosedur #${idx + 1}`}
                    className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveProsedur(idx)}
                    className="px-2.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
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
            {submitting ? "Menyimpan…" : "Simpan Perubahan Layanan"}
          </button>
        </div>
      </form>
    </div>
  );
}
