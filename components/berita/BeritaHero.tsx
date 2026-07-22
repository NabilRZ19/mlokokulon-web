// ─── Inline SVG Icons for Berita Hero ─────────────────────────────────────────
function IconNewspaper() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-300 shrink-0">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function IconZap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-secondary shrink-0">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-secondary shrink-0">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

function IconShieldCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-secondary shrink-0">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function BeritaHero() {
  return (
    <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0f172a] via-primary to-[#1e3a8a] py-14 sm:py-20 text-white">
      {/* Decorative background radial glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl space-y-4">
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md shadow-sm">
            <IconNewspaper />
            <span>Portal Berita &amp; Warta Resmi Kelurahan</span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight sm:leading-tight">
            Kabar Terkini &amp; Pengumuman Desa
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base text-blue-100/90 sm:text-lg leading-relaxed max-w-2xl">
            Pusat informasi publik resmi Kelurahan Mlokomanis Kulon. Temukan warta kegiatan, berita pembangunan, dan pengumuman publik dari setiap RW.
          </p>

          {/* Feature Highlights Strip */}
          <div className="pt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-colors hover:border-white/25">
              <IconZap />
              <div>
                <p className="font-heading text-xs font-bold text-white">Terupdate</p>
                <p className="font-sans text-[11px] text-blue-200/80">Kabar kegiatan berkala</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-colors hover:border-white/25">
              <IconBuilding />
              <div>
                <p className="font-heading text-xs font-bold text-white">Sumber Resmi</p>
                <p className="font-sans text-[11px] text-blue-200/80">Perangkat desa &amp; RW</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-colors hover:border-white/25">
              <IconShieldCheck />
              <div>
                <p className="font-heading text-xs font-bold text-white">Transparan</p>
                <p className="font-sans text-[11px] text-blue-200/80">Akses publik terbuka</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
