import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// Sengaja TIDAK import "next/headers" di sini (lihat lib/session.ts untuk itu) — file ini juga
// dipakai scripts/create-admin.ts lewat tsx, di luar konteks Next.js.

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export interface SessionPayload {
  id: number;
  nama: string;
  tier: 1 | 2 | 3;
}

export const SESSION_COOKIE_NAME = "admin_session";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
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
