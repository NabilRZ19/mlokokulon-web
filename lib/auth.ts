import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// Sengaja TIDAK import "next/headers" di sini (lihat lib/session.ts untuk itu) — file ini juga
// dipakai scripts/create-admin.ts lewat tsx, di luar konteks Next.js.

const rawSecret = process.env.AUTH_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET wajib diisi dan memiliki panjang minimal 32 karakter pada environment production.");
  }
}

const secret = new TextEncoder().encode(rawSecret || "fallback-secret-for-development-only-must-change");

export interface SessionPayload {
  id: number;
  nama: string;
  tier: 1 | 2 | 3 | 4;
  rw_id?: string; // diisi untuk Tier 3 & Tier 4
}

export const SESSION_COOKIE_NAME = "admin_session";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return compare(password, hashed);
}

// Pengganti custom claim `tier` Firebase — tier disimpan di payload JWT.
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
