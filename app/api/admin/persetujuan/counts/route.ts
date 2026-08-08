import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  berita as beritaTable,
  event as eventTable,
  galeri as galeriTable,
  pengumuman as pengumumanTable,
  rwKetuaPengajuan,
  umkm as umkmTable,
} from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { canApproveContent } from "@/lib/auth-policy";

export async function GET() {
  const session = await getSession();
  if (!session || !canApproveContent(session.tier)) {
    return NextResponse.json({ pengumuman: 0, berita: 0, event: 0, galeri: 0, umkm: 0, wilayah: 0 });
  }

  try {
    const [pengumumanRes, beritaRes, eventRes, galeriRes, umkmRes, wilayahRes] = await Promise.all([
      db.select({ value: count() }).from(pengumumanTable).where(eq(pengumumanTable.status, "pending")),
      db.select({ value: count() }).from(beritaTable).where(eq(beritaTable.status, "pending")),
      db.select({ value: count() }).from(eventTable).where(eq(eventTable.status, "pending")),
      db.select({ value: count() }).from(galeriTable).where(eq(galeriTable.status, "pending")),
      db.select({ value: count() }).from(umkmTable).where(eq(umkmTable.status, "pending")),
      db.select({ value: count() }).from(rwKetuaPengajuan).where(eq(rwKetuaPengajuan.status, "pending")),
    ]);

    return NextResponse.json(
      {
        pengumuman: pengumumanRes[0]?.value ?? 0,
        berita: beritaRes[0]?.value ?? 0,
        event: eventRes[0]?.value ?? 0,
        galeri: galeriRes[0]?.value ?? 0,
        umkm: umkmRes[0]?.value ?? 0,
        wilayah: wilayahRes[0]?.value ?? 0,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (err) {
    console.error("[api/admin/persetujuan/counts] Error:", err);
    return NextResponse.json({ pengumuman: 0, berita: 0, event: 0, galeri: 0, umkm: 0, wilayah: 0 });
  }
}
