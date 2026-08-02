import { readFileSync } from "fs";
import { resolve } from "path";
import mysql from "mysql2/promise";

async function main() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      if (!line.includes("=") || line.startsWith("#")) continue;
      const idx = line.indexOf("=");
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (err) {}

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "mlokokulon",
  });

  try {
    await conn.query("ALTER TABLE `rw_pengurus` ADD COLUMN `kategori` VARCHAR(64) NOT NULL DEFAULT 'rw';");
    console.log("Column kategori added.");
  } catch (e: any) {}

  try {
    await conn.query("ALTER TABLE `rw_pengurus` ADD COLUMN `organisasi` VARCHAR(255) NULL;");
    console.log("Column organisasi added.");
  } catch (e: any) {}

  try {
    await conn.query("ALTER TABLE `rw_pengurus` ADD COLUMN `icon` VARCHAR(64) NULL DEFAULT 'users';");
    console.log("Column icon added.");
  } catch (e: any) {}

  await conn.end();
  console.log("rw_pengurus table migration complete!");
}

main();
