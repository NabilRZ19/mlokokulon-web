import { readFileSync } from "fs";
import { resolve } from "path";
import mysql from "mysql2/promise";
import { layananData } from "../lib/seed-data";

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

  console.log("Creating layanan table in MySQL...");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`layanan\` (
      \`id\` VARCHAR(64) PRIMARY KEY,
      \`nama\` VARCHAR(255) NOT NULL,
      \`kategori\` VARCHAR(100) NOT NULL DEFAULT 'Administrasi',
      \`deskripsi\` TEXT NOT NULL,
      \`persyaratan\` JSON NOT NULL,
      \`prosedur\` JSON NOT NULL,
      \`waktu_proses\` VARCHAR(128) NOT NULL DEFAULT '1 Hari Kerja',
      \`biaya\` VARCHAR(128) NOT NULL DEFAULT 'Gratis',
      \`kontak_penanggung_jawab\` VARCHAR(255) NULL,
      \`urutan\` INT NOT NULL DEFAULT 0,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log("layanan table created.");

  const [rows]: any = await conn.query("SELECT COUNT(*) as count FROM `layanan`");
  if (rows[0].count === 0) {
    console.log("Seeding default layanan items...");
    for (let i = 0; i < layananData.length; i++) {
      const item = layananData[i];
      await conn.query(
        `INSERT INTO \`layanan\` (id, nama, kategori, deskripsi, persyaratan, prosedur, waktu_proses, biaya, kontak_penanggung_jawab, urutan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.nama,
          "Administrasi Kependudukan",
          item.deskripsi,
          JSON.stringify(item.syarat),
          JSON.stringify(["Mengisi formulir di Kelurahan", "Verifikasi berkas oleh petugas", "Penerbitan dokumen di Disdukcapil"]),
          "1 Hari Kerja",
          "Gratis (Rp 0)",
          item.kontakJabatan || "Kantor Kelurahan",
          i + 1,
        ]
      );
    }
    console.log("Seeding complete!");
  }

  await conn.end();
  console.log("All done for layanan table!");
}

main();
