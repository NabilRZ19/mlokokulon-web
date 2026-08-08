import { readFileSync } from "fs";
import { resolve } from "path";
import mysql from "mysql2/promise";

/**
 * Migrasi: Tambah kolom rw_id ke tabel admin_users.
 * Digunakan oleh Tier 3 (Admin RW) dan Tier 4 (Admin Kampung KB) untuk menandai RW yang dikelola.
 *
 * AMAN: ALTER TABLE ADD COLUMN bersifat aditif — tidak menghapus atau mengubah data admin yang ada.
 */
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
    // .env.local opsional
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "mlokokulon",
  });

  try {
    console.log("Connected to MySQL. Memulai migrasi kolom admin_users...\n");

    // Tambah rw_id ke admin_users (nullable — hanya diisi untuk Tier 3 dan Tier 4)
    const [rwIdCol]: any = await conn.query(
      "SHOW COLUMNS FROM `admin_users` LIKE 'rw_id'"
    );
    if (rwIdCol.length === 0) {
      await conn.query(
        `ALTER TABLE \`admin_users\`
          ADD COLUMN \`rw_id\` VARCHAR(64) NULL AFTER \`tier\``
      );
      console.log("✓ Kolom `rw_id` ditambahkan ke tabel `admin_users`.");
    } else {
      console.log("✓ Kolom `rw_id` sudah ada di tabel `admin_users`.");
    }

    await conn.end();
    console.log("\nMigrasi admin_users selesai! Data admin lama tetap aman (rw_id = NULL untuk Tier 1 & 2).");
  } catch (err) {
    console.error("Error executing migration:", err);
    await conn.end();
    process.exit(1);
  }
}

main();
