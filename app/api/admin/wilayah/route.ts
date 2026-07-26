import { NextResponse } from "next/server";
import { getRwList } from "@/lib/queries";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getRwList();
  return NextResponse.json(items);
}
