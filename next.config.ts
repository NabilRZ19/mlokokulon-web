import type { NextConfig } from "next";

// S3/MinIO endpoint hostname — dipakai di images.remotePatterns agar Next.js
// Image Optimization bisa memproses gambar dari MinIO server-side.
// Catatan: browser TIDAK pernah mengakses MinIO langsung; semua request gambar
// diproxy via /api/media (lib/image-url.ts), sehingga CSP tidak perlu izin ke IP MinIO.
if (!process.env.S3_ENDPOINT) {
  throw new Error("S3_ENDPOINT wajib diisi di environment variables.");
}
const minioEndpointUrl = new URL(process.env.S3_ENDPOINT);
const MINIO_HOSTNAME = minioEndpointUrl.hostname;
const MINIO_PORT = minioEndpointUrl.port ? `:${minioEndpointUrl.port}` : "";

// ---------------------------------------------------------------------------
// Security Headers (CSP tidak disertakan di sini — tetap dihandle di
// proxy.ts, domain-allowlist based, lihat komentar buildCsp() di sana)
// ---------------------------------------------------------------------------
const securityHeaders = [
  // Anti-clickjacking (redundan dengan frame-ancestors di CSP, tetapi berguna
  // untuk browser lama yang belum support CSP frame-ancestors)
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Cegah browser menebak MIME type (MIME sniffing attack)
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Kurangi kebocoran Referer ke third-party
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Batasi akses browser API yang tidak diperlukan website kelurahan ini
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // HSTS — hanya di production (hindari masalah saat dev pakai HTTP)
  // max-age 2 tahun + includeSubDomains + preload
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Catatan: experimental.sri (Subresource Integrity untuk build-time <script>)
  // sempat dicoba tapi DIMATIKAN — hash `integrity` yang ditulis saat build
  // tidak cocok dengan file yang benar-benar disajikan di Vercel (Turbopack
  // chunk hash mismatch), sehingga browser memblokir SEMUA script di production.
  // Fitur ini masih experimental di Next.js 16, jangan diaktifkan lagi sampai
  // terverifikasi stabil dengan Turbopack build di Vercel.

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // HTTP (dev only) — dipertahankan agar Next.js Image Optimization bisa
      // memproses gambar dari MinIO server-side dalam environment development.
      // Browser tetap tidak pernah mengakses http:// langsung; semua via /api/media.
      ...(process.env.NODE_ENV === "development"
        ? [
            {
              protocol: "http" as const,
              hostname: MINIO_HOSTNAME,
              port: MINIO_PORT.replace(":", ""),
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: MINIO_HOSTNAME,
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 86400,
  },

  async headers() {
    return [
      {
        // Terapkan security headers ke semua route.
        // CSP dikecualikan dari sini dan dihandle di proxy.ts (nonce-based).
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Cache statis gambar & media publik selama 1 tahun (immutable)
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
