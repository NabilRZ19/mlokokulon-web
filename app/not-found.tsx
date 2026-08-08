import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            404 — Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-primary/90 transition-all hover:shadow-md"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/berita"
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground hover:bg-muted transition-colors"
          >
            Lihat Berita Kelurahan
          </Link>
        </div>
      </div>
    </div>
  );
}
