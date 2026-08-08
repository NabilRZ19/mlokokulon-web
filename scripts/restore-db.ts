import { existsSync, readFileSync } from "fs";
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

  // Tentukan path file backup yang akan di-restore
  const customBackupFile = process.argv[2];
  const targetFile = customBackupFile
    ? resolve(process.cwd(), customBackupFile)
    : resolve(process.cwd(), "data", "backups", "backup-latest.json");

  if (!existsSync(targetFile)) {
    console.error(`❌ File backup tidak ditemukan: ${targetFile}`);
    process.exit(1);
  }

  console.log(`♻️ Memulai Restore / Seeding Backup dari: ${targetFile}`);

  const rawJson = readFileSync(targetFile, "utf8");
  const backup = JSON.parse(rawJson);

  if (!backup.tables) {
    console.error("❌ Format file backup tidak valid (properti 'tables' tidak ada).");
    process.exit(1);
  }

  const { tables } = backup;

  // Hapus data lama sesuai urutan Relasi Foreign Key (Child -> Parent)
  console.log("🧹 Membersihkan tabel lama sebelum restore...");

  await db.delete(schema.beritaFotoTambahan);
  await db.delete(schema.galeri);
  await db.delete(schema.berita);

  await db.delete(schema.umkmFoto);
  await db.delete(schema.umkmProdukUnggulan);
  await db.delete(schema.umkm);

  await db.delete(schema.rwPengurus);
  await db.delete(schema.rw);

  await db.delete(schema.strukturKelurahan);
  await db.delete(schema.layanan);

  // Restore Admin Users jika ada di backup (opsional, jika kosong tidak akan menghapus admin yang ada)
  if (tables.adminUsers && tables.adminUsers.length > 0) {
    await db.delete(schema.adminUsers);
  }

  console.log("📥 Memasukkan data backup ke Database...");

  // Helper function untuk format timestamp string menjadi Date object jika diperlukan
  const parseDates = <T extends Record<string, any>>(rows: T[], dateFields: string[]): T[] => {
    return rows.map((row) => {
      const newRow: Record<string, any> = { ...row };
      for (const field of dateFields) {
        if (newRow[field]) {
          newRow[field] = new Date(newRow[field]);
        }
      }
      return newRow as T;
    });
  };

  // 1. Insert Struktur Kelurahan
  if (tables.strukturKelurahan?.length > 0) {
    await db.insert(schema.strukturKelurahan).values(tables.strukturKelurahan);
    console.log(`  ✓ struktur_kelurahan: ${tables.strukturKelurahan.length} baris restored`);
  }

  // 2. Insert RW & RW Pengurus
  if (tables.rw?.length > 0) {
    await db.insert(schema.rw).values(tables.rw);
    console.log(`  ✓ rw: ${tables.rw.length} baris restored`);
  }
  if (tables.rwPengurus?.length > 0) {
    await db.insert(schema.rwPengurus).values(tables.rwPengurus);
    console.log(`  ✓ rw_pengurus: ${tables.rwPengurus.length} baris restored`);
  }

  // 3. Insert Berita & Foto Tambahan
  if (tables.berita?.length > 0) {
    await db.insert(schema.berita).values(tables.berita);
    console.log(`  ✓ berita: ${tables.berita.length} baris restored`);
  }
  if (tables.beritaFotoTambahan?.length > 0) {
    await db.insert(schema.beritaFotoTambahan).values(tables.beritaFotoTambahan);
    console.log(`  ✓ berita_foto_tambahan: ${tables.beritaFotoTambahan.length} baris restored`);
  }

  // 4. Insert Galeri
  if (tables.galeri?.length > 0) {
    await db.insert(schema.galeri).values(tables.galeri);
    console.log(`  ✓ galeri: ${tables.galeri.length} baris restored`);
  }

  // 5. Insert UMKM, Produk Unggulan, & Foto UMKM
  if (tables.umkm?.length > 0) {
    await db.insert(schema.umkm).values(tables.umkm);
    console.log(`  ✓ umkm: ${tables.umkm.length} baris restored`);
  }
  if (tables.umkmProdukUnggulan?.length > 0) {
    await db.insert(schema.umkmProdukUnggulan).values(tables.umkmProdukUnggulan);
    console.log(`  ✓ umkm_produk_unggulan: ${tables.umkmProdukUnggulan.length} baris restored`);
  }
  if (tables.umkmFoto?.length > 0) {
    await db.insert(schema.umkmFoto).values(tables.umkmFoto);
    console.log(`  ✓ umkm_foto: ${tables.umkmFoto.length} baris restored`);
  }

  // 6. Insert Admin Users
  if (tables.adminUsers?.length > 0) {
    const adminRows = parseDates(tables.adminUsers, ["updatedAt", "lastLogin"]);
    await db.insert(schema.adminUsers).values(adminRows as any);
    console.log(`  ✓ admin_users: ${tables.adminUsers.length} baris restored`);
  }

  // 7. Insert Layanan
  if (tables.layanan?.length > 0) {
    const layananRows = parseDates(tables.layanan, ["createdAt", "updatedAt"]);
    await db.insert(schema.layanan).values(layananRows as any);
    console.log(`  ✓ layanan: ${tables.layanan.length} baris restored`);
  }

  console.log("\n🎉 Restore Data Berhasil! Database telah dikembalikan ke kondisi backup.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Restore Gagal:", err);
    process.exit(1);
  });
