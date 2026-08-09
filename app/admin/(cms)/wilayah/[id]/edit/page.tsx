"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ApprovalNoticeBanner } from "@/components/admin/ApprovalNoticeBanner";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import { compressImage } from "@/lib/image-compression";
import { scrollToFirstError } from "@/lib/form-scroll";

interface PengurusItem {
  nama: string;
  jabatan: string;
  kategori?: "rw" | "rt" | "organisasi";
  organisasi?: string;
  icon?: string;
}

interface OrganisasiBlock {
  id: string;
  namaOrganisasi: string;
  icon: string;
  pengurus: { nama: string; jabatan: string }[];
}

const ICON_OPTIONS = [
  { value: "sprout", label: "Kelompok Tani / Pertanian" },
  { value: "users", label: "Karang Taruna / Pemuda" },
  { value: "pkk", label: "PKK / Posyandu / Keluarga" },
  { value: "shield", label: "Linmas / Keamanan Warga" },
  { value: "trophy", label: "Olahraga & Seni" },
  { value: "building", label: "Kelembagaan / Umum" },
];

export default function EditWilayahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [userTier, setUserTier] = useState<number>(3); // fallback Tier 3
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [namaRw, setNamaRw] = useState("");
  const [cakupanDusun, setCakupanDusun] = useState("");
  const [jumlahRt, setJumlahRt] = useState(0);
  const [jumlahKk, setJumlahKk] = useState(0);
  const [jumlahJiwa, setJumlahJiwa] = useState(0);
  const [isKampungKb, setIsKampungKb] = useState(false);
  const [deskripsiSingkat, setDeskripsiSingkat] = useState("");
  const [potensi, setPotensi] = useState("");

  // ── State Ketua RW ──
  const [ketuaNama, setKetuaNama] = useState("");
  const [ketuaFotoUrl, setKetuaFotoUrl] = useState<string | null>(null);

  // Crop & Upload state untuk foto Ketua RW
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [uploadingKetuaFoto, setUploadingKetuaFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Pengurus Inti RW (Sekretaris, Bendahara, dll — selain Ketua RW)
  const [rwCoreList, setRwCoreList] = useState<{ nama: string; jabatan: string }[]>([]);

  // 2. Pengurus RT (Dipisahkan)
  const [rtPengurusList, setRtPengurusList] = useState<{ nama: string; jabatan: string }[]>([]);

  // 3. Organisasi Tambahan (Karang Taruna, Tani, PKK, Posyandu, dll)
  const [orgBlocks, setOrgBlocks] = useState<OrganisasiBlock[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Session
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.tier) setUserTier(d.tier);
        if (d?.nama) setUserName(d.nama);
      })
      .catch(() => null);
  }, []);

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
        setDeskripsiSingkat(data.deskripsi_singkat || "");
        setPotensi(data.potensi || "");
        setKetuaNama(data.ketua_nama || "");
        setKetuaFotoUrl(data.ketua_foto_url || null);

        const existingPengurus: PengurusItem[] = data.struktur_pengurus || [];

        // Parse pengurus RW Core (Sekretaris, Bendahara, dll — tanpa Ketua RW)
        const rwCore = existingPengurus.filter(
          (p) =>
            !p.jabatan.toLowerCase().includes("ketua rw") &&
            !p.jabatan.toLowerCase().includes("rt") &&
            !p.jabatan.toLowerCase().includes("tani") &&
            !p.jabatan.toLowerCase().includes("karang taruna") &&
            !p.jabatan.toLowerCase().includes("redhosin") &&
            p.kategori !== "organisasi"
        );
        setRwCoreList(rwCore.map((p) => ({ nama: p.nama, jabatan: p.jabatan })));

        // Parse pengurus RT
        const rtItems = existingPengurus.filter(
          (p) =>
            p.kategori === "rt" ||
            (p.jabatan.toLowerCase().includes("rt") &&
              !p.jabatan.toLowerCase().includes("tani") &&
              !p.jabatan.toLowerCase().includes("karang taruna"))
        );
        setRtPengurusList(rtItems.map((p) => ({ nama: p.nama, jabatan: p.jabatan })));

        // Parse Organisasi Tambahan (Tani, Karang Taruna, PKK, dll)
        const orgItems = existingPengurus.filter(
          (p) =>
            p.kategori === "organisasi" ||
            p.jabatan.toLowerCase().includes("tani") ||
            p.jabatan.toLowerCase().includes("karang taruna") ||
            p.jabatan.toLowerCase().includes("redhosin") ||
            p.jabatan.toLowerCase().includes("pkk")
        );

        // Grouping by organisasi / nama kelompok
        const orgMap = new Map<string, { icon: string; pengurus: { nama: string; jabatan: string }[] }>();

        orgItems.forEach((p) => {
          let orgName = p.organisasi;
          if (!orgName) {
            if (p.jabatan.toLowerCase().includes("tani")) orgName = "Kelompok Tani";
            else if (p.jabatan.toLowerCase().includes("karang taruna") || p.jabatan.toLowerCase().includes("redhosin"))
              orgName = "Karang Taruna";
            else if (p.jabatan.toLowerCase().includes("pkk")) orgName = "PKK";
            else orgName = "Organisasi Kemasyarakatan";
          }

          let icon = p.icon || "users";
          if (!p.icon) {
            if (orgName.toLowerCase().includes("tani")) icon = "sprout";
            else if (orgName.toLowerCase().includes("karang taruna") || orgName.toLowerCase().includes("redhosin")) icon = "users";
            else if (orgName.toLowerCase().includes("pkk") || orgName.toLowerCase().includes("posyandu")) icon = "pkk";
          }

          const current = orgMap.get(orgName) || { icon, pengurus: [] };
          current.pengurus.push({ nama: p.nama, jabatan: p.jabatan });
          orgMap.set(orgName, current);
        });

        const blocks: OrganisasiBlock[] = Array.from(orgMap.entries()).map(([namaOrg, val], idx) => ({
          id: `org-${idx}-${Date.now()}`,
          namaOrganisasi: namaOrg,
          icon: val.icon,
          pengurus: val.pengurus,
        }));

        setOrgBlocks(blocks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    loadRwData();
  }, [id]);

  // ── Helper RW Core ──
  function handleAddRwCore() {
    setRwCoreList((prev) => [...prev, { nama: "", jabatan: "Sekretaris RW" }]);
  }
  function handleRemoveRwCore(index: number) {
    setRwCoreList((prev) => prev.filter((_, i) => i !== index));
  }
  function handleRwCoreChange(index: number, field: "nama" | "jabatan", val: string) {
    setRwCoreList((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: val } : p)));
  }

  // ── Helper Pengurus RT ──
  function handleAddRtPengurus() {
    setRtPengurusList((prev) => [...prev, { nama: "", jabatan: "Ketua RT 01" }]);
  }
  function handleRemoveRtPengurus(index: number) {
    setRtPengurusList((prev) => prev.filter((_, i) => i !== index));
  }
  function handleRtPengurusChange(index: number, field: "nama" | "jabatan", val: string) {
    setRtPengurusList((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: val } : p)));
  }

  // ── Helper Organisasi Tambahan ──
  function handleAddOrgBlock() {
    setOrgBlocks((prev) => [
      ...prev,
      {
        id: `org-${Date.now()}`,
        namaOrganisasi: "Kelompok Tani / Karang Taruna",
        icon: "sprout",
        pengurus: [{ nama: "", jabatan: "Ketua" }],
      },
    ]);
  }
  function handleRemoveOrgBlock(blockId: string) {
    setOrgBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }
  function handleOrgBlockMetaChange(blockId: string, field: "namaOrganisasi" | "icon", val: string) {
    setOrgBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, [field]: val } : b))
    );
  }
  function handleAddOrgMember(blockId: string) {
    setOrgBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, pengurus: [...b.pengurus, { nama: "", jabatan: "Anggota" }] }
          : b
      )
    );
  }
  function handleRemoveOrgMember(blockId: string, memberIdx: number) {
    setOrgBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, pengurus: b.pengurus.filter((_, i) => i !== memberIdx) }
          : b
      )
    );
  }
  function handleOrgMemberChange(
    blockId: string,
    memberIdx: number,
    field: "nama" | "jabatan",
    val: string
  ) {
    setOrgBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const newPengurus = b.pengurus.map((p, i) => (i === memberIdx ? { ...p, [field]: val } : p));
        return { ...b, pengurus: newPengurus };
      })
    );
  }

  // ── Helper Foto Ketua RW ──
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const rawUrl = URL.createObjectURL(selected);
    setRawImage(rawUrl);
    setCropperOpen(true);
    if (e.target) e.target.value = "";
  }

  async function handleCropComplete(croppedBlob: Blob, previewUrl: string) {
    setUploadingKetuaFoto(true);
    setError(null);
    try {
      const croppedFile = new File([croppedBlob], "ketua-rw.webp", { type: "image/webp" });
      const compressed = await compressImage(croppedFile);
      const fd = new FormData();
      fd.append("file", compressed, compressed.name);
      fd.append("folder", "rw");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload foto Ketua RW gagal.");

      const data = await res.json();
      setKetuaFotoUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload foto gagal.");
    } finally {
      setUploadingKetuaFoto(false);
    }
  }

  // ── Submit Form Data RW & Pengurus ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const errorIds: string[] = [];
    if (!namaRw.trim()) errorIds.push("namaRw");
    if (!cakupanDusun.trim()) errorIds.push("cakupanDusun");
    if (!jumlahRt) errorIds.push("jumlahRt");
    if (!ketuaNama.trim()) errorIds.push("ketuaNama");

    if (errorIds.length > 0) {
      setError("Nama RW, Cakupan Dusun, Jumlah RT, dan Nama Ketua RW wajib diisi.");
      scrollToFirstError(errorIds);
      return;
    }

    setSubmitting(true);

    try {
      // Gabungkan struktur_pengurus
      const combinedPengurus: PengurusItem[] = [];

      rwCoreList.forEach((p) => {
        if (p.nama.trim()) {
          combinedPengurus.push({ nama: p.nama.trim(), jabatan: p.jabatan.trim() || "Pengurus RW", kategori: "rw" });
        }
      });
      rtPengurusList.forEach((p) => {
        if (p.nama.trim()) {
          combinedPengurus.push({ nama: p.nama.trim(), jabatan: p.jabatan.trim() || "Pengurus RT", kategori: "rt" });
        }
      });
      orgBlocks.forEach((block) => {
        const orgName = block.namaOrganisasi.trim() || "Organisasi Kemasyarakatan";
        block.pengurus.forEach((p) => {
          if (p.nama.trim()) {
            combinedPengurus.push({ nama: p.nama.trim(), jabatan: p.jabatan.trim() || "Pengurus", kategori: "organisasi", organisasi: orgName, icon: block.icon || "users" });
          }
        });
      });

      const fullPayload = {
        nama_rw: namaRw.trim(),
        cakupan_dusun: cakupanDusun.trim(),
        jumlah_rt: Number(jumlahRt),
        is_kampung_kb: isKampungKb,
        ketua_nama: ketuaNama.trim(),
        ketua_foto_url: ketuaFotoUrl ?? null,
        deskripsi_singkat: deskripsiSingkat,
        potensi,
        statistik: { jumlah_kk: Number(jumlahKk), jumlah_jiwa: Number(jumlahJiwa) },
        struktur_pengurus: combinedPengurus,
      };

      if (userTier === 3 || userTier === 4) {
        // Tier 3/4: Semua perubahan wajib melalui jalur approval
        const res = await fetch("/api/admin/wilayah/ketua-pengajuan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rw_id: id,
            pengusul: userName || "Admin RW",
            ketua_nama_baru: ketuaNama.trim(),
            ketua_foto_url_baru: ketuaFotoUrl ?? null,
            payload_json: JSON.stringify(fullPayload),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Gagal mengajukan perubahan data RW.");
        }
        setSuccessMsg(
          "✓ Seluruh perubahan data RW (statistik, pengurus, dan Ketua RW) telah diajukan dan menunggu persetujuan Admin Kelurahan (Tier 1/2)."
        );
      } else {
        // Tier 1: Simpan langsung ke DB
        const res = await fetch(`/api/admin/wilayah/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullPayload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Gagal memperbarui data RW.");
        }
        router.push("/admin/wilayah");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-bold text-muted-foreground">
        Memuat data RW...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`Edit Data ${namaRw || "RW"}`} />
      <ApprovalNoticeBanner contentType="Wilayah RW" />

      <div className="mx-auto max-w-3xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border pb-3">
              Informasi Umum Wilayah {namaRw}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="jumlahRt" className="mb-1 block text-sm font-bold text-foreground">
                  Jumlah RT <span className="font-normal text-muted-foreground">(Rukun Tetangga)</span>
                </label>
                <input
                  id="jumlahRt"
                  type="number"
                  value={jumlahRt}
                  onChange={(e) => setJumlahRt(Number(e.target.value))}
                  placeholder="Contoh: 5"
                  className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label htmlFor="jumlahKk" className="mb-1 block text-sm font-bold text-foreground">
                  Jumlah KK <span className="font-normal text-muted-foreground">(Kepala Keluarga)</span>
                </label>
                <input
                  id="jumlahKk"
                  type="number"
                  value={jumlahKk}
                  onChange={(e) => setJumlahKk(Number(e.target.value))}
                  placeholder="Contoh: 250"
                  className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label htmlFor="jumlahJiwa" className="mb-1 block text-sm font-bold text-foreground">
                  Jumlah Jiwa <span className="font-normal text-muted-foreground">(total penduduk)</span>
                </label>
                <input
                  id="jumlahJiwa"
                  type="number"
                  value={jumlahJiwa}
                  onChange={(e) => setJumlahJiwa(Number(e.target.value))}
                  placeholder="Contoh: 850"
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
              <label htmlFor="deskripsiSingkat" className="mb-1 block text-sm font-bold text-foreground">
                Deskripsi Singkat RW
              </label>
              <textarea
                id="deskripsiSingkat"
                rows={3}
                value={deskripsiSingkat}
                onChange={(e) => setDeskripsiSingkat(e.target.value)}
                placeholder="Ringkasan profil atau deskripsi singkat mengenai wilayah RW ini…"
                className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              />
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

            {/* ── SEKSI 1: Pengurus Inti RW (Ketua RW & Pengurus LKM) ── */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/20 pb-3">
                <div>
                  <h3 className="font-heading text-base font-extrabold text-foreground">
                    1. Pengurus Inti RW
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ketua RW, Sekretaris RW, Bendahara RW, dan jajaran pengurus inti wilayah.
                  </p>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800 border border-orange-300 shrink-0">
                  Perlu Approval Tier 1/2
                </span>
              </div>

              {/* Sub-Form Jabatan Ketua RW */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-2xs">
                <div className="border-b border-border/60 pb-2">
                  <h4 className="font-heading text-sm font-bold text-foreground">Ketua RW (Pimpinan Utama RW)</h4>
                  <p className="text-[11px] text-muted-foreground">Nama dan pasfoto resmi Ketua RW.</p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ketuaNama" className="block text-xs font-bold text-foreground">
                    Nama Ketua RW <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="ketuaNama"
                    type="text"
                    value={ketuaNama}
                    onChange={(e) => setKetuaNama(e.target.value)}
                    placeholder="Masukkan nama lengkap Ketua RW beserta gelar (jika ada)"
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Upload Foto Ketua RW */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-foreground">
                    Foto Profile Ketua RW
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-background hover:bg-primary/10 transition-colors shrink-0 overflow-hidden shadow-2xs"
                    >
                      {ketuaFotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ketuaFotoUrl} alt="Foto Ketua RW" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-primary text-center px-1">Upload</span>
                      )}
                    </div>
                    <div className="text-xs space-y-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        {ketuaFotoUrl ? "Ganti Pasfoto Ketua" : "Upload Pasfoto Ketua RW"}
                      </button>
                      {uploadingKetuaFoto && <p className="text-[11px] font-bold text-primary">Mengunggah foto…</p>}
                      <p className="text-muted-foreground text-[10px]">Format WebP, JPG, PNG (otomatis dikompresi)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Form Pengurus Inti Lainnya */}
              <div className="space-y-3 pt-2 border-t border-primary/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Pengurus Inti RW Lainnya (Sekretaris, Bendahara, dll)</span>
                  <button
                    type="button"
                    onClick={handleAddRwCore}
                    className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
                  >
                    + Tambah Pengurus RW
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rwCoreList.map((p, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center rounded-lg border border-border/50 bg-card/60 p-2.5 sm:p-0 sm:border-0 sm:bg-transparent">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={p.nama}
                          onChange={(e) => handleRwCoreChange(idx, "nama", e.target.value)}
                          placeholder="Nama Lengkap Pengurus RW"
                          className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:w-2/5">
                        <input
                          type="text"
                          value={p.jabatan}
                          onChange={(e) => handleRwCoreChange(idx, "jabatan", e.target.value)}
                          placeholder="Jabatan (Sekretaris / Bendahara)"
                          className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRwCore(idx)}
                          className="px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SEKSI 2: Form Terpisah Pengurus Rukun Tetangga (RT) ── */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
                <div>
                  <h3 className="font-heading text-base font-extrabold text-foreground">
                    2. Pengurus Rukun Tetangga (RT)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Daftar Ketua RT, Sekretaris RT, dan pengurus RT di lingkungan RW ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRtPengurus}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors self-start sm:self-auto"
                >
                  + Tambah Pengurus RT
                </button>
              </div>

              {rtPengurusList.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada pengurus RT yang ditambahkan.</p>
              ) : (
                <div className="space-y-2.5">
                  {rtPengurusList.map((p, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center rounded-lg border border-border/50 bg-card/60 p-2.5 sm:p-0 sm:border-0 sm:bg-transparent">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={p.nama}
                          onChange={(e) => handleRtPengurusChange(idx, "nama", e.target.value)}
                          placeholder="Nama Pengurus RT"
                          className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:w-2/5">
                        <input
                          type="text"
                          value={p.jabatan}
                          onChange={(e) => handleRtPengurusChange(idx, "jabatan", e.target.value)}
                          placeholder="Jabatan (Ketua RT 01 / Sekretaris RT 01)"
                          className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRtPengurus(idx)}
                          className="px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── SEKSI 3: Form Tambahan Organisasi Kemasyarakatan ── */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                <div>
                  <h3 className="font-heading text-base font-extrabold text-foreground">
                    3. Organisasi Kemasyarakatan &amp; Pokja RW
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tambahkan kelompok tani, Karang Taruna, PKK, Posyandu, atau organisasi warga lainnya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOrgBlock}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors self-start sm:self-auto"
                >
                  + Tambah Organisasi / Pokja
                </button>
              </div>

              {orgBlocks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada organisasi tambahan yang dimasukkan.</p>
              ) : (
                <div className="space-y-6">
                  {orgBlocks.map((block, bIdx) => (
                    <div key={block.id} className="rounded-xl border border-emerald-300/70 bg-card p-4 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-border pb-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                            Nama Organisasi / Pokja #{bIdx + 1}
                          </label>
                          <input
                            type="text"
                            value={block.namaOrganisasi}
                            onChange={(e) => handleOrgBlockMetaChange(block.id, "namaOrganisasi", e.target.value)}
                            placeholder="Contoh: Kelompok Tani Pendowo / Karang Taruna REDHOSIN / PKK"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          />
                        </div>

                        <div className="space-y-1 sm:w-56">
                          <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                            Pilihan Ikon Visual
                          </label>
                          <select
                            value={block.icon}
                            onChange={(e) => handleOrgBlockMetaChange(block.id, "icon", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          >
                            {ICON_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveOrgBlock(block.id)}
                          className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 self-end sm:self-center"
                        >
                          Hapus Organisasi
                        </button>
                      </div>

                      {/* Pengurus Organisasi Ini */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            Daftar Pengurus {block.namaOrganisasi || "Organisasi"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddOrgMember(block.id)}
                            className="text-xs font-bold text-emerald-700 hover:underline"
                          >
                            + Tambah Anggota / Pengurus
                          </button>
                        </div>

                        <div className="space-y-2">
                          {block.pengurus.map((m, mIdx) => (
                            <div key={mIdx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center rounded-lg border border-border/40 bg-background/50 p-2 sm:p-0 sm:border-0 sm:bg-transparent">
                              <input
                                type="text"
                                value={m.nama}
                                onChange={(e) => handleOrgMemberChange(block.id, mIdx, "nama", e.target.value)}
                                placeholder="Nama Lengkap"
                                className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                              />
                              <div className="flex items-center gap-2 sm:w-2/5">
                                <input
                                  type="text"
                                  value={m.jabatan}
                                  onChange={(e) => handleOrgMemberChange(block.id, mIdx, "jabatan", e.target.value)}
                                  placeholder="Jabatan (Ketua / Wakil / Sekretaris)"
                                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOrgMember(block.id, mIdx)}
                                  className="px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {successMsg && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-2xs">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting
                ? "Menyimpan..."
                : userTier === 3 || userTier === 4
                ? "Ajukan Perubahan Data RW"
                : "Simpan Data RW & Pengurus"}
            </button>
          </div>
        </form>
      </div>

      {/* Crop Modal untuk Foto Ketua RW */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImage}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
