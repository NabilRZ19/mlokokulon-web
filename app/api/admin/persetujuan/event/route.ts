import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { event as eventTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  try {
    const rows = await db
      .select()
      .from(eventTable)
      .where(eq(eventTable.status, "pending"));

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
        submitted_by_tier: r.submittedByTier,
        pengusul: r.pengusul,
        created_by: r.createdBy,
        status: r.status,
      }))
    );
  } catch (err) {
    return handleApiError("api/admin/persetujuan/event GET", err, "Gagal mengambil event pending");
  }
}
