import { kontakPerangkatData } from "@/lib/seed-data";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Kelurahan Mlokomanis Kulon</p>
        <p>Kec. Ngadirojo, Kab. Wonogiri, Jawa Tengah 57681</p>

        <div className="mt-4 grid gap-1">
          {kontakPerangkatData.map((k) => (
            <p key={k.jabatan}>
              {k.jabatan}: {k.whatsapp}
            </p>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} Kelurahan Mlokomanis Kulon. Dibangun oleh Tim KKN.
        </p>
      </div>
    </footer>
  );
}
