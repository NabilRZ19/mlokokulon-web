import { StarIcon } from "./icons";

// Tag khusus Kampung KB — wajib menonjol/beda dari elemen lain (PRD Bagian 6.4 & 8), dipakai di
// /wilayah dan /wilayah/[rwId]. Beda dari Badge biasa: ada ikon bintang + efek glow tipis di
// sekeliling pill, bukan cuma pill warna polos.
export function KampungKbTag() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_0_4px_rgba(22,163,74,0.15)]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 fill-white/20">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      Kampung KB
    </span>
  );
}
