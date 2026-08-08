import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pengumuman as pengumumanTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

function cleanDate(val: any): string {
  if (!val) return new Date().toISOString().split("T")[0];
  if (typeof val === "string") return val.split("T")[0];
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return String(val);
}

export async function GET() {
  const session = await getSession();
  const deny = requireTier(session, canManageContent, [1, 2, 3, 4]);
  if (deny) return deny;

  try {
    const rows = await db
      .select()
      .from(pengumumanTable)
      .orderBy(desc(pengumumanTable.tanggal));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        judul: r.judul,
        slug: r.slug,
        target_pengumuman: r.targetPengumuman,
        isi: r.isi,
        tanggal: r.tanggal instanceof Date ? r.tanggal.toISOString().split("T")[0] : String(r.tanggal),
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
    return handleApiError("api/admin/pengumuman GET", err, "Gagal mengambil daftar pengumuman");
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  const deny = requireTier(session, canManageContent, [1, 2, 3, 4]);
  if (deny) return deny;

  try {
    const body = await request.json();
    const { judul, slug, target_pengumuman, isi, tanggal, gambar_cover_url, penulis } = body;

    if (!judul || !slug || !isi || !tanggal) {
      return NextResponse.json({ error: "Judul, slug, isi, dan tanggal wajib diisi" }, { status: 400 });
    }

    const isTier34 = session?.tier === 3 || session?.tier === 4;
    const initialStatus = isTier34 ? "pending" : "published";

    const id = `pengumuman-${Date.now()}`;
    const cleanTanggal = cleanDate(tanggal);

    await db.insert(pengumumanTable).values({
      id,
      judul,
      slug,
      targetPengumuman: target_pengumuman || "Seluruh Warga Kelurahan",
      isi,
      tanggal: cleanTanggal as any,
      gambarCoverUrl: gambar_cover_url || null,
      penulis: penulis || session?.nama || "Admin",
      pengusul: isTier34 ? session?.nama : null,
      status: initialStatus,
      submittedByTier: session?.tier ?? 1,
      createdBy: String(session?.id ?? "admin"),
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/pengumuman");

    return NextResponse.json({ success: true, id, status: initialStatus }, { status: 201 });
  } catch (err) {
    return handleApiError("api/admin/pengumuman POST", err, "Gagal menambahkan pengumuman");
  }
}
