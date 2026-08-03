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
    console.log("Connected to MySQL. Adding `lokasi` column to `umkm` table if not exists...");
    const [columns]: any = await conn.query("SHOW COLUMNS FROM `umkm` LIKE 'lokasi'");
    if (columns.length === 0) {
      await conn.query("ALTER TABLE `umkm` ADD COLUMN `lokasi` VARCHAR(255) NULL AFTER `jam_operasional`");
      console.log("Added `lokasi` column to `umkm` table.");
    } else {
      console.log("`lokasi` column already exists.");
    }
    await conn.end();
    console.log("All done!");
  } catch (err) {
    console.error("Error executing migration:", err);
    await conn.end();
    process.exit(1);
  }
}

main();
