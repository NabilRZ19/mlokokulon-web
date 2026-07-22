/**
 * Script one-off: Update data riil RW 04 — Dusun Tempuran
 * Sumber: dokumen resmi yang dikonfirmasi tim KKN (2026-07)
 *
 * Run: npx tsx scripts/update-rw04.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// tsx tidak otomatis load .env.local seperti Next.js — load manual dulu
const envPath = resolve(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  if (!line.includes("=") || line.startsWith("#")) continue;
  const idx = line.indexOf("=");
  const key = line.slice(0, idx).trim();
  const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  if (key) process.env[key] = val;
}

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { rw as rwTable, rwPengurus } from "../lib/db/schema";

const RW_ID = "rw-04";

// Struktur pengurus riil RW 04 - Tempuran
const PENGURUS_RW04 = [
  // ── Pengurus Inti RW ──────────────────────────────────────
  { nama: "Suwandi", jabatan: "Ketua RW 04" },
  { nama: "Minut Sumarsih", jabatan: "Sekretaris RW" },
  { nama: "Syukur Rahmadi", jabatan: "Bendahara RW" },

  // ── Pengurus RT 01 ────────────────────────────────────────
  { nama: "Slamet", jabatan: "Ketua RT 01" },
  { nama: "Syukur Rahmadi", jabatan: "Sekretaris RT 01" },
  { nama: "Lilik Tri Kurniawan", jabatan: "Bendahara RT 01" },

  // ── Pengurus RT 02 ────────────────────────────────────────
  { nama: "Katino", jabatan: "Ketua RT 02" },
  { nama: "Puji Hastuti", jabatan: "Sekretaris RT 02" },
  { nama: "Katino", jabatan: "Bendahara RT 02" },

  // ── Kelompok Tani Pendowo ─────────────────────────────────
  { nama: "Suwandi", jabatan: "Ketua Kelompok Tani Pendowo" },
  { nama: "Puji Hastuti", jabatan: "Sekretaris Kelompok Tani Pendowo" },
  { nama: "Taman", jabatan: "Bendahara Kelompok Tani Pendowo" },

  // ── Karang Taruna Tempuran REDHOSIN ───────────────────────
  { nama: "Mustofa", jabatan: "Ketua Karang Taruna REDHOSIN" },
  { nama: "Rudi", jabatan: "Wakil Ketua Karang Taruna REDHOSIN" },
  { nama: "Putri Amilus", jabatan: "Sekretaris Karang Taruna REDHOSIN" },
  { nama: "Dwi Waluyo", jabatan: "Sekretaris Karang Taruna REDHOSIN" },
  { nama: "Erni", jabatan: "Bendahara Karang Taruna REDHOSIN" },
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const db = drizzle(connection);

  try {
    console.log("🔄 Memperbarui data RW 04 — Tempuran...\n");

    // 1. Update statistik utama RW 04
    await db
      .update(rwTable)
      .set({
        jumlahKk: 90,
        jumlahJiwa: 263,
        potensi:
          "Dusun Tempuran memiliki kelompok tani aktif (Pendowo) yang dipimpin Suwandi, " +
          "serta Karang Taruna REDHOSIN yang aktif dalam kegiatan kepemudaan. " +
          "Mayoritas penduduk bermata pencaharian di sektor pertanian.",
      })
      .where(eq(rwTable.id, RW_ID));

    console.log("✅ Statistik RW 04 diperbarui: 90 KK / 263 jiwa (130 L + 133 P)");

    // 2. Hapus semua data pengurus lama untuk RW 04
    const deleted = await db.delete(rwPengurus).where(eq(rwPengurus.rwId, RW_ID));
    console.log(`🗑️  Hapus pengurus lama: ${(deleted as any)[0]?.affectedRows ?? "?"} baris`);

    // 3. Insert pengurus baru
    await db.insert(rwPengurus).values(
      PENGURUS_RW04.map((p) => ({
        rwId: RW_ID,
        nama: p.nama,
        jabatan: p.jabatan,
      }))
    );

    console.log(`✅ Insert ${PENGURUS_RW04.length} data pengurus baru RW 04\n`);

    // Verifikasi
    const allPengurus = await db
      .select()
      .from(rwPengurus)
      .where(eq(rwPengurus.rwId, RW_ID));

    console.log("📋 Daftar Pengurus RW 04 — Tempuran (terverifikasi dari DB):");
    for (const p of allPengurus) {
      console.log(`  - ${p.jabatan}: ${p.nama}`);
    }

    const [rwData] = await db.select().from(rwTable).where(eq(rwTable.id, RW_ID));
    console.log(`\n📊 Statistik: ${rwData.jumlahKk} KK | ${rwData.jumlahJiwa} jiwa`);
    console.log("\n🎉 Update RW 04 selesai!");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
