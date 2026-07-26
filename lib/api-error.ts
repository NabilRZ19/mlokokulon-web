import { NextResponse } from "next/server";

/**
 * Log error terstruktur di server dan kembalikan response JSON yang aman untuk client.
 * Memastikan detail exception internal DB/system tidak bocor ke client di production.
 */
export function handleApiError(context: string, err: unknown, defaultMessage = "Terjadi kesalahan pada server"): NextResponse {
  console.error(`[${context}] Error:`, err);

  const message = process.env.NODE_ENV === "development" && err instanceof Error
    ? `${defaultMessage}: ${err.message}`
    : defaultMessage;

  return NextResponse.json({ error: message }, { status: 500 });
}
