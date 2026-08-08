import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  berita as beritaTable,
  beritaFotoTambahan,
  galeri as galeriTable,
} from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { isValidDateStr, isValidEnum, isValidString, isValidUrl } from "@/lib/validate";
import { handleApiError } from "@/lib/api-error";
import { needsApproval } from "@/lib/auth-policy";

const MAX_FOTO_TAMBAHAN = 4;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });
  }

  try {
    const rows = await db
      .select()
      .from(beritaTable)
      .where(eq(beritaTable.id, id))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    }

    const row = rows[0];
    const foto = await db
      .select()
      .from(beritaFotoTambahan)
      .where(eq(beritaFotoTambahan.beritaId, id));

    return NextResponse.json({
      id: row.id,
      judul: row.judul,
      slug: row.slug,
      isi: row.isi,
      tanggal: row.tanggal,
      kategori: row.kategori,
      cakupan: row.cakupan,
      rw_id: row.rwId ?? "",
      rw_nama: row.rwNama ?? "",
      gambar_cover_url: row.gambarCoverUrl,
      video_url: row.videoUrl ?? "",
      video_title: row.videoTitle ?? "",
      penulis: row.penulis,
      foto_tambahan: foto.map((f) => f.url),
      status: row.status ?? "published",
      reviewer_note: row.reviewerNote ?? "",
      pengusul: row.pengusul ?? "",
    });
  } catch (err) {
    return handleApiError("api/admin/berita/[id] GET", err, "Gagal mengambil data berita");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });
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

    const sanitizedRwId = cakupan === "rw" && typeof rw_id === "string" && rw_id.trim().length > 0 ? rw_id.trim() : null;
    const sanitizedRwNama = cakupan === "rw" && typeof rw_nama === "string" && rw_nama.trim().length > 0 ? rw_nama.trim() : null;
    const sanitizedVideoUrl = typeof video_url === "string" && video_url.trim().length > 0 ? video_url.trim() : null;
    const sanitizedVideoTitle = typeof video_title === "string" && video_title.trim().length > 0 ? video_title.trim() : null;

    // Edit oleh Tier 3/4: reset status ke pending (perlu review ulang)
    const newStatus = needsApproval(session.tier) ? "pending" : "published";

    await db
      .update(beritaTable)
      .set({
        judul,
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
        status: newStatus,
        submittedByTier: session.tier,
        pengusul: typeof pengusul === "string" && pengusul.trim() ? pengusul.trim() : null,
      })
      .where(eq(beritaTable.id, id));

    // Re-insert foto tambahan child table
    await db.delete(beritaFotoTambahan).where(eq(beritaFotoTambahan.beritaId, id));
    const fotoLimited: string[] = (foto_tambahan as string[]).slice(0, MAX_FOTO_TAMBAHAN);
    if (fotoLimited.length > 0) {
      await db.insert(beritaFotoTambahan).values(
        fotoLimited.map((url) => ({ beritaId: id, url }))
      );
    }

    // Galeri dari foto yang di-check masukGaleri (hanya yang baru ditambahkan)
    const galeriInserts = (galeri_foto as { url: string; judul: string; masukGaleri: boolean }[])
      .filter((f) => f.masukGaleri);
    if (galeriInserts.length > 0) {
      await db.insert(galeriTable).values(
        galeriInserts.map((f) => ({
          id: `galeri-${randomUUID().slice(0, 8)}`,
          judul: f.judul || judul,
          tipe: "foto" as const,
          urlMedia: f.url,
          kategori: kategori,
          sumberBeritaId: id,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError("api/admin/berita/[id] PUT", err, "Gagal memperbarui berita");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });
  }

  try {
    await db.delete(beritaFotoTambahan).where(eq(beritaFotoTambahan.beritaId, id));
    await db.delete(beritaTable).where(eq(beritaTable.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/berita/id] DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus berita" }, { status: 500 });
  }
}
