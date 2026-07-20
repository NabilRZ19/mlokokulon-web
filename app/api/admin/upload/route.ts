import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadToStorage } from "@/lib/storage";

// Beda dari Firebase Storage (client SDK upload langsung + Security Rules) — MinIO butuh upload
// lewat server. File yang diterima sudah dikompres di client (lib/image-compression.ts, TIDAK
// berubah dari sebelumnya). Belum dipakai form manapun — disiapkan buat wiring CRUD berikutnya.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() ?? "webp";
  const key = `${randomUUID()}.${ext}`;

  const url = await uploadToStorage(key, buffer, file.type || "application/octet-stream");
  return NextResponse.json({ url });
}
