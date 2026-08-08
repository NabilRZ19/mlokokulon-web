import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * GET /api/admin/session — kembalikan info session yang sedang aktif (tier, nama, id).
 * Digunakan oleh komponen client-side yang butuh mengetahui tier user.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: session.id,
    nama: session.nama,
    tier: session.tier,
    rw_id: session.rw_id ?? null,
  });
}
