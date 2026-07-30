/**
 * scripts/migrate-berita-rw-fk.ts
 *
 * Script SEKALI-PAKAI — jalankan manual ke VPS production setelah konfirmasi.
 * JANGAN jalankan drizzle-kit push untuk ini (bahaya TRUNCATE tabel berita).
 *
 * Apa yang dilakukan:
 *   1. Cek nama constraint FK berita.rw_id dari information_schema
 *   2. DROP constraint lama (yang tidak pakai ON DELETE SET NULL)
 *   3. ADD constraint baru dengan ON DELETE SET NULL
 *
 * Cara jalankan:
 *   npx tsx scripts/migrate-berita-rw-fk.ts
 */

import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

async function main() {
  console.log("=== Migrasi FK berita.rw_id → ON DELETE SET NULL ===\n");

  // 1. Cek nama constraint aktual dari information_schema
  const constraints = await db.execute(sql`
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE
      TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'berita'
      AND COLUMN_NAME = 'rw_id'
      AND REFERENCED_TABLE_NAME = 'rw'
  `);

  const rows = (constraints[0] as unknown) as { CONSTRAINT_NAME: string }[];

  if (rows.length === 0) {
    console.log("✗ Tidak ditemukan FK berita.rw_id → rw.id di database.");
    console.log("  Kemungkinan FK belum ada, atau sudah di-drop sebelumnya.");
    process.exit(1);
  }

  const constraintName = rows[0].CONSTRAINT_NAME;
  console.log(`✓ Ditemukan FK: ${constraintName}`);

  // 2. DROP constraint lama
  console.log(`\nDROP FOREIGN KEY ${constraintName}...`);
  await db.execute(sql.raw(`ALTER TABLE berita DROP FOREIGN KEY \`${constraintName}\``));
  console.log("✓ FK lama berhasil di-drop.");

  // 3. ADD constraint baru dengan ON DELETE SET NULL
  console.log("\nADD CONSTRAINT baru dengan ON DELETE SET NULL...");
  await db.execute(sql`
    ALTER TABLE berita
    ADD CONSTRAINT berita_rw_id_fk
    FOREIGN KEY (rw_id) REFERENCES rw(id) ON DELETE SET NULL
  `);
  console.log("✓ FK baru berhasil ditambahkan.\n");

  console.log("=== Migrasi selesai! ===");
  console.log("Sekarang DELETE RW tidak akan gagal meski ada berita yang punya rw_id ke RW tersebut.");
  console.log("Berita terkait akan otomatis punya rw_id = NULL setelah RW-nya dihapus.");

  process.exit(0);
}

main().catch((err) => {
  console.error("Migrasi gagal:", err);
  process.exit(1);
});
