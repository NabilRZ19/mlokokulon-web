import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Content-Security-Policy
// ---------------------------------------------------------------------------
// Situs ini 100% SSG/ISR untuk halaman publik (Aturan Kritikal #2, CLAUDE.md) —
// tidak ada per-request dynamic rendering. Nonce-based CSP ('strict-dynamic')
// butuh setiap halaman di-render dinamis per request supaya nonce di header
// bisa ditempelkan ke tag <script>/<style> yang di-render (lihat referensi di
// bawah) — itu bertentangan dengan arsitektur statis situs ini, jadi dipakai
// pola domain-allowlist + 'unsafe-inline' sebagai gantinya. Build-time
// <script> yang di-load dari /_next/static tetap dilindungi lewat SRI
// (experimental.sri di next.config.ts), jadi integritas script tetap terjaga
// meski tanpa nonce.
// Referensi: node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
// ---------------------------------------------------------------------------

function buildCsp(): string {
  const isDev = process.env.NODE_ENV === "development";

  // Catatan img-src & connect-src:
  //   Semua gambar MinIO sudah diproxy server-side via /api/media (lib/image-url.ts),
  //   sehingga browser hanya fetch ke 'self' — tidak perlu izin http://76.13.191.42.
  //   Unsplash diakses langsung via https, sehingga tetap perlu di img-src.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    font-src 'self';
    img-src 'self' data: blob: https://images.unsplash.com
      https://mt0.google.com https://mt1.google.com https://mt2.google.com https://mt3.google.com
      https://services.arcgisonline.com https://server.arcgisonline.com
      https://*.tile.openstreetmap.org https://tile.openstreetmap.org;
    connect-src 'self'
      https://mt0.google.com https://mt1.google.com https://mt2.google.com https://mt3.google.com
      https://services.arcgisonline.com https://server.arcgisonline.com
      https://*.tile.openstreetmap.org https://tile.openstreetmap.org;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
    upgrade-insecure-requests;
  `;

  // Hapus whitespace berlebih agar header tidak terlalu panjang
  return cspHeader.replace(/\s{2,}/g, " ").trim();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ------------------------------------------------------------------
  // 1. Tambahkan CSP header untuk setiap page request
  // ------------------------------------------------------------------
  const cspValue = buildCsp();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", cspValue);

  // ------------------------------------------------------------------
  // 2. Auth guard untuk rute /admin dan /api/admin
  // ------------------------------------------------------------------

  // Bebaskan route login
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", cspValue);
    return response;
  }

  // Proteksi semua rute /admin dan /api/admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ------------------------------------------------------------------
  // 3. Lanjutkan request normal + set CSP pada response
  // ------------------------------------------------------------------
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspValue);
  return response;
}

export const config = {
  matcher: [
    /*
     * Terapkan proxy (CSP + auth) ke semua route KECUALI:
     * - _next/static  (JS/CSS/font bundle statis Next.js)
     * - _next/image   (image optimization endpoint)
     * - favicon.ico
     *
     * Juga abaikan prefetch request agar nonce baru tidak di-generate
     * untuk request yang tidak me-render halaman.
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
