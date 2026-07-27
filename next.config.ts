import type { NextConfig } from "next";

// S3/MinIO endpoint hostname — dipakai di images.remotePatterns agar Next.js
// Image Optimization bisa memproses gambar dari MinIO server-side.
// Catatan: browser TIDAK pernah mengakses MinIO langsung; semua request gambar
// diproxy via /api/media (lib/image-url.ts), sehingga CSP tidak perlu izin ke IP MinIO.
const MINIO_HOSTNAME = process.env.S3_ENDPOINT
  ? new URL(process.env.S3_ENDPOINT).hostname
  : "76.13.191.42";

const MINIO_PORT = process.env.S3_ENDPOINT
  ? (() => {
      try {
        const u = new URL(process.env.S3_ENDPOINT ?? "");
        return u.port ? `:${u.port}` : "";
      } catch {
        return ":9000";
      }
    })()
  : ":9000";

// ---------------------------------------------------------------------------
// Security Headers (CSP tidak disertakan di sini — dihandle per-request
// oleh proxy.ts agar bisa menggunakan nonce yang unik tiap request)
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
  // Experimental: Subresource Integrity (SRI) untuk build-time script integrity.
  // Next.js akan menambahkan atribut `integrity` (sha256 hash) ke <script> tags
  // yang di-generate saat build, sehingga browser bisa memverifikasi file
  // tidak dimodifikasi saat transit — tanpa perlu nonce pada bundled scripts.
  experimental: {
    sri: {
      algorithm: "sha256",
    },
  },

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
