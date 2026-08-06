import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageUsers, requireTier } from "@/lib/auth-policy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageUsers, [1]);
  if (deny) return deny;

  const { id } = await params;
  const targetId = Number(id);

  if (isNaN(targetId)) {
    return NextResponse.json({ error: "ID user tidak valid" }, { status: 400 });
  }

  try {
    const rows = await db
      .select({
        id: adminUsers.id,
        nama: adminUsers.nama,
        email: adminUsers.email,
        tier: adminUsers.tier,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, targetId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[api/admin/users/id] GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageUsers, [1]);
  if (deny) return deny;

  const { id } = await params;
  const targetId = Number(id);

  if (isNaN(targetId)) {
    return NextResponse.json({ error: "ID user tidak valid" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { nama, email, password, tier } = body;

    if (!nama || !email || !password || !tier) {
      return NextResponse.json({ error: "Field nama, email, password, dan tier wajib diisi" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter untuk keamanan admin" }, { status: 400 });
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return NextResponse.json({ error: "Password harus mengombinasikan huruf dan angka" }, { status: 400 });
    }

    const tierNum = Number(tier);
    if (![1, 2, 3].includes(tierNum)) {
      return NextResponse.json({ error: "Nilai tier tidak valid (harus 1, 2, atau 3)" }, { status: 400 });
    }

    // Password wajib diisi ulang setiap edit — keputusan user
    const passwordHash = await hashPassword(password);

    await db
      .update(adminUsers)
      .set({
        nama,
        email: email.toLowerCase().trim(),
        passwordHash,
        tier: tierNum,
      })
      .where(eq(adminUsers.id, targetId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/users/id] PUT error:", err);
    return NextResponse.json({ error: "Gagal memperbarui data admin. Email mungkin sudah terdaftar." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deny = requireTier(session, canManageUsers, [1]);
  if (deny) return deny;
  // TypeScript tidak bisa narrow null lewat helper function — session dijamin non-null di sini
  // karena requireTier sudah return 401 jika session === null.
  const authedSession = session!;

  const { id } = await params;
  const targetId = Number(id);

  if (isNaN(targetId)) {
    return NextResponse.json({ error: "ID user tidak valid" }, { status: 400 });
  }

  if (targetId === authedSession.id) {
    return NextResponse.json({ error: "Tidak dapat menghapus akun Anda sendiri" }, { status: 400 });
  }

  try {
    await db.delete(adminUsers).where(eq(adminUsers.id, targetId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/users/id] DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus user admin" }, { status: 500 });
  }
}
