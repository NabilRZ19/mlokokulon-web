import { Reveal } from "@/components/ui/Reveal";

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

export function UmkmHero() {
  return (
    <Reveal mode="load" duration={0.65} distance={24}>
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
              Katalog UMKM &amp; Potensi Kelurahan
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-base text-emerald-100/90 sm:text-lg leading-relaxed max-w-2xl">
              Temukan produk kerajinan, kuliner olahan, dan beragam jasa usaha lokal karya warga Kelurahan Mlokomanis Kulon. Mari dukung perekonomian kelurahan kita!
            </p>

          </div>
        </div>
      </div>
    </Reveal>
  );
}
