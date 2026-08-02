import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { layanan as layananTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const rows = await db.select().from(layananTable).where(eq(layananTable.id, id)).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(`[api/admin/layanan/${id}] GET error:`, err);
    return NextResponse.json({ error: "Gagal mengambil data layanan" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { nama, kategori, deskripsi, persyaratan, prosedur, waktu_proses, biaya, kontak_penanggung_jawab, urutan } = body;

    if (!nama || !deskripsi) {
      return NextResponse.json({ error: "Nama dan deskripsi layanan wajib diisi" }, { status: 400 });
    }

    await db
      .update(layananTable)
      .set({
        nama: nama.trim(),
        kategori: kategori?.trim() || "Administrasi",
        deskripsi: deskripsi.trim(),
        persyaratan: Array.isArray(persyaratan) ? persyaratan : [],
        prosedur: Array.isArray(prosedur) ? prosedur : [],
        waktuProses: waktu_proses?.trim() || "1 Hari Kerja",
        biaya: biaya?.trim() || "Gratis",
        kontakPenanggungJawab: kontak_penanggung_jawab?.trim() || null,
        urutan: Number(urutan) || 0,
      })
      .where(eq(layananTable.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[api/admin/layanan/${id}] PUT error:`, err);
    return NextResponse.json({ error: "Gagal memperbarui data layanan" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await db.delete(layananTable).where(eq(layananTable.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[api/admin/layanan/${id}] DELETE error:`, err);
    return NextResponse.json({ error: "Gagal menghapus layanan" }, { status: 500 });
  }
}
