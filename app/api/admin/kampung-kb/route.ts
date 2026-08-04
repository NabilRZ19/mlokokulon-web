import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getKampungKbStore, saveKampungKbStore } from "@/lib/kampung-kb-store";
import { handleApiError } from "@/lib/api-error";
import type { KampungKb } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = getKampungKbStore();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: KampungKb = await request.json();
    if (!body.nama_program || !body.ketua || !body.deskripsi_program) {
      return NextResponse.json({ error: "Field Nama Program, Ketua, dan Deskripsi wajib diisi." }, { status: 400 });
    }

    saveKampungKbStore(body);
    return NextResponse.json({ success: true, data: body });
  } catch (err) {
    return handleApiError("admin/kampung-kb", err, "Gagal memperbarui pengaturan Kampung KB");
  }
}
