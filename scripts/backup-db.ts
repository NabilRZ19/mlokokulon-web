import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// 1. Load .env.local manual sebelum import db client
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line.includes("=") || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  const { db } = await import("../lib/db/client");
  const schema = await import("../lib/db/schema");

  console.log("📦 Memulai proses Backup Data MySQL...");

  // Query semua data dari tabel database
  const [
    strukturKelurahanData,
    rwData,
    rwPengurusData,
    beritaData,
    beritaFotoTambahanData,
    galeriData,
    umkmData,
    umkmProdukUnggulanData,
    umkmFotoData,
    adminUsersData,
    layananData,
  ] = await Promise.all([
    db.select().from(schema.strukturKelurahan),
    db.select().from(schema.rw),
    db.select().from(schema.rwPengurus),
    db.select().from(schema.berita),
    db.select().from(schema.beritaFotoTambahan),
    db.select().from(schema.galeri),
    db.select().from(schema.umkm),
    db.select().from(schema.umkmProdukUnggulan),
    db.select().from(schema.umkmFoto),
    db.select().from(schema.adminUsers),
    db.select().from(schema.layanan),
  ]);

  const backupData = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    counts: {
      strukturKelurahan: strukturKelurahanData.length,
      rw: rwData.length,
      rwPengurus: rwPengurusData.length,
      berita: beritaData.length,
      beritaFotoTambahan: beritaFotoTambahanData.length,
      galeri: galeriData.length,
      umkm: umkmData.length,
      umkmProdukUnggulan: umkmProdukUnggulanData.length,
      umkmFoto: umkmFotoData.length,
      adminUsers: adminUsersData.length,
      layanan: layananData.length,
    },
    tables: {
      strukturKelurahan: strukturKelurahanData,
      rw: rwData,
      rwPengurus: rwPengurusData,
      berita: beritaData,
      beritaFotoTambahan: beritaFotoTambahanData,
      galeri: galeriData,
      umkm: umkmData,
      umkmProdukUnggulan: umkmProdukUnggulanData,
      umkmFoto: umkmFotoData,
      adminUsers: adminUsersData,
      layanan: layananData,
    },
  };

  const backupDir = resolve(process.cwd(), "data", "backups");
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  // Format nama file: backup-YYYY-MM-DD_HH-mm-ss.json & backup-latest.json
  const now = new Date();
  const dateStr = now.toISOString().replace(/T/, "_").replace(/:/g, "-").replace(/\..+/, "");
  const timestampedFilename = `backup-${dateStr}.json`;
  
  const latestPath = resolve(backupDir, "backup-latest.json");
  const timestampedPath = resolve(backupDir, timestampedFilename);

  const jsonContent = JSON.stringify(backupData, null, 2);
  writeFileSync(latestPath, jsonContent, "utf8");
  writeFileSync(timestampedPath, jsonContent, "utf8");

  console.log("\n✅ Backup Berhasil Disimpan!");
  console.log(`📍 File Utama  : data/backups/backup-latest.json`);
  console.log(`📍 File History: data/backups/${timestampedFilename}`);
  console.log("\n📊 Ringkasan Data Yang Di-backup:");
  console.table(backupData.counts);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Backup Gagal:", err);
    process.exit(1);
  });
