import type { ReactNode } from "react";

// Notice box konsisten untuk menandai konten yang masih [DATA MENYUSUL] — dipakai di
// /profil, /layanan, /kontak. Warna amber sengaja di luar token desain (lihat docs/DESIGN.md).
export function PlaceholderNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm italic text-amber-700">
      {children}
    </div>
  );
}
