import imageCompression from "browser-image-compression";

function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "image/heic" || type === "image/heif" || name.endsWith(".heic") || name.endsWith(".heif");
}

// Foto dari kamera iPhone default HEIC — browser-image-compression tidak punya
// decoder HEIC, jadi dikonversi dulu ke JPEG lewat heic2any sebelum masuk
// pipeline kompresi WebP biasa.
async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
}

// PRD Bagian 7 poin 3: semua upload gambar CMS wajib dikompresi client-side
// ke WebP, maks 500KB, sebelum dikirim ke Firebase Storage.
export async function compressImage(file: File): Promise<File> {
  const source = isHeic(file) ? await convertHeicToJpeg(file) : file;

  return imageCompression(source, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    fileType: "image/webp",
    useWebWorker: true,
  });
}
