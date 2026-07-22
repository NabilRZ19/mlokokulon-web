import Link from "next/link";
import { kelurahanProfileData as p } from "@/lib/seed-data";

const navigasiCepat = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil Desa" },
  { href: "/struktur", label: "Struktur Kelurahan" },
  { href: "/layanan", label: "Layanan Publik" },
  { href: "/kampung-kb", label: "Kampung KB" },
  { href: "/umkm", label: "UMKM & Potensi" },
  { href: "/berita", label: "Berita & Pengumuman" },
  { href: "/kontak", label: "Kontak Resmi" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-foreground text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        {/* Kolom 1: Profil & Alamat Kantor Kelurahan */}
        <div className="space-y-2">
          <p className="font-heading text-lg font-bold text-white">
            Kelurahan {p.nama}
          </p>
          <p className="text-sm text-white/80 leading-relaxed">
            Kantor Kelurahan Mlokomanis Kulon, Kecamatan {p.kecamatan}, Kabupaten {p.kabupaten}, {p.provinsi} {p.kodePos}
          </p>
        </div>

        {/* Kolom 2: Navigasi Cepat */}
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-white/60">
            Navigasi Cepat
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {navigasiCepat.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-white/80 transition-colors hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom 3: Single Hotline Contact & Jam Operasional */}
        <div className="space-y-2">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-white/60">
            Kontak Hotline Pelayanan
          </p>
          <div className="text-sm text-white/80 space-y-1">
            <p className="font-semibold text-white">
              Hotline / CS Resmi: <span className="font-bold text-white">[DATA MENYUSUL]</span>
            </p>
            <p className="text-xs text-white/70">
              Jam Layanan: Senin–Kamis (07.00–15.30) &amp; Jumat (07.00–11.00 WIB)
            </p>
          </div>
        </div>
      </div>

      {/* Footer Bottom Line & Credit */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-white/60 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Kelurahan {p.nama}. Hak Cipta Dilindungi.</p>
          <p className="font-medium text-white/80">
            Dikembangkan oleh <strong>Tim KKN 268 Universitas Sebelas Maret (UNS)</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
