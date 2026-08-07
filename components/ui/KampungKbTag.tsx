import { KampungKbIcon } from "./icons";

// Tag khusus Kampung KB — wajib menonjol/beda dari elemen lain (PRD Bagian 6.4 & 8), dipakai di
// /wilayah dan /wilayah/[rwId]. Beda dari Badge biasa: ada ikon Kampung KB + efek glow tipis di
// sekeliling pill, bukan cuma pill warna polos.
export function KampungKbTag() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-[0_0_0_4px_rgba(22,163,74,0.15)]">
      <KampungKbIcon className="h-3.5 w-3.5 fill-white/20" />
      Kampung KB
    </span>
  );
}

