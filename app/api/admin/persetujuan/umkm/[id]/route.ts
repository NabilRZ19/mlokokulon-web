import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  umkm as umkmTable,
  umkmFoto as umkmFotoTable,
  umkmProdukUnggulan as umkmProdukUnggulanTable,
} from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent, requireTier } from "@/lib/auth-policy";
import { handleApiError } from "@/lib/api-error";

/** GET: Ambil detail UMKM pending tertentu untuk preview */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID UMKM tidak valid" }, { status: 400 });

  try {
    const rows = await db.select().from(umkmTable).where(eq(umkmTable.id, id)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "UMKM tidak ditemukan" }, { status: 404 });
    const r = rows[0];

    const [produkRows, fotoRows] = await Promise.all([
      db.select().from(umkmProdukUnggulanTable).where(eq(umkmProdukUnggulanTable.umkmId, id)),
      db.select().from(umkmFotoTable).where(eq(umkmFotoTable.umkmId, id)),
    ]);

    return NextResponse.json({
      id: r.id,
      nama: r.nama,
      slug: r.slug,
      kategori: r.kategori,
      deskripsi: r.deskripsi,
      link_gmaps: r.linkGmaps,
      kontak: r.kontak,
      jam_operasional: r.jamOperasional,
      lokasi: r.lokasi,
      foto_utama_url: r.fotoUtamaUrl,
      foto_urls: fotoRows.map((f) => f.url),
      produk_unggulan: produkRows.map((p) => ({ produk: p.produk, foto_url: p.fotoUrl })),
      submitted_by_tier: r.submittedByTier,
      pengusul: r.pengusul,
      created_by: r.createdBy,
      status: r.status,
      reviewer_note: r.reviewerNote,
    });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/umkm/[id] GET", err, "Gagal mengambil detail UMKM");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canApproveContent, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID UMKM tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, note = "" } = body as { action: "approve" | "reject"; note?: string };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action harus 'approve' atau 'reject'" }, { status: 400 });
    }

    const rows = await db.select().from(umkmTable).where(eq(umkmTable.id, id)).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ error: "UMKM tidak ditemukan" }, { status: 404 });
    }
    if (rows[0].status !== "pending") {
      return NextResponse.json({ error: "UMKM ini tidak dalam status pending" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "published" : "rejected";

    await db
      .update(umkmTable)
      .set({ status: newStatus, reviewerNote: note.trim() || null })
      .where(eq(umkmTable.id, id));

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    return handleApiError("api/admin/persetujuan/umkm/[id] PATCH", err, "Gagal memperbarui status UMKM");
  }
}
