import type { NextConfig } from "next";

// S3/MinIO endpoint hostname — diizinkan sebagai img-src di CSP.
// Next.js tidak bisa baca env var di sini saat build (hanya bisa NEXT_PUBLIC_*),
// jadi hostname MinIO di-hardcode dari .env.local.example pattern.
// Ganti dengan domain production bila MinIO sudah pakai custom domain/HTTPS.
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

// CDN/font sources — Google Fonts dipakai di app/layout.tsx
const GOOGLE_FONTS = "https://fonts.googleapis.com https://fonts.gstatic.com";

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js App Router memerlukan 'unsafe-inline' untuk inline scripts/styles (Turbopack/React)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' " + GOOGLE_FONTS,
  "font-src 'self' " + GOOGLE_FONTS,
  // img dari MinIO storage (bisa HTTP di dev, tambah https di production)
  `img-src 'self' data: blob: http://${MINIO_HOSTNAME}${MINIO_PORT} https://${MINIO_HOSTNAME}${MINIO_PORT} https://${MINIO_HOSTNAME} https://images.unsplash.com`,
  // fetch ke server sendiri + MinIO (untuk upload dari browser jika ada)
  `connect-src 'self' http://${MINIO_HOSTNAME}${MINIO_PORT} https://${MINIO_HOSTNAME}`,
  // Larang embed halaman ini di frame orang lain (anti-clickjacking di level CSP)
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // Anti-clickjacking (redundan dengan frame-ancestors di CSP, tapi tetap tambahkan
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
  // max-age 2 tahun + includeSubDomains + preload (sesuaikan domain setelah production)
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: MINIO_HOSTNAME,
        port: MINIO_PORT.replace(":", ""),
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: MINIO_HOSTNAME,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      {
        // Terapkan security headers ke semua route
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
