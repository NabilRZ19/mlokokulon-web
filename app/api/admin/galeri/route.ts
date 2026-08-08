import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { galeri as galeriTable } from "@/lib/db/schema";
import { getGaleriList } from "@/lib/queries";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { isValidEnum, isValidString, isValidUrl } from "@/lib/validate";
import { needsApproval } from "@/lib/auth-policy";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getGaleriList(false);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { judul, tipe, url_media, kategori, pengusul = "" } = body;

    if (
      !isValidString(judul, 3, 255) ||
      !isValidEnum(tipe, ["foto", "video"] as const) ||
      !isValidUrl(url_media)
    ) {
      return NextResponse.json({ error: "Input tidak valid (judul, tipe foto/video, dan URL media wajib diisi)" }, { status: 400 });
    }

    const id = `galeri-${randomUUID().slice(0, 8)}`;
    const status = needsApproval(session.tier) ? "pending" : "published";

    await db.insert(galeriTable).values({
      id,
      judul,
      tipe,
      urlMedia: url_media,
      kategori: kategori || null,
      status,
      createdBy: String(session.id),
      submittedByTier: session.tier,
      pengusul: typeof pengusul === "string" && pengusul.trim() ? pengusul.trim() : null,
    });

    revalidatePath("/");
    revalidatePath("/galeri");

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/galeri] POST error:", err);
    return NextResponse.json({ error: "Gagal menambah data galeri" }, { status: 500 });
  }
}
