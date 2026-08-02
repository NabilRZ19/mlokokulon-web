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
  } catch (err) {
    console.log("No .env.local found, using process.env");
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "mlokokulon",
  });

  try {
    console.log("Adding deskripsi_singkat column to rw table if missing...");
    await conn.query("ALTER TABLE `rw` ADD COLUMN `deskripsi_singkat` TEXT NULL;");
    console.log("Column deskripsi_singkat added successfully!");
  } catch (err: any) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Column deskripsi_singkat already exists.");
    } else {
      console.error("Migration warning:", err.message);
    }
  } finally {
    await conn.end();
  }
}

main();
