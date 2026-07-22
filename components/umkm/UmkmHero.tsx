// ─── Inline SVG Icons for UMKM Hero ───────────────────────────────────────────
function IconShoppingBag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-300 shrink-0">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-300 shrink-0">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 0 1 2 2v4a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.8-5.6-2.4l-2-3a2 2 0 0 1 3.3-2.3l.7 1" />
    </svg>
  );
}

function IconMessageCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-300 shrink-0">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-300 shrink-0">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function UmkmHero() {
  return (
    <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#064e3b] py-14 sm:py-20 text-white">
      {/* Decorative background radial glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl space-y-4">
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-medium tracking-wide text-emerald-300 backdrop-blur-md shadow-sm">
            <IconShoppingBag />
            <span>Direktori Usaha &amp; Potensi Ekonomi Lokal</span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight sm:leading-tight">
            Katalog UMKM &amp; Potensi Desa
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base text-emerald-100/90 sm:text-lg leading-relaxed max-w-2xl">
            Temukan produk kerajinan, kuliner olahan, dan beragam jasa usaha lokal karya warga Kelurahan Mlokomanis Kulon. Mari dukung perekonomian desa kita!
          </p>

          {/* Feature Highlights Strip */}
          <div className="pt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-colors hover:border-emerald-400/30">
              <IconHandshake />
              <div>
                <p className="font-heading text-xs font-bold text-white">Dukung Usaha Lokal</p>
                <p className="font-sans text-[11px] text-emerald-200/80">Langsung dari produsen</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-colors hover:border-emerald-400/30">
              <IconMessageCircle />
              <div>
                <p className="font-heading text-xs font-bold text-white">Direct WhatsApp</p>
                <p className="font-sans text-[11px] text-emerald-200/80">Pesan tanpa perantara</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-sm transition-colors hover:border-emerald-400/30">
              <IconMapPin />
              <div>
                <p className="font-heading text-xs font-bold text-white">Lokasi Terverifikasi</p>
                <p className="font-sans text-[11px] text-emerald-200/80">Panduan Google Maps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
