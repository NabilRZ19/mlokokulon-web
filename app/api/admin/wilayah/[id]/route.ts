import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { rw as rwTable, rwKetuaPengajuan, rwPengurus } from "@/lib/db/schema";
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
  // Hanya Tier 1 yang boleh direct PUT — Tier 3/4 harus lewat jalur pengajuan
  const deny = requireTier(session, canManageWilayah, [1]);
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
      ketua_nama,
      ketua_foto_url,
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
        ...(ketua_nama !== undefined ? { ketuaNama: ketua_nama || null } : {}),
        ...(ketua_foto_url !== undefined ? { ketuaFotoUrl: ketua_foto_url || null } : {}),
      })
      .where(eq(rwTable.id, id));

    // Re-insert pengurus child table
    await db.delete(rwPengurus).where(eq(rwPengurus.rwId, id));
    if (Array.isArray(struktur_pengurus) && struktur_pengurus.length > 0) {
      const validPengurus = struktur_pengurus.filter(
        (p: { nama: string }) => p.nama.trim().length > 0
      );
      if (validPengurus.length > 0) {
        await db.insert(rwPengurus).values(
          validPengurus.map(
            (p: { nama: string; jabatan: string; kategori?: string; organisasi?: string; icon?: string }) => ({
              rwId: id,
              nama: p.nama.trim(),
              jabatan: p.jabatan?.trim() || "Pengurus",
              kategori: p.kategori || "rw",
              organisasi: p.organisasi?.trim() || null,
              icon: p.icon || "users",
            })
          )
        );
      }
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
  // Hanya Tier 1 yang boleh menghapus RW
  const deny = requireTier(session, canManageWilayah, [1]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID RW tidak valid" }, { status: 400 });
  }

  try {
    // Hapus pengajuan yang masih pending dulu
    await db
      .delete(rwKetuaPengajuan)
      .where(eq(rwKetuaPengajuan.rwId, id));
    // Hapus pengurus (cascade sudah ada tapi eksplisit untuk kejelasan)
    await db.delete(rwPengurus).where(eq(rwPengurus.rwId, id));
    // Hapus RW
    await db.delete(rwTable).where(eq(rwTable.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/wilayah/id] DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus RW" }, { status: 500 });
  }
}
