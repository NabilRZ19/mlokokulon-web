import Link from "next/link";
import { kontakPerangkatData } from "@/lib/seed-data";

const quickLinks = [
  { href: "/profil", label: "Profil Desa" },
  { href: "/struktur", label: "Struktur Kelurahan" },
  { href: "/layanan", label: "Layanan" },
  { href: "/kontak", label: "Kontak" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-foreground text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-semibold">Kelurahan Mlokomanis Kulon</p>
          <p className="mt-2 text-sm text-white/70">
            Kec. Ngadirojo, Kab. Wonogiri, Jawa Tengah 57681
          </p>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-white/60">
            Tautan Cepat
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-white/60">
            Kontak
          </p>
          <ul className="mt-3 space-y-1 text-sm text-white/80">
            {kontakPerangkatData.map((k) => (
              <li key={k.jabatan}>
                {k.jabatan}: {k.whatsapp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/50">
          © {new Date().getFullYear()} Kelurahan Mlokomanis Kulon. Dibangun oleh Tim KKN.
        </p>
      </div>
    </footer>
  );
}
