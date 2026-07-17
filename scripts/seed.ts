import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
  // tsx tidak otomatis load .env.local seperti Next.js — load manual dulu
  // sebelum import lib/firebase-admin (yang baca process.env saat di-import).
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line.includes("=") || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx);
    const value = line.slice(idx + 1).replace(/^"|"$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }

  const { adminDb } = await import("../lib/firebase-admin");
  const { strukturKelurahanSeed, rwSeed, kampungKbSeed, beritaSeed, galeriSeed, umkmSeed } =
    await import("../lib/seed-data");

  async function resetAndSeed(collectionName: string, docs: { id: string }[]) {
    const collectionRef = adminDb.collection(collectionName);

    const existing = await collectionRef.listDocuments();
    const deleteBatch = adminDb.batch();
    existing.forEach((doc) => deleteBatch.delete(doc));
    if (existing.length > 0) await deleteBatch.commit();

    const writeBatch = adminDb.batch();
    for (const { id, ...data } of docs) {
      writeBatch.set(collectionRef.doc(id), data);
    }
    await writeBatch.commit();

    console.log(`  ${collectionName}: ${existing.length} dihapus, ${docs.length} ditulis`);
  }

  console.log("Seeding Firestore (mlokokulon-web)...");

  await resetAndSeed("struktur_kelurahan", strukturKelurahanSeed);
  await resetAndSeed("rw", rwSeed);
  await resetAndSeed("kampung_kb", [kampungKbSeed]);
  await resetAndSeed("berita", beritaSeed);
  await resetAndSeed("galeri", galeriSeed);
  await resetAndSeed("umkm", umkmSeed);

  console.log("Selesai. Jalankan ulang `npm run db:seed` kapan saja untuk reset + reseed.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed gagal:", err);
    process.exit(1);
  });
