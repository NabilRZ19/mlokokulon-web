import { StarIcon } from "./icons";

// Tag khusus Kampung KB — wajib menonjol/beda dari elemen lain (PRD Bagian 6.4 & 8), dipakai di
// /wilayah dan /wilayah/[rwId]. Beda dari Badge biasa: ada ikon bintang + efek glow tipis di
// sekeliling pill, bukan cuma pill warna polos.
export function KampungKbTag() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_0_4px_rgba(22,163,74,0.15)]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-5a3 3 0 0 0-6 0v5H4a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
      Kampung KB
    </span>
  );
}
