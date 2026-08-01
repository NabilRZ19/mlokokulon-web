import { Reveal } from "@/components/ui/Reveal";

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

export function BeritaHero() {
  return (
    <Reveal mode="load" duration={0.65} distance={24}>
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
          </div>
        </div>
      </div>
    </Reveal>
  );
}
