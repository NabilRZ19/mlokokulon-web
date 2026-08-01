import type { Metadata } from "next";

// Halaman admin tidak boleh diindeks mesin pencari — berlaku ke semua route di /admin/**
// (login & seluruh CMS), termasuk app/admin/login/page.tsx yang "use client" dan tidak
// bisa export metadata sendiri.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
