import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canManageUsers, requireTier } from "@/lib/auth-policy";

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
