import { readFileSync } from "fs";
import { resolve } from "path";
import mysql from "mysql2/promise";

/**
 * Migrasi: Tambah kolom ketua_nama dan ketua_foto_url ke tabel rw,
 * dan buat tabel rw_ketua_pengajuan untuk persetujuan perubahan Ketua RW.
 *
 * AMAN: ALTER TABLE ADD COLUMN bersifat aditif. CREATE TABLE IF NOT EXISTS aman diulang.
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
    console.log("Connected to MySQL. Memulai migrasi RW ketua pengajuan...\n");

    // Tambah ketua_nama ke tabel rw
    const [ketuaNamaCol]: any = await conn.query(
      "SHOW COLUMNS FROM `rw` LIKE 'ketua_nama'"
    );
    if (ketuaNamaCol.length === 0) {
      await conn.query(
        `ALTER TABLE \`rw\`
          ADD COLUMN \`ketua_nama\` VARCHAR(255) NULL AFTER \`is_kampung_kb\`,
          ADD COLUMN \`ketua_foto_url\` VARCHAR(512) NULL AFTER \`ketua_nama\``
      );
      console.log("✓ Kolom `ketua_nama` dan `ketua_foto_url` ditambahkan ke tabel `rw`.");
    } else {
      console.log("✓ Kolom `ketua_nama` sudah ada di tabel `rw`.");
    }

    // Buat tabel rw_ketua_pengajuan
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`rw_ketua_pengajuan\` (
        \`id\` INT PRIMARY KEY AUTO_INCREMENT,
        \`rw_id\` VARCHAR(64) NOT NULL,
        \`diajukan_oleh_id\` INT NOT NULL,
        \`diajukan_oleh_nama\` VARCHAR(255) NOT NULL,
        \`pengusul\` VARCHAR(255) NOT NULL,
        \`ketua_nama_baru\` VARCHAR(255) NOT NULL,
        \`ketua_foto_url_baru\` VARCHAR(512) NULL,
        \`status\` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        \`reviewer_note\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`reviewed_at\` TIMESTAMP NULL,
        FOREIGN KEY (\`rw_id\`) REFERENCES \`rw\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("✓ Tabel `rw_ketua_pengajuan` siap (CREATE TABLE IF NOT EXISTS).");

    await conn.end();
    console.log("\nMigrasi RW ketua pengajuan selesai! Data RW lama tetap aman.");
  } catch (err) {
    console.error("Error executing migration:", err);
    await conn.end();
    process.exit(1);
  }
}

main();
