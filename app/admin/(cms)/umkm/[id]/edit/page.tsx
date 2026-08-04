"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { compressImage } from "@/lib/image-compression";
import { getPublicImageUrl } from "@/lib/image-url";
import { scrollToFirstError } from "@/lib/form-scroll";

export default function EditUmkmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("Kuliner");
  const [lokasi, setLokasi] = useState("RW 05 (Pencil)");
  const [deskripsi, setDeskripsi] = useState("");
  const [linkGmaps, setLinkGmaps] = useState("");
  const [kontak, setKontak] = useState("");
  const [hariOperasional, setHariOperasional] = useState("Setiap Hari");
  const [jamBuka, setJamBuka] = useState("08.00");
  const [jamTutup, setJamTutup] = useState("17.00");

  const computedJamOperasional = `${hariOperasional !== "Setiap Hari" ? `${hariOperasional}, ` : ""}${jamBuka} - ${jamTutup} WIB`;

  const [produkList, setProdukList] = useState<
    { produk: string; fotoUrl: string | null; uploading?: boolean }[]
  >([{ produk: "", fotoUrl: null }]);
  const [fotoList, setFotoList] = useState<{ url: string; uploading?: boolean }[]>([]);
  const [fotoUtama, setFotoUtama] = useState<{ url: string } | null>(null);
  const [fotoUtamaUploading, setFotoUtamaUploading] = useState(false);

  const [uploadingGlobal, setUploadingGlobal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const fotoUtamaInputRef = useRef<HTMLInputElement>(null);
  const produkFotoInputRef = useRef<HTMLInputElement>(null);
  const [produkFotoTargetIndex, setProdukFotoTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/umkm/${id}`);
        if (!res.ok) throw new Error("Gagal memuat data UMKM.");
        const data = await res.json();
        setNama(data.nama ?? "");
        setKategori(data.kategori ?? "Kuliner");
        setLokasi(data.lokasi ?? "");
        setDeskripsi(data.deskripsi ?? "");
        setLinkGmaps(data.link_gmaps ?? "");
        setKontak(data.kontak ?? "");

        // Parse jam_operasional back into components (best-effort)
        const jamOps: string = data.jam_operasional ?? "08.00 - 17.00 WIB";
        const match = jamOps.match(/(\d{2}\.\d{2})\s*-\s*(\d{2}\.\d{2})/);
        if (match) {
          setJamBuka(match[1]);
          setJamTutup(match[2]);
        }
        const hariOptions = ["Senin - Sabtu", "Senin - Jumat", "Sabtu - Minggu"];
        const matchedHari = hariOptions.find((h) => jamOps.startsWith(h));
        setHariOperasional(matchedHari ?? "Setiap Hari");

        setFotoUtama(data.foto_utama_url ? { url: getPublicImageUrl(data.foto_utama_url) } : null);
        setProdukList(
          data.produk_unggulan?.length > 0
            ? data.produk_unggulan.map((p: { produk: string; foto_url: string | null }) => ({
                produk: p.produk,
                fotoUrl: p.foto_url ? getPublicImageUrl(p.foto_url) : null,
              }))
            : [{ produk: "", fotoUrl: null }]
        );
        setFotoList(
          data.foto_urls?.map((url: string) => ({ url: getPublicImageUrl(url) })) ?? []
        );
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function handleAddProduk() {
    setProdukList((prev) => [...prev, { produk: "", fotoUrl: null }]);
  }

  function handleRemoveProduk(index: number) {
    setProdukList((prev) => prev.filter((_, i) => i !== index));
  }

  function handleProdukChange(index: number, val: string) {
    setProdukList((prev) => prev.map((p, i) => (i === index ? { ...p, produk: val } : p)));
  }

  async function uploadOneFile(file: File): Promise<string> {
    const compressed = await compressImage(file);
    const fd = new FormData();
    fd.append("file", compressed, compressed.name);
    fd.append("folder", "umkm");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload gagal");
    const data = await res.json();
    return data.url as string;
  }

  async function handleFotoUtamaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoUtamaUploading(true);
    try {
      const url = await uploadOneFile(file);
      setFotoUtama({ url: getPublicImageUrl(url) });
    } catch {
      setError("Gagal mengupload foto utama.");
    } finally {
      setFotoUtamaUploading(false);
      if (e.target) e.target.value = "";
    }
  }

  function handleProdukFotoClick(index: number) {
    setProdukFotoTargetIndex(index);
    produkFotoInputRef.current?.click();
  }

  async function handleProdukFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const index = produkFotoTargetIndex;
    if (!file || index === null) return;
    setProdukList((prev) => prev.map((p, i) => (i === index ? { ...p, uploading: true } : p)));
    try {
      const url = await uploadOneFile(file);
      setProdukList((prev) =>
        prev.map((p, i) => (i === index ? { ...p, fotoUrl: getPublicImageUrl(url), uploading: false } : p))
      );
    } catch {
      setError("Gagal mengupload foto produk.");
      setProdukList((prev) => prev.map((p, i) => (i === index ? { ...p, uploading: false } : p)));
    } finally {
      if (e.target) e.target.value = "";
      setProdukFotoTargetIndex(null);
    }
  }

  function handleRemoveProdukFoto(index: number) {
    setProdukList((prev) => prev.map((p, i) => (i === index ? { ...p, fotoUrl: null } : p)));
  }

  async function handleFotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingGlobal(true);
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressImage(file);
          const fd = new FormData();
          fd.append("file", compressed, compressed.name);
          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
          if (!res.ok) throw new Error("Upload gagal");
          const data = await res.json();
          return getPublicImageUrl(data.url) as string;
        })
      );
      setFotoList((prev) => [...prev, ...urls.map((url) => ({ url }))]);
    } catch {
      setError("Gagal mengupload beberapa foto UMKM.");
    } finally {
      setUploadingGlobal(false);
      if (e.target) e.target.value = "";
    }
  }

  function handleRemoveFoto(index: number) {
    setFotoList((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errorIds: string[] = [];
    if (!nama.trim()) errorIds.push("nama");
    if (!deskripsi.trim()) errorIds.push("deskripsi");
    if (!kontak.trim()) errorIds.push("kontak");

    if (errorIds.length > 0) {
      setError("Field Nama, Deskripsi, dan Kontak wajib diisi.");
      scrollToFirstError(errorIds);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama,
        kategori,
        lokasi,
        deskripsi,
        link_gmaps: linkGmaps,
        kontak,
        jam_operasional: computedJamOperasional,
        produk_unggulan: produkList
          .filter((p) => p.produk.trim().length > 0)
          .map((p) => ({ produk: p.produk.trim(), foto_url: p.fotoUrl })),
        foto_urls: fotoList.map((f) => f.url),
        foto_utama_url: fotoUtama?.url ?? null,
      };

      const res = await fetch(`/api/admin/umkm/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan perubahan UMKM.");
      }

      router.push("/admin/umkm");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Memuat data UMKM…
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
      <AdminPageHeader title="Edit UMKM & Potensi" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nama" className="mb-1 block text-sm font-bold text-foreground">
                Nama Usaha / Potensi <span className="text-destructive">*</span>
              </label>
              <input
                id="nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Misal: Keripik Tempe Mbok Yem"
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label htmlFor="lokasi" className="mb-1 block text-sm font-bold text-foreground">
                Lokasi / Alamat (Dusun, RT, RW) <span className="text-destructive">*</span>
              </label>
              <input
                id="lokasi"
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Misal: Jaten RT 02/RW 06"
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="kategori" className="mb-1 block text-sm font-bold text-foreground">
                Kategori UMKM <span className="text-destructive">*</span>
              </label>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="Kuliner">Kuliner</option>
                <option value="Kerajinan">Kerajinan &amp; Kriya</option>
                <option value="Pertanian">Pertanian &amp; Olahan</option>
                <option value="Jasa">Jasa &amp; Perdagangan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="kontak" className="mb-1 block text-sm font-bold text-foreground">
                No. HP / WhatsApp <span className="text-destructive">*</span>
              </label>
              <input
                id="kontak"
                type="text"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="08123456789"
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label htmlFor="deskripsi" className="mb-1 block text-sm font-bold text-foreground">
              Deskripsi Singkat Usaha <span className="text-destructive">*</span>
            </label>
            <textarea
              id="deskripsi"
              rows={4}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Ceritakan tentang usaha, keunggulan produk…"
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
            />
          </div>

          {/* Jam Operasional */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <label className="block text-sm font-bold text-foreground">
              Jam &amp; Hari Operasional Usaha
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="hariOperasional" className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Hari Operasional
                </label>
                <select
                  id="hariOperasional"
                  value={hariOperasional}
                  onChange={(e) => setHariOperasional(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Setiap Hari">Setiap Hari</option>
                  <option value="Senin - Sabtu">Senin - Sabtu</option>
                  <option value="Senin - Jumat">Senin - Jumat</option>
                  <option value="Sabtu - Minggu">Sabtu - Minggu (Akhir Pekan)</option>
                </select>
              </div>
              <div>
                <label htmlFor="jamBuka" className="mb-1 block text-xs font-semibold text-muted-foreground">Jam Buka</label>
                <select
                  id="jamBuka"
                  value={jamBuka}
                  onChange={(e) => setJamBuka(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {["06.00", "07.00", "08.00", "09.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00", "17.00", "18.00", "19.00", "20.00"].map((j) => (
                    <option key={j} value={j}>{j} WIB</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="jamTutup" className="mb-1 block text-xs font-semibold text-muted-foreground">Jam Tutup</label>
                <select
                  id="jamTutup"
                  value={jamTutup}
                  onChange={(e) => setJamTutup(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {["12.00", "13.00", "14.00", "15.00", "16.00", "17.00", "18.00", "19.00", "20.00", "21.00", "22.00", "23.00", "24.00"].map((j) => (
                    <option key={j} value={j}>{j} WIB</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-primary font-semibold">
              Preview Format: <code className="rounded bg-primary/10 px-2 py-0.5 font-bold">{computedJamOperasional}</code>
            </p>
          </div>

          <div>
            <label htmlFor="linkGmaps" className="mb-1 block text-sm font-bold text-foreground">
              Link Google Maps (Opsional)
            </label>
            <input
              id="linkGmaps"
              type="url"
              value={linkGmaps}
              onChange={(e) => setLinkGmaps(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Produk Unggulan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-foreground">Produk Unggulan</label>
              <button type="button" onClick={handleAddProduk} className="text-xs font-bold text-primary hover:underline">
                + Tambah Item Produk
              </button>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">Foto per produk bersifat opsional.</p>
            <div className="space-y-2">
              {produkList.map((prod, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleProdukFotoClick(idx)}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted text-muted-foreground hover:border-primary/50"
                    title="Upload foto produk (opsional)"
                  >
                    {prod.uploading ? (
                      <span className="text-[10px]">…</span>
                    ) : prod.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.fotoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg leading-none">+</span>
                    )}
                  </button>
                  {prod.fotoUrl && !prod.uploading && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProdukFoto(idx)}
                      className="shrink-0 text-[10px] font-bold text-destructive hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                  <input
                    type="text"
                    value={prod.produk}
                    onChange={(e) => handleProdukChange(idx, e.target.value)}
                    placeholder={`Nama Produk ${idx + 1}`}
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {produkList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProduk(idx)}
                      className="px-3 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
            <input
              ref={produkFotoInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={handleProdukFotoChange}
            />
          </div>

          {/* Foto Utama */}
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">Foto Utama (Highlight)</label>
            <p className="mb-2 text-xs text-muted-foreground">Foto ini yang tampil sebagai sampul UMKM di daftar UMKM.</p>
            <input
              ref={fotoUtamaInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={handleFotoUtamaChange}
            />
            {fotoUtama ? (
              <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoUtama.url} alt="Foto utama UMKM" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoUtama(null)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white text-xs font-bold shadow-xs hover:bg-destructive/90"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={() => !fotoUtamaUploading && fotoUtamaInputRef.current?.click()}
                className="flex max-w-xs cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-6 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <p className="text-xs font-semibold text-muted-foreground">
                  {fotoUtamaUploading ? "Mengupload…" : "Klik di sini untuk upload foto utama"}
                </p>
              </div>
            )}
          </div>

          {/* Foto Produk & Tempat Usaha */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-foreground">Foto Produk &amp; Tempat Usaha</label>
              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                disabled={uploadingGlobal}
                className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
              >
                + Upload Foto
              </button>
            </div>
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="hidden"
              onChange={handleFotoAdd}
            />
            {uploadingGlobal && (
              <p className="text-xs text-primary font-bold mb-2">Mengompres &amp; mengupload foto…</p>
            )}
            {fotoList.length === 0 ? (
              <div
                onClick={() => fotoInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <p className="text-xs font-semibold text-muted-foreground">
                  Klik di sini untuk upload foto produk UMKM
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {fotoList.map((item, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={`Foto UMKM ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFoto(idx)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white text-xs font-bold shadow-xs hover:bg-destructive/90"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            disabled={submitting || uploadingGlobal}
            className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Menyimpan…" : "Simpan Perubahan UMKM"}
          </button>
        </div>
      </form>
    </div>
  );
}
