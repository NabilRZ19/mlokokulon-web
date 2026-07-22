// Sengaja TIDAK import "server-only" di sini (beda dari lib/queries.ts) — file ini juga dipakai
// scripts/seed.ts & scripts/create-admin.ts lewat tsx, di luar konteks Next.js React Server
// Component, dan "server-only" selalu throw kalau di-import di luar compiler Next.js.
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Pattern Global Singleton untuk Next.js (terutama saat Development / Hot Reload):
// Mencegah Next.js membuat pool MySQL baru di setiap re-evaluate module/reload,
// yang dapat menyebabkan error "Too many connections" pada server MySQL VPS.
const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 30000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
