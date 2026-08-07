"use client";

import { useState } from "react";

interface InfoLinkButtonProps {
  label?: string;
  className?: string;
}

type TabType = "gmaps" | "youtube" | "gdrive" | "sosmed";

export function InfoLinkButton({
  label = "Info Tatacara Upload Link",
  className = "",
}: InfoLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("gmaps");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/40 ${className}`}
        title="Buka petunjuk tatacara copy link media & lokasi"
      >
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{label}</span>
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Panduan Tatacara Copy Link
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Langkah-langkah menyalin link publik sesuai dengan platform &amp; peruntukannya.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-bold"
                aria-label="Tutup Modal"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs per Platform */}
            <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("gmaps")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "gmaps"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                📍 Google Maps
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("youtube")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "youtube"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                ▶️ YouTube
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("gdrive")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "gdrive"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                📁 Google Drive / PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sosmed")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "sosmed"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                📱 TikTok &amp; IG
              </button>
            </div>

            {/* Tab Content: Step by Step Guide */}
            {activeTab === "gmaps" && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 text-xs text-blue-900">
                  <p className="font-bold">📍 Peruntukan: Link Lokasi UMKM, Alamat Wilayah &amp; Peta Kelurahan</p>
                  <p className="mt-1 text-blue-800/90">
                    Digunakan agar pengunjung dapat langsung membuka petunjuk arah di aplikasi Google Maps.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Buka Google Maps</p>
                      <p className="text-muted-foreground mt-0.5">
                        Buka aplikasi <strong>Google Maps</strong> di HP atau kunjungi situs <code className="rounded bg-muted px-1 font-mono text-[11px]">maps.google.com</code> di laptop/komputer.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Cari Titik Lokasi / Alamat</p>
                      <p className="text-muted-foreground mt-0.5">
                        Ketik nama lokasi atau tandai titik lokasi yang diinginkan di peta (misalnya lokasi toko UMKM/Kantor).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Klik Tombol Bagikan (Share)</p>
                      <p className="text-muted-foreground mt-0.5">
                        Pada panel informasi tempat di bagian bawah atau samping, klik tombol <strong>"Bagikan" (Share)</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                      4
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Salin Link &amp; Tempel ke Form</p>
                      <p className="text-muted-foreground mt-0.5">
                        Pilih opsi <strong>"Salin Link" (Copy Link)</strong>, lalu tempelkan (paste) link tersebut ke dalam kolom input form CMS.
                      </p>
                      <div className="mt-1.5 rounded-lg border border-border bg-muted/60 p-2 font-mono text-[11px] text-foreground">
                        Contoh format valid: https://maps.app.goo.gl/pNsbhJ2xtcfzi7K97
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "youtube" && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 text-xs text-red-900">
                  <p className="font-bold">▶️ Peruntukan: Video Berita, Dokumen Kegiatan &amp; Galeri Video</p>
                  <p className="mt-1 text-red-800/90">
                    Video YouTube yang dimasukkan akan dapat diputar secara langsung (embed) oleh pengunjung website.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-extrabold text-white">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Buka Video di YouTube</p>
                      <p className="text-muted-foreground mt-0.5">
                        Buka aplikasi YouTube di HP atau buka video target melalui browser YouTube.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-extrabold text-white">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Klik Tombol Bagikan (Share)</p>
                      <p className="text-muted-foreground mt-0.5">
                        Klik tombol <strong>"Bagikan" (Share)</strong> yang terletak di bawah judul video YouTube.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-extrabold text-white">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Salin Link / Copy Link</p>
                      <p className="text-muted-foreground mt-0.5">
                        Klik ikon <strong>"Salin" (Copy Link)</strong> untuk menyalin URL video ke clipboard.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-extrabold text-white">
                      4
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Tempel ke Form CMS</p>
                      <p className="text-muted-foreground mt-0.5">
                        Tempelkan link ke kolom URL Video di form CMS berita/galeri.
                      </p>
                      <div className="mt-1.5 space-y-1 rounded-lg border border-border bg-muted/60 p-2 font-mono text-[11px] text-foreground">
                        <p>Contoh link standar: https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
                        <p>Contoh link pendek: https://youtu.be/dQw4w9WgXcQ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gdrive" && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-emerald-900">
                  <p className="font-bold">📁 Peruntukan: Lampiran Dokumen PDF, SK Kelurahan &amp; Form Unduhan</p>
                  <p className="mt-1 text-emerald-800/90">
                    Memudahkan warga untuk membaca dan mengunduh berkas dokumen resmi secara langsung.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Buka Berkas di Google Drive</p>
                      <p className="text-muted-foreground mt-0.5">
                        Buka akun <strong>Google Drive</strong> Anda, cari berkas dokumen (PDF, Word, dll) yang ingin dibagikan.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Buka Pengaturan Bagikan (Share)</p>
                      <p className="text-muted-foreground mt-0.5">
                        Klik kanan berkas (atau klik ikon titik tiga ⋮) &gt; pilih menu <strong>"Bagikan" (Share) &gt; "Dapatkan Link"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-extrabold text-white">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-amber-900">⚠️ PENTING: Ubah Akses Publik</p>
                      <p className="text-muted-foreground mt-0.5">
                        Pada bagian <em>Akses Umum (General Access)</em>, ubah dari <strong>"Dibatasi" (Restricted)</strong> menjadi <strong>"Siapa saja yang memiliki link" (Anyone with the link)</strong> agar warga dapat membuka berkas tersebut tanpa perlu minta izin.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                      4
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Salin Link &amp; Tempel ke Form</p>
                      <p className="text-muted-foreground mt-0.5">
                        Klik <strong>"Salin Link" (Copy Link)</strong>, lalu tempelkan ke kolom form Tautan Media/Lampiran.
                      </p>
                      <div className="mt-1.5 rounded-lg border border-border bg-muted/60 p-2 font-mono text-[11px] text-foreground">
                        Contoh format valid: https://drive.google.com/file/d/1A2B3C.../view
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sosmed" && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3.5 text-xs text-purple-900">
                  <p className="font-bold">📱 Peruntukan: Link Postingan TikTok, Instagram, atau Facebook</p>
                  <p className="mt-1 text-purple-800/90">
                    Menyambungkan berita atau liputan media dengan akun postingan sosial media resmi.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-extrabold text-white">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Buka Postingan Sosial Media</p>
                      <p className="text-muted-foreground mt-0.5">
                        Buka postingan atau video publik di aplikasi <strong>TikTok</strong>, <strong>Instagram</strong>, atau <strong>Facebook</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-extrabold text-white">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Klik Ikon Bagikan / Panah</p>
                      <p className="text-muted-foreground mt-0.5">
                        Klik ikon <strong>Bagikan (Panah Share / Titik Tiga)</strong> pada postingan tersebut.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-extrabold text-white">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Pilih Salin Tautan (Copy Link)</p>
                      <p className="text-muted-foreground mt-0.5">
                        Pilih tombol <strong>"Salin Tautan" / "Copy Link"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-extrabold text-white">
                      4
                    </span>
                    <div>
                      <p className="font-bold text-foreground">Tempel ke Form CMS</p>
                      <p className="text-muted-foreground mt-0.5">
                        Tempelkan link ke kolom Tautan Media di form berita/galeri.
                      </p>
                      <div className="mt-1.5 space-y-1 rounded-lg border border-border bg-muted/60 p-2 font-mono text-[11px] text-foreground">
                        <p>TikTok: https://vt.tiktok.com/ZS... atau https://www.tiktok.com/@user/video/...</p>
                        <p>Instagram: https://www.instagram.com/p/C.../</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                💡 Pilihlah tab platform di atas sesuai peruntukan link Anda.
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors shrink-0"
              >
                Paham &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

