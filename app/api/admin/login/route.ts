import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  // Identifier: kombinasi IP + X-Forwarded-For untuk menangani reverse proxy (Vercel).
  // Jika tidak ada IP, fallback ke "unknown" — tetap rate-limited per "bucket" yang sama.
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const rl = checkRateLimit(`login:${ip}`, { limit: 5, windowSeconds: 900 });

  if (rl.limited) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.resetAt),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rl.resetAt),
        },
      },
    );
  }

  // ── Parsing & validasi input ──────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body tidak valid" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body tidak valid" }, { status: 400 });
  }

  const { email: rawEmail, password } = body as Record<string, unknown>;

  if (typeof rawEmail !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email & password wajib diisi" }, { status: 400 });
  }

  // Normalize email sebelum query — cegah bypass dengan case variation / whitespace
  const email = rawEmail.toLowerCase().trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email & password wajib diisi" }, { status: 400 });
  }

  // Validasi format email sederhana
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
  }

  // ── Auth check ────────────────────────────────────────────────────────────
  let user;
  try {
    const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    user = rows[0];
  } catch (err) {
    console.error("[login] Database query error:", err);
    return NextResponse.json(
      { error: "Gagal terhubung ke server database. Mohon periksa koneksi DB VPS." },
      { status: 500 }
    );
  }

  // Pesan error sengaja sama untuk email tidak ditemukan dan password salah
  // (menghindari user enumeration attack)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  // ── Buat session JWT ──────────────────────────────────────────────────────
  const token = await createSessionToken({
    id: user.id,
    nama: user.nama,
    tier: user.tier as 1 | 2 | 3 | 4,
    rw_id: user.rwId ?? undefined,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    // "strict" (bukan "lax") — admin panel tidak perlu link dari situs eksternal,
    // dan ini memblokir CSRF lintas-site dengan lebih baik
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Reset": String(rl.resetAt),
      },
    },
  );
}
