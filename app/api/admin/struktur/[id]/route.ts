import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { strukturKelurahan } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageStruktur, requireTier } from "@/lib/auth-policy";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageStruktur, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { nama, jabatan, foto_url, urutan } = body;

    if (!nama || !jabatan || !foto_url) {
      return NextResponse.json({ error: "Field nama, jabatan, dan foto_url wajib diisi" }, { status: 400 });
    }

    await db
      .update(strukturKelurahan)
      .set({
        nama,
        jabatan,
        fotoUrl: foto_url,
        urutan: Number(urutan),
      })
      .where(eq(strukturKelurahan.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/struktur/id] PUT error:", err);
    return NextResponse.json({ error: "Gagal mengedit jabatan struktur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageStruktur, [1, 2]);
  if (deny) return deny;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    await db.delete(strukturKelurahan).where(eq(strukturKelurahan.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/struktur/id] DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus jabatan struktur" }, { status: 500 });
  }
}
