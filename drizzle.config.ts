import { readFileSync } from "fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit tidak otomatis load .env.local seperti Next.js — load manual (pola sama scripts/seed.ts)
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  if (!line.includes("=") || line.startsWith("#")) continue;
  const idx = line.indexOf("=");
  const key = line.slice(0, idx);
  const value = line.slice(idx + 1).replace(/^"|"$/g, "");
  if (!(key in process.env)) process.env[key] = value;
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
  },
});
