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
  } catch {
    // .env.local file opsional jika env var sudah terpasang di OS
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "mlokokulon",
  });

  try {
    console.log("Connected to MySQL. Checking `video_title` column in `berita` table...");
    const [columns]: any = await conn.query("SHOW COLUMNS FROM `berita` LIKE 'video_title'");

    if (columns.length === 0) {
      // PERHATIAN: ALTER TABLE ADD COLUMN sifatnya aditif & safe (NULLable),
      // tidak menghapus atau mengubah data berita yang sudah ada sama sekali.
      await conn.query("ALTER TABLE `berita` ADD COLUMN `video_title` VARCHAR(255) NULL AFTER `video_url`");
      console.log("✓ Berhasil menambahkan kolom `video_title` ke tabel `berita` (Data lama tetap aman & utuh).");
    } else {
      console.log("✓ Kolom `video_title` sudah ada di tabel `berita`.");
    }

    await conn.end();
    console.log("Migrasi selesai!");
  } catch (err) {
    console.error("Error executing migration:", err);
    await conn.end();
    process.exit(1);
  }
}

main();
