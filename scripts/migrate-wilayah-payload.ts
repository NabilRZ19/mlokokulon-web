/**
 * Migration: Tambah kolom `payload_json` ke tabel `rw_ketua_pengajuan`
 *
 * Jalankan: npx tsx scripts/migrate-wilayah-payload.ts
 *
 * Script ini HANYA menambah kolom baru — tidak mengubah, menghapus, atau
 * menyentuh data yang sudah ada sama sekali.
 */

import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

async function main() {
  console.log("[migrate] Menambah kolom payload_json ke rw_ketua_pengajuan...");

  try {
    // Cek apakah kolom sudah ada
    const checkResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS
      WHERE TABLE_NAME = 'rw_ketua_pengajuan'
        AND COLUMN_NAME = 'payload_json'
    `);

    const count = (checkResult[0] as unknown as { count: number }).count;
    if (Number(count) > 0) {
      console.log("[migrate] Kolom payload_json sudah ada — lewati.");
      process.exit(0);
    }

    // Tambah kolom setelah kolom ketua_foto_url_baru
    await db.execute(sql`
      ALTER TABLE rw_ketua_pengajuan
      ADD COLUMN payload_json LONGTEXT NULL
      AFTER ketua_foto_url_baru
    `);

    console.log("[migrate] ✓ Kolom payload_json berhasil ditambahkan.");
  } catch (err) {
    console.error("[migrate] Error:", err);
    process.exit(1);
  }

  process.exit(0);
}

main();
