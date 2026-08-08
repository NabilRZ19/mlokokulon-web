import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { umkm as umkmTable } from "@/lib/db/schema";
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
      .from(umkmTable)
      .where(eq(umkmTable.status, "pending"));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        nama: r.nama,
        slug: r.slug,
        kategori: r.kategori,
        kontak: r.kontak,
        foto_utama_url: r.fotoUtamaUrl,
        submitted_by_tier: r.submittedByTier,
        pengusul: r.pengusul,
        created_by: r.createdBy,
        status: r.status,
      }))
    );
  } catch (err) {
    return handleApiError("api/admin/persetujuan/umkm GET", err, "Gagal mengambil UMKM pending");
  }
}
