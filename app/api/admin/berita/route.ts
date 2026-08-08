import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { berita as beritaTable, beritaFotoTambahan, galeri as galeriTable } from "@/lib/db/schema";
import { getBeritaList } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { isValidDateStr, isValidEnum, isValidString, isValidUrl } from "@/lib/validate";
import { revalidatePath } from "next/cache";
import { handleApiError } from "@/lib/api-error";
import { needsApproval } from "@/lib/auth-policy";

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

  const items = await getBeritaList(false);
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
      video_url,
      video_title,
      penulis,
      pengusul = "",
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
    const sanitizedVideoUrl = typeof video_url === "string" && video_url.trim().length > 0 ? video_url.trim() : null;
    const sanitizedVideoTitle = typeof video_title === "string" && video_title.trim().length > 0 ? video_title.trim() : null;

    // Status: Tier 3 & 4 perlu approval, Tier 1 & 2 langsung published
    const status = needsApproval(session.tier) ? "pending" : "published";

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
      videoUrl: sanitizedVideoUrl,
      videoTitle: sanitizedVideoTitle,
      penulis,
      createdBy: String(session.id),
      status,
      submittedByTier: session.tier,
      pengusul: typeof pengusul === "string" && pengusul.trim() ? pengusul.trim() : null,
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

    revalidatePath("/");
    revalidatePath("/berita");
    revalidatePath("/galeri");

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (err) {
    return handleApiError("api/admin/berita POST", err, "Gagal menyimpan berita baru");
  }
}
