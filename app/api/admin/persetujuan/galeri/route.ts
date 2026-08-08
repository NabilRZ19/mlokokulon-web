import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galeri as galeriTable } from "@/lib/db/schema";
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
      .from(galeriTable)
      .where(eq(galeriTable.status, "pending"));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        judul: r.judul,
        tipe: r.tipe,
        url_media: r.urlMedia,
        kategori: r.kategori,
        submitted_by_tier: r.submittedByTier,
        pengusul: r.pengusul,
        created_by: r.createdBy,
        status: r.status,
      }))
    );
  } catch (err) {
    return handleApiError("api/admin/persetujuan/galeri GET", err, "Gagal mengambil galeri pending");
  }
}
