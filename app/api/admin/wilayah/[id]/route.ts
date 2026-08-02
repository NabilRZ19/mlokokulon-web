import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rw as rwTable, rwPengurus } from "@/lib/db/schema";
import { getRwById } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { canManageWilayah, requireTier } from "@/lib/auth-policy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const rwData = await getRwById(id);
  if (!rwData) {
    return NextResponse.json({ error: "Data RW tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(rwData);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  // Kelola data wilayah RW: tier 1 (Super Admin, bisa edit semua RW) &
  // tier 3 (Admin RW, bisa edit RW-nya sendiri). Tier 2 tidak mengelola wilayah.
  const deny = requireTier(session, canManageWilayah, [1, 3]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID RW tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      nama_rw,
      cakupan_dusun,
      jumlah_rt,
      is_kampung_kb,
      deskripsi_singkat,
      potensi,
      statistik,
      struktur_pengurus = [],
    } = body;

    if (!nama_rw || !cakupan_dusun) {
      return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    await db
      .update(rwTable)
      .set({
        namaRw: nama_rw,
        cakupanDusun: cakupan_dusun,
        jumlahRt: Number(jumlah_rt ?? 0),
        isKampungKb: Boolean(is_kampung_kb),
        deskripsiSingkat: deskripsi_singkat ?? "",
        potensi: potensi ?? "",
        jumlahKk: Number(statistik?.jumlah_kk ?? 0),
        jumlahJiwa: Number(statistik?.jumlah_jiwa ?? 0),
      })
      .where(eq(rwTable.id, id));

    // Re-insert pengurus child table
    await db.delete(rwPengurus).where(eq(rwPengurus.rwId, id));
    if (Array.isArray(struktur_pengurus) && struktur_pengurus.length > 0) {
      await db.insert(rwPengurus).values(
        struktur_pengurus
          .filter((p: { nama: string }) => p.nama.trim().length > 0)
          .map((p: { nama: string; jabatan: string; kategori?: string; organisasi?: string; icon?: string }) => ({
            rwId: id,
            nama: p.nama.trim(),
            jabatan: p.jabatan?.trim() || "Pengurus",
            kategori: p.kategori || "rw",
            organisasi: p.organisasi?.trim() || null,
            icon: p.icon || "users",
          }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/wilayah/id] PUT error:", err);
    return NextResponse.json({ error: "Gagal memperbarui data RW" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageWilayah, [1, 3]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID RW tidak valid" }, { status: 400 });
  }

  try {
    // rwPengurus sudah cascade di schema — hapus eksplisit untuk konsistensi
    await db.delete(rwPengurus).where(eq(rwPengurus.rwId, id));
    // Hapus RW — berita.rw_id akan jadi NULL otomatis (ON DELETE SET NULL di schema)
    await db.delete(rwTable).where(eq(rwTable.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/wilayah/id] DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus RW" }, { status: 500 });
  }
}
