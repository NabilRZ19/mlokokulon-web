"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
  { value: "sprout", label: "🌿 Kelompok Tani / Pertanian", iconSymbol: "🌿" },
  { value: "users", label: "👥 Karang Taruna / Pemuda", iconSymbol: "👥" },
  { value: "pkk", label: "👩‍👧‍👦 PKK / Posyandu / Keluarga", iconSymbol: "👩‍👧‍👦" },
  { value: "shield", label: "🛡️ Linmas / Keamanan Warga", iconSymbol: "🛡️" },
  { value: "trophy", label: "🏆 Olahraga & Seni", iconSymbol: "🏆" },
  { value: "building", label: "🏢 Kelembagaan / Umum", iconSymbol: "🏢" },
];

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
  const [deskripsiSingkat, setDeskripsiSingkat] = useState("");
  const [potensi, setPotensi] = useState("");

  // 1. Pengurus Inti RW
  const [rwCoreList, setRwCoreList] = useState<{ nama: string; jabatan: string }[]>([]);

  // 2. Pengurus RT (Dipisahkan)
  const [rtPengurusList, setRtPengurusList] = useState<{ nama: string; jabatan: string }[]>([]);

  // 3. Organisasi Tambahan (Karang Taruna, Tani, PKK, Posyandu, dll)
  const [orgBlocks, setOrgBlocks] = useState<OrganisasiBlock[]>([]);

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
        setDeskripsiSingkat(data.deskripsi_singkat || "");
        setPotensi(data.potensi || "");

        const existingPengurus: PengurusItem[] = data.struktur_pengurus || [];

        // Parse pengurus RW Core (Ketua RW, Sekretaris RW, Bendahara RW)
        const rwCore = existingPengurus.filter(
          (p) =>
            !p.jabatan.toLowerCase().includes("rt") &&
            !p.jabatan.toLowerCase().includes("tani") &&
            !p.jabatan.toLowerCase().includes("karang taruna") &&
            !p.jabatan.toLowerCase().includes("redhosin") &&
            p.kategori !== "organisasi"
        );

        if (!rwCore.some((p) => p.jabatan.toLowerCase().includes("ketua"))) {
          setRwCoreList([{ nama: "", jabatan: "Ketua RW" }, ...rwCore]);
        } else {
          setRwCoreList(rwCore.map((p) => ({ nama: p.nama, jabatan: p.jabatan })));
        }

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
    setRwCoreList((prev) => [...prev, { nama: "", jabatan: "Anggota RW" }]);
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

  // ── Submit Form ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Gabungkan struktur_pengurus untuk dikirim ke API & DB
      const combinedPengurus: PengurusItem[] = [];

      // 1. RW Core
      rwCoreList.forEach((p) => {
        if (p.nama.trim()) {
          combinedPengurus.push({
            nama: p.nama.trim(),
            jabatan: p.jabatan.trim() || "Pengurus RW",
            kategori: "rw",
          });
        }
      });

      // 2. Pengurus RT
      rtPengurusList.forEach((p) => {
        if (p.nama.trim()) {
          combinedPengurus.push({
            nama: p.nama.trim(),
            jabatan: p.jabatan.trim() || "Pengurus RT",
            kategori: "rt",
          });
        }
      });

      // 3. Organisasi Tambahan
      orgBlocks.forEach((block) => {
        const orgName = block.namaOrganisasi.trim() || "Organisasi Kemasyarakatan";
        block.pengurus.forEach((p) => {
          if (p.nama.trim()) {
            combinedPengurus.push({
              nama: p.nama.trim(),
              jabatan: p.jabatan.trim() || "Pengurus",
              kategori: "organisasi",
              organisasi: orgName,
              icon: block.icon || "users",
            });
          }
        });
      });

      const payload = {
        nama_rw: namaRw,
        cakupan_dusun: cakupanDusun,
        jumlah_rt: Number(jumlahRt),
        is_kampung_kb: isKampungKb,
        deskripsi_singkat: deskripsiSingkat,
        potensi,
        statistik: {
          jumlah_kk: Number(jumlahKk),
          jumlah_jiwa: Number(jumlahJiwa),
        },
        struktur_pengurus: combinedPengurus,
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

          {/* ── SEKSI A: Pengurus Inti RW (Ketua, Sekretaris, Bendahara RW) ── */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
              <div>
                <h3 className="font-heading text-base font-extrabold text-foreground">
                  1. Pengurus Inti RW
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ketua RW, Sekretaris RW, Bendahara RW, dan pengurus inti wilayah.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRwCore}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
              >
                + Tambah Pengurus RW
              </button>
            </div>

            <div className="space-y-2.5">
              {rwCoreList.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={p.nama}
                    onChange={(e) => handleRwCoreChange(idx, "nama", e.target.value)}
                    placeholder="Nama Lengkap Pengurus RW"
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    type="text"
                    value={p.jabatan}
                    onChange={(e) => handleRwCoreChange(idx, "jabatan", e.target.value)}
                    placeholder="Jabatan (Ketua RW / Sekretaris RW / Bendahara RW)"
                    className="w-2/5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRwCore(idx)}
                    className="px-2.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── SEKSI B: Form Terpisah Pengurus Rukun Tetangga (RT) ── */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
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
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                + Tambah Pengurus RT
              </button>
            </div>

            {rtPengurusList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Belum ada pengurus RT yang ditambahkan.</p>
            ) : (
              <div className="space-y-2.5">
                {rtPengurusList.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={p.nama}
                      onChange={(e) => handleRtPengurusChange(idx, "nama", e.target.value)}
                      placeholder="Nama Pengurus RT"
                      className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <input
                      type="text"
                      value={p.jabatan}
                      onChange={(e) => handleRtPengurusChange(idx, "jabatan", e.target.value)}
                      placeholder="Jabatan (Ketua RT 01 / Sekretaris RT 01)"
                      className="w-2/5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRtPengurus(idx)}
                      className="px-2.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SEKSI C: Form Tambahan Organisasi Kemasyarakatan (Tani, Karang Taruna, PKK, dll) ── */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <h3 className="font-heading text-base font-extrabold text-foreground">
                  3. Organisasi Kemasyarakatan &amp; Pokja RW
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tambahkan kelompok tani, Karang Taruna, PKK, Posyandu, atau organisasi warga lainnya beserta ikon visualnya.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddOrgBlock}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
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
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
                          <div key={mIdx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={m.nama}
                              onChange={(e) => handleOrgMemberChange(block.id, mIdx, "nama", e.target.value)}
                              placeholder="Nama Lengkap"
                              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                            />
                            <input
                              type="text"
                              value={m.jabatan}
                              onChange={(e) => handleOrgMemberChange(block.id, mIdx, "jabatan", e.target.value)}
                              placeholder="Jabatan (Ketua / Wakil / Sekretaris / Bendahara)"
                              className="w-2/5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOrgMember(block.id, mIdx)}
                              className="px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                            >
                              ✕
                            </button>
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
