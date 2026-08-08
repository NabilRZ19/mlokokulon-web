"use client";

import { useEffect, useState } from "react";

interface ApprovalNoticeBannerProps {
  contentType: string; // e.g. "berita", "galeri", "UMKM", "perubahan Ketua RW"
}

/**
 * Banner peringatan yang ditampilkan pada form input CMS ketika diakses oleh Tier 3 (Admin RW)
 * atau Tier 4 (Admin Kampung KB). Menjelaskan bahwa konten memerlukan persetujuan Admin Kelurahan.
 */
export function ApprovalNoticeBanner({ contentType }: ApprovalNoticeBannerProps) {
  const [tier, setTier] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setTier(d?.tier ?? null))
      .catch(() => null);
  }, []);

  if (tier !== 3 && tier !== 4) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 shadow-xs animate-in fade-in duration-200">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-heading text-sm font-extrabold text-amber-900">
          Perhatian!
        </h4>
        <p className="mt-0.5 text-xs font-medium text-amber-800 leading-relaxed">
          Konten <strong className="font-bold underline decoration-amber-400">{contentType}</strong> ini perlu persetujuan Admin Kelurahan sebelum diterbitkan secara resmi di halaman utama website.
        </p>
      </div>
    </div>
  );
}
