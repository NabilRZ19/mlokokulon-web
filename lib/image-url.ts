/**
 * Utility helper untuk mengonversi URL gambar (termasuk MinIO HTTP/IP storage)
 * menjadi URL yang aman dan kompatibel dengan browser & HTTPS (Vercel deployment)
 * melalui Next.js API Media Proxy (/api/media/...).
 */
export function getPublicImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") {
    return "/images/placeholder-photo.svg";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "/images/placeholder-photo.svg";
  }

  // Jika URL relatif lokal (seperti /images/placeholder-photo.svg atau /api/media/...)
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Jika URL berupa data URL (base64)
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Jika URL mengarah ke MinIO (HTTP IP/Port atau MinIO domain)
  if (
    trimmed.startsWith("http://") ||
    trimmed.includes("76.13.191.42") ||
    trimmed.includes(":9000")
  ) {
    try {
      const parsed = new URL(trimmed);
      return `/api/media${parsed.pathname}`;
    } catch {
      return trimmed;
    }
  }

  // Untuk URL HTTPS eksternal (seperti Unsplash), kembalikan langsung
  return trimmed;
}
