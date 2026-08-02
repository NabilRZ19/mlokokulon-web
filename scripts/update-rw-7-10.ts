import { readFileSync } from "fs";
import { resolve } from "path";

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
  } catch (err) {
    console.log("Using environment variables");
  }

  const { db } = await import("../lib/db/client");
  const { rw: rwTable, rwPengurus } = await import("../lib/db/schema");
  const { eq } = await import("drizzle-orm");

  console.log("Updating RW Data 7 s.d. 10 in MySQL...");

  const rwUpdates = [
    {
      id: "rw-07",
      deskripsiSingkat: "Lingkungan Pondok merupakan wilayah administratif RW 7 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Pondok berbatasan dengan Kelurahan Kasihan di sebelah utara, Lingkungan Ngasinan di sebelah timur, Lingkungan Soko Lor di sebelah selatan, serta Lingkungan Jaten di sebelah barat.",
      pengurus: []
    },
    {
      id: "rw-08",
      deskripsiSingkat: "Lingkungan Ngasinan merupakan wilayah administratif RW 8 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Ngasinan berbatasan dengan Kelurahan Kasihan di sebelah utara, Kelurahan Mlokomanis Wetan di sebelah timur, Lingkungan Soko Lor di sebelah selatan, serta Lingkungan Pondok di sebelah barat.",
      jumlahJiwa: 441,
      pengurus: [
        { nama: "Suman", jabatan: "Ketua RW Ngasinan" },
        { nama: "Parmanto", jabatan: "Sekretaris RW Ngasinan" },
        { nama: "Suparno", jabatan: "Bendahara RW Ngasinan" }
      ]
    },
    {
      id: "rw-09",
      deskripsiSingkat: "Lingkungan Soko Lor merupakan wilayah administratif RW 9 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Soko Lor berbatasan dengan Lingkungan Pondok di sebelah utara, Lingkungan Ngasinan di sebelah timur, Lingkungan Bulurejo di sebelah selatan, serta Lingkungan Pencil di sebelah barat.",
      jumlahKk: 108,
      jumlahJiwa: 274,
      pengurus: [
        { nama: "Sulardi", jabatan: "Ketua RW 09" },
        { nama: "Tukiman", jabatan: "Ketua RT 01" },
        { nama: "Aref Samsudin", jabatan: "Ketua RT 02" },
        { nama: "Muhajir", jabatan: "Sekretaris RW 09" },
        { nama: "Warijo", jabatan: "Bendahara RW 09" }
      ]
    },
    {
      id: "rw-10",
      deskripsiSingkat: "Lingkungan Soko Kidul merupakan wilayah administratif RW 10 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Soko Kidul berbatasan dengan Lingkungan Soko Lor dan Lingkungan Bulurejo di sebelah utara, Kelurahan Mlokomanis Wetan di sebelah timur, Kelurahan Ngadirojo Kidul di sebelah selatan, serta Lingkungan Bon Agung dan Lingkungan Tempuran di sebelah barat.",
      pengurus: []
    }
  ];

  for (const item of rwUpdates) {
    const updatePayload: Record<string, any> = {
      deskripsiSingkat: item.deskripsiSingkat,
    };
    if (item.jumlahKk !== undefined) updatePayload.jumlahKk = item.jumlahKk;
    if (item.jumlahJiwa !== undefined) updatePayload.jumlahJiwa = item.jumlahJiwa;

    await db.update(rwTable).set(updatePayload).where(eq(rwTable.id, item.id));

    if (item.pengurus && item.pengurus.length > 0) {
      await db.delete(rwPengurus).where(eq(rwPengurus.rwId, item.id));
      await db.insert(rwPengurus).values(
        item.pengurus.map((p) => ({
          rwId: item.id,
          nama: p.nama,
          jabatan: p.jabatan,
        }))
      );
    }
    console.log(`Updated ${item.id}`);
  }

  console.log("All RW Data 7-10 successfully updated!");
}

main().catch((err) => console.error("Update error:", err));
