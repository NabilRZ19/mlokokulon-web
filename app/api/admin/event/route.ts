import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { event as eventTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  const session = await getSession();
  const deny = requireTier(session, canManageContent, [1, 2, 3, 4]);
  if (deny) return deny;

  try {
    const rows = await db
      .select()
      .from(eventTable)
      .orderBy(asc(eventTable.tanggalMulai));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        judul: r.judul,
        slug: r.slug,
        deskripsi: r.deskripsi,
        tanggal_mulai: r.tanggalMulai,
        tanggal_selesai: r.tanggalSelesai,
        jam_mulai: r.jamMulai,
        lokasi: r.lokasi,
        gambar_cover_url: r.gambarCoverUrl,
        penulis: r.penulis,
        pengusul: r.pengusul,
        status: r.status,
        reviewer_note: r.reviewerNote,
        submitted_by_tier: r.submittedByTier,
        created_by: r.createdBy,
      }))
    );
  } catch (err) {
    return handleApiError("api/admin/event GET", err, "Gagal mengambil daftar event");
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  const deny = requireTier(session, canManageContent, [1, 2, 3, 4]);
  if (deny) return deny;

  try {
    const body = await request.json();
    const {
      judul,
      slug,
      deskripsi,
      tanggal_mulai,
      tanggal_selesai,
      jam_mulai,
      lokasi,
      gambar_cover_url,
      penulis,
    } = body;

    if (!judul || !slug || !deskripsi || !tanggal_mulai || !lokasi) {
      return NextResponse.json({ error: "Judul, slug, deskripsi, tanggal mulai, dan lokasi wajib diisi" }, { status: 400 });
    }

    const isTier34 = session?.tier === 3 || session?.tier === 4;
    const initialStatus = isTier34 ? "pending" : "published";
    const id = `event-${Date.now()}`;

    await db.insert(eventTable).values({
      id,
      judul,
      slug,
      deskripsi,
      tanggalMulai: tanggal_mulai,
      tanggalSelesai: tanggal_selesai || null,
      jamMulai: jam_mulai || "08:00 WIB",
      lokasi,
      gambarCoverUrl: gambar_cover_url || null,
      penulis: penulis || session?.nama || "Admin",
      pengusul: isTier34 ? session?.nama : null,
      status: initialStatus,
      submittedByTier: session?.tier,
      createdBy: String(session?.id ?? "admin"),
    });

    return NextResponse.json({ success: true, id, status: initialStatus }, { status: 201 });
  } catch (err) {
    return handleApiError("api/admin/event POST", err, "Gagal menambahkan event");
  }
}
