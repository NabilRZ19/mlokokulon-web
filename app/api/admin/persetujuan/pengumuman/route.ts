import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pengumuman as pengumumanTable } from "@/lib/db/schema";
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
      .from(pengumumanTable)
      .where(eq(pengumumanTable.status, "pending"));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        judul: r.judul,
        slug: r.slug,
        target_pengumuman: r.targetPengumuman,
        isi: r.isi,
        tanggal: r.tanggal,
        gambar_cover_url: r.gambarCoverUrl,
        penulis: r.penulis,
        submitted_by_tier: r.submittedByTier,
        pengusul: r.pengusul,
        created_by: r.createdBy,
        status: r.status,
      }))
    );
  } catch (err) {
    return handleApiError("api/admin/persetujuan/pengumuman GET", err, "Gagal mengambil pengumuman pending");
  }
}
