import { Reveal } from "@/components/ui/Reveal";

function IconMegaphone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-300 shrink-0">
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8 a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

export function PengumumanHero() {
  return (
    <Reveal mode="load" duration={0.65} distance={24}>
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#0f172a] via-primary to-[#1e3a8a] py-14 sm:py-20 text-white">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md shadow-sm">
              <IconMegaphone />
              <span>Informasi Resmi Kelurahan</span>
            </div>

            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight sm:leading-tight">
              Pengumuman Kelurahan
            </h1>

            <p className="font-sans text-base text-blue-100/90 sm:text-lg leading-relaxed max-w-2xl">
              Daftar pengumuman dan himbauan penting dari Pemerintah Kelurahan Mlokomanis Kulon untuk masyarakat umum, pengurus RT/RW, serta kelembagaan warga.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
