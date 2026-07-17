import imageCompression from "browser-image-compression";

// PRD Bagian 7 poin 3: semua upload gambar CMS wajib dikompresi client-side
// ke WebP, maks 500KB, sebelum dikirim ke Firebase Storage.
export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    fileType: "image/webp",
    useWebWorker: true,
  });
}
