import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadToStorage } from "@/lib/storage";

// ── Konfigurasi upload ────────────────────────────────────────────────────────
/** Batas ukuran file yang diterima server (5 MB). Kompresi client (lib/image-compression.ts)
 *  seharusnya membuat file jauh lebih kecil dari ini, tapi server tetap perlu cek sendiri. */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/** MIME type yang diizinkan — hanya gambar. Video diinput lewat URL, bukan upload. */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Ekstensi final yang dipetakan dari MIME type — TIDAK mengambil dari nama file asli. */
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
};

// ── Magic byte signatures ─────────────────────────────────────────────────────
// Validasi konten file di sisi server — tidak bisa dipalsukan oleh client seperti MIME header.
function detectImageMime(buf: Buffer): string | null {
  // JPEG: FF D8 FF
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "image/png";
  }
  // WebP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50 (RIFF....WEBP)
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return "image/webp";
  }
  // GIF87a / GIF89a
  if (
    buf.length >= 6 &&
    buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) && buf[5] === 0x61
  ) {
    return "image/gif";
  }
  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. Auth check — semua tier admin boleh upload
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan dalam request" }, { status: 400 });
  }

  // 2. Cek ukuran SEBELUM baca ke memory — cegah memory DoS
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File terlalu besar. Maksimal ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    );
  }

  // 3. Cek MIME type dari Content-Type header (lapisan pertama — mudah dipalsukan client)
  const declaredMime = file.type;
  if (!ALLOWED_MIME_TYPES.has(declaredMime)) {
    return NextResponse.json(
      { error: "Tipe file tidak diizinkan. Hanya gambar (JPG, PNG, WebP, GIF) yang diterima." },
      { status: 415 },
    );
  }

  // 4. Baca buffer & validasi magic bytes (lapisan utama — tidak bisa dipalsukan)
  const buffer = Buffer.from(await file.arrayBuffer());
  const actualMime = detectImageMime(buffer);

  if (!actualMime || !ALLOWED_MIME_TYPES.has(actualMime)) {
    return NextResponse.json(
      { error: "Format file tidak valid. File bukan gambar yang diizinkan (JPG, PNG, WebP, GIF)." },
      { status: 415 },
    );
  }

  // 5. Tentukan ekstensi dari MIME type biner yang sudah tervalidasi — BUKAN dari nama file/header client
  const ext = MIME_TO_EXT[actualMime] ?? "webp";
  const key = `media/${randomUUID()}.${ext}`;

  try {
    const url = await uploadToStorage(key, buffer, actualMime);
    return NextResponse.json({ url });
  } catch (err) {
    // Log detail di server, tapi jangan bocorkan ke client
    console.error("[upload] Storage error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan file. Coba lagi." },
      { status: 500 },
    );
  }
}
