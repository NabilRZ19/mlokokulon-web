import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { strukturKelurahan } from "@/lib/db/schema";
import { getStrukturKelurahan } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { canManageStruktur, requireTier } from "@/lib/auth-policy";
import { isValidString, isValidUrl } from "@/lib/validate";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getStrukturKelurahan();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getSession();
  // Struktur kelurahan hanya bisa dikelola tier 1 (Super Admin) & tier 2 (Admin Kelurahan)
  const deny = requireTier(session, canManageStruktur, [1, 2]);
  if (deny) return deny;

  try {
    const body = await request.json();
    const { nama, jabatan, foto_url, urutan = 1 } = body;

    if (
      !isValidString(nama, 2, 255) ||
      !isValidString(jabatan, 2, 255) ||
      !isValidUrl(foto_url)
    ) {
      return NextResponse.json({ error: "Field nama, jabatan, dan foto_url wajib diisi dengan benar" }, { status: 400 });
    }

    const id = `struktur-${randomUUID().slice(0, 8)}`;

    await db.insert(strukturKelurahan).values({
      id,
      nama,
      jabatan,
      fotoUrl: foto_url,
      urutan: Number(urutan),
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/struktur] POST error:", err);
    return NextResponse.json({ error: "Gagal menambah jabatan struktur" }, { status: 500 });
  }
}
