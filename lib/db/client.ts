// Sengaja TIDAK import "server-only" di sini (beda dari lib/queries.ts) — file ini juga dipakai
// scripts/seed.ts & scripts/create-admin.ts lewat tsx, di luar konteks Next.js React Server
// Component, dan "server-only" selalu throw kalau di-import di luar compiler Next.js.
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Config object (host/port/user/password terpisah), BUKAN connection-string URL — karakter "%"
// di DB_PASSWORD tidak perlu di-escape manual kayak kalau dipaksa jadi format mysql://...
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export const db = drizzle(pool, { schema, mode: "default" });
