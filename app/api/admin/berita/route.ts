import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { berita as beritaTable, beritaFotoTambahan, galeri as galeriTable } from "@/lib/db/schema";
import { getBeritaList } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { isValidDateStr, isValidEnum, isValidString, isValidUrl } from "@/lib/validate";
import { handleApiError } from "@/lib/api-error";

// Sesuai aturan bisnis: 1 berita = maks 1 foto headline + maks 4 foto tambahan
const MAX_FOTO_TAMBAHAN = 4;

function makeSlug(judul: string): string {
  return judul
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getBeritaList();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      judul,
      isi,
      tanggal,
      kategori,
      cakupan,
      rw_id,
      rw_nama,
      gambar_cover_url,
      penulis,
      foto_tambahan = [],
      galeri_foto = [],
    } = body;

    if (
      !isValidString(judul, 3, 255) ||
      !isValidString(isi, 10, 50000) ||
      !isValidDateStr(tanggal) ||
      !isValidEnum(kategori, ["pengumuman", "kegiatan", "pembangunan", "berita", "kampung-kb"] as const) ||
      !isValidEnum(cakupan, ["kelurahan", "rw"] as const) ||
      !isValidUrl(gambar_cover_url) ||
      !isValidString(penulis, 1, 100)
    ) {
      return NextResponse.json({ error: "Input tidak valid atau field wajib belum diisi dengan benar" }, { status: 400 });
    }

    const id = `berita-${randomUUID().slice(0, 8)}`;
    const slug = `${makeSlug(judul)}-${id.slice(-6)}`;

    // Sanitasi rwId & rwNama — pastikan string kosong "" diubah ke null untuk menghindari MySQL foreign key failure
    const sanitizedRwId = cakupan === "rw" && typeof rw_id === "string" && rw_id.trim().length > 0 ? rw_id.trim() : null;
    const sanitizedRwNama = cakupan === "rw" && typeof rw_nama === "string" && rw_nama.trim().length > 0 ? rw_nama.trim() : null;

    await db.insert(beritaTable).values({
      id,
      judul,
      slug,
      isi,
      tanggal,
      kategori,
      cakupan,
      rwId: sanitizedRwId,
      rwNama: sanitizedRwNama,
      gambarCoverUrl: gambar_cover_url,
      penulis,
      createdBy: String(session.id),
    });

    const fotoTambahanLimited: string[] = (foto_tambahan as string[]).slice(0, MAX_FOTO_TAMBAHAN);
    if (fotoTambahanLimited.length > 0) {
      await db.insert(beritaFotoTambahan).values(
        fotoTambahanLimited.map((url) => ({ beritaId: id, url }))
      );
    }

    const galeriInserts = galeri_foto.filter((f: { masukGaleri: boolean }) => f.masukGaleri);
    if (galeriInserts.length > 0) {
      await db.insert(galeriTable).values(
        galeriInserts.map((f: { url: string; judul: string }) => ({
          id: `galeri-${randomUUID().slice(0, 8)}`,
          judul: f.judul || judul,
          tipe: "foto" as const,
          urlMedia: f.url,
          kategori: kategori,
          sumberBeritaId: id,
        }))
      );
    }

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (err) {
    return handleApiError("api/admin/berita POST", err, "Gagal menyimpan berita baru");
  }
}
