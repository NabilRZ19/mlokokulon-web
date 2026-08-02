import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { layanan as layananTable } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await db.select().from(layananTable).orderBy(asc(layananTable.urutan));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[api/admin/layanan] GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data layanan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nama, kategori, deskripsi, persyaratan, prosedur, waktu_proses, biaya, kontak_penanggung_jawab, urutan } = body;

    if (!nama || !deskripsi) {
      return NextResponse.json({ error: "Nama dan deskripsi layanan wajib diisi" }, { status: 400 });
    }

    const id = `layanan-${Date.now()}`;

    await db.insert(layananTable).values({
      id,
      nama: nama.trim(),
      kategori: kategori?.trim() || "Administrasi",
      deskripsi: deskripsi.trim(),
      persyaratan: Array.isArray(persyaratan) ? persyaratan : [],
      prosedur: Array.isArray(prosedur) ? prosedur : [],
      waktuProses: waktu_proses?.trim() || "1 Hari Kerja",
      biaya: biaya?.trim() || "Gratis",
      kontakPenanggungJawab: kontak_penanggung_jawab?.trim() || null,
      urutan: Number(urutan) || 0,
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/admin/layanan] POST error:", err);
    return NextResponse.json({ error: "Gagal menambah layanan" }, { status: 500 });
  }
}
