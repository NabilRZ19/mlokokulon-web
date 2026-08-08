import { readFileSync } from "fs";
import { resolve } from "path";
import mysql from "mysql2/promise";

/**
 * Migrasi: Tambah kolom status, reviewer_note, submitted_by_tier, dan pengusul
 * pada tabel berita, galeri, dan umkm.
 *
 * AMAN: ALTER TABLE ADD COLUMN bersifat aditif — tidak menghapus atau mengubah
 * data yang sudah ada. Default 'published' menjaga semua data lama tetap tampil di publik.
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
    // .env.local opsional jika env var sudah terpasang di OS
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "mlokokulon",
  });

  try {
    console.log("Connected to MySQL. Memulai migrasi kolom status konten...\n");

    // ── Tabel BERITA ─────────────────────────────────────────────────────────
    const [beritaStatus]: any = await conn.query(
      "SHOW COLUMNS FROM `berita` LIKE 'status'"
    );
    if (beritaStatus.length === 0) {
      await conn.query(
        `ALTER TABLE \`berita\`
          ADD COLUMN \`status\` ENUM('draft','pending','published','rejected') NOT NULL DEFAULT 'published' AFTER \`created_by\`,
          ADD COLUMN \`reviewer_note\` TEXT NULL AFTER \`status\`,
          ADD COLUMN \`submitted_by_tier\` TINYINT NULL AFTER \`reviewer_note\`,
          ADD COLUMN \`pengusul\` VARCHAR(255) NULL AFTER \`submitted_by_tier\``
      );
      console.log("✓ Kolom status, reviewer_note, submitted_by_tier, pengusul ditambahkan ke tabel `berita`.");
    } else {
      console.log("✓ Kolom `status` sudah ada di tabel `berita`.");
    }

    // ── Tabel GALERI ─────────────────────────────────────────────────────────
    const [galeriStatus]: any = await conn.query(
      "SHOW COLUMNS FROM `galeri` LIKE 'status'"
    );
    if (galeriStatus.length === 0) {
      await conn.query(
        `ALTER TABLE \`galeri\`
          ADD COLUMN \`status\` ENUM('draft','pending','published','rejected') NOT NULL DEFAULT 'published' AFTER \`sumber_berita_id\`,
          ADD COLUMN \`created_by\` VARCHAR(64) NULL AFTER \`status\`,
          ADD COLUMN \`reviewer_note\` TEXT NULL AFTER \`created_by\`,
          ADD COLUMN \`submitted_by_tier\` TINYINT NULL AFTER \`reviewer_note\`,
          ADD COLUMN \`pengusul\` VARCHAR(255) NULL AFTER \`submitted_by_tier\``
      );
      console.log("✓ Kolom status, created_by, reviewer_note, submitted_by_tier, pengusul ditambahkan ke tabel `galeri`.");
    } else {
      console.log("✓ Kolom `status` sudah ada di tabel `galeri`.");
    }

    // ── Tabel UMKM ───────────────────────────────────────────────────────────
    const [umkmStatus]: any = await conn.query(
      "SHOW COLUMNS FROM `umkm` LIKE 'status'"
    );
    if (umkmStatus.length === 0) {
      await conn.query(
        `ALTER TABLE \`umkm\`
          ADD COLUMN \`status\` ENUM('draft','pending','published','rejected') NOT NULL DEFAULT 'published' AFTER \`foto_utama_url\`,
          ADD COLUMN \`created_by\` VARCHAR(64) NULL AFTER \`status\`,
          ADD COLUMN \`reviewer_note\` TEXT NULL AFTER \`created_by\`,
          ADD COLUMN \`submitted_by_tier\` TINYINT NULL AFTER \`reviewer_note\`,
          ADD COLUMN \`pengusul\` VARCHAR(255) NULL AFTER \`submitted_by_tier\``
      );
      console.log("✓ Kolom status, created_by, reviewer_note, submitted_by_tier, pengusul ditambahkan ke tabel `umkm`.");
    } else {
      console.log("✓ Kolom `status` sudah ada di tabel `umkm`.");
    }

    await conn.end();
    console.log("\nMigrasi kolom status selesai! Semua data lama tetap aman dengan status 'published'.");
  } catch (err) {
    console.error("Error executing migration:", err);
    await conn.end();
    process.exit(1);
  }
}

main();
