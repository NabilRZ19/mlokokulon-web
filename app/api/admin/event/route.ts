import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { event as eventTable } from "@/lib/db/schema";
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
      .from(eventTable)
      .orderBy(asc(eventTable.tanggalMulai));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        judul: r.judul,
        slug: r.slug,
        deskripsi: r.deskripsi,
        tanggal_mulai: r.tanggalMulai instanceof Date ? r.tanggalMulai.toISOString().split("T")[0] : String(r.tanggalMulai),
        tanggal_selesai: r.tanggalSelesai ? (r.tanggalSelesai instanceof Date ? r.tanggalSelesai.toISOString().split("T")[0] : String(r.tanggalSelesai)) : null,
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

    const cleanMulai = cleanDate(tanggal_mulai);
    const cleanSelesai = tanggal_selesai ? cleanDate(tanggal_selesai) : null;

    await db.insert(eventTable).values({
      id,
      judul,
      slug,
      deskripsi,
      tanggalMulai: cleanMulai as any,
      tanggalSelesai: cleanSelesai as any,
      jamMulai: jam_mulai || "08:00 WIB",
      lokasi,
      gambarCoverUrl: gambar_cover_url || null,
      penulis: penulis || session?.nama || "Admin",
      pengusul: isTier34 ? session?.nama : null,
      status: initialStatus,
      submittedByTier: session?.tier ?? 1,
      createdBy: String(session?.id ?? "admin"),
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/event");

    return NextResponse.json({ success: true, id, status: initialStatus }, { status: 201 });
  } catch (err) {
    return handleApiError("api/admin/event POST", err, "Gagal menambahkan event");
  }
}
