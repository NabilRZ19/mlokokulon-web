import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageUsers, requireTier } from "@/lib/auth-policy";

export async function GET() {
  const session = await getSession();
  const deny = requireTier(session, canManageUsers, [1]);
  if (deny) return deny;

  try {
    const users = await db
      .select({
        id: adminUsers.id,
        nama: adminUsers.nama,
        email: adminUsers.email,
        tier: adminUsers.tier,
      })
      .from(adminUsers)
      .orderBy(asc(adminUsers.id));

    return NextResponse.json(users);
  } catch (err) {
    console.error("[api/admin/users] GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil daftar admin" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  const deny = requireTier(session, canManageUsers, [1]);
  if (deny) return deny;

  try {
    const body = await request.json();
    const { nama, email, password, tier } = body;

    if (!nama || !email || !password || !tier) {
      return NextResponse.json({ error: "Field nama, email, password, dan tier wajib diisi" }, { status: 400 });
    }

    if (password.length < 12) {
      return NextResponse.json({ error: "Password minimal 12 karakter untuk keamanan admin" }, { status: 400 });
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return NextResponse.json({ error: "Password harus mengombinasikan huruf dan angka" }, { status: 400 });
    }

    // Validasi nilai tier — hanya 1, 2, atau 3 yang valid
    const tierNum = Number(tier);
    if (![1, 2, 3].includes(tierNum)) {
      return NextResponse.json({ error: "Nilai tier tidak valid (harus 1, 2, atau 3)" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    await db.insert(adminUsers).values({
      nama,
      email: email.toLowerCase().trim(),
      passwordHash,
      tier: tierNum,
      createdBy: session!.id,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/users] POST error:", err);
    return NextResponse.json({ error: "Gagal menambah admin baru. Email mungkin sudah terdaftar." }, { status: 500 });
  }
}
