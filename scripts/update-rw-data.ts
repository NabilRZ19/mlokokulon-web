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

  console.log("Updating RW Data 1 s.d. 6 in MySQL...");

  const rwUpdates = [
    {
      id: "rw-01",
      deskripsiSingkat: "Lingkungan Bulurejo merupakan wilayah administratif RW 1 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Bulurejo berbatasan dengan Lingkungan Soko Lor di sebelah utara, Kelurahan Mlokomanis Wetan di sebelah timur, Lingkungan Soko Kidul di sebelah selatan, serta Lingkungan Pencil di sebelah barat.",
      pengurus: []
    },
    {
      id: "rw-02",
      deskripsiSingkat: "Lingkungan Pocung merupakan wilayah administratif RW 2 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Pocung berbatasan dengan Lingkungan Bon Agung di sebelah utara, Lingkungan Soko Kidul di sebelah timur, Kelurahan Ngadirojo Lor di sebelah selatan, serta Kelurahan Ngadirojo Lor di sebelah barat.",
      pengurus: []
    },
    {
      id: "rw-03",
      deskripsiSingkat: "Lingkungan Bon Agung merupakan wilayah administratif RW 3 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Bon Agung berbatasan dengan Lingkungan Tempuran di sebelah utara, Lingkungan Soko Kidul di sebelah timur, Lingkungan Pocung di sebelah selatan, serta Kelurahan Ngadirojo Lor di sebelah barat.",
      jumlahKk: 130,
      jumlahJiwa: 362,
      pengurus: [
        { nama: "Widodo", jabatan: "Ketua RW 03" },
        { nama: "Narti", jabatan: "Sekretaris RW 03" },
        { nama: "Drs. Sutarno", jabatan: "Bendahara RW 03" },
        { nama: "Untung", jabatan: "Ketua RT 01" },
        { nama: "Katinem", jabatan: "Sekretaris RT 01" },
        { nama: "Warni", jabatan: "Bendahara RT 01" },
        { nama: "Sunardi", jabatan: "Ketua RT 02" },
        { nama: "Marsudi", jabatan: "Sekretaris RT 02" },
        { nama: "Jalu Asmoro", jabatan: "Bendahara RT 02" },
        { nama: "Usman Catur", jabatan: "Ketua Karang Taruna Bakti Remaja" },
        { nama: "Marsudi", jabatan: "Sekretaris Karang Taruna Bakti Remaja" },
        { nama: "Yekti Utami", jabatan: "Bendahara Karang Taruna Bakti Remaja" }
      ]
    },
    {
      id: "rw-04",
      deskripsiSingkat: "Lingkungan Tempuran merupakan wilayah administratif RW 4 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Tempuran berbatasan dengan Lingkungan Pencil di sebelah utara, Lingkungan Bon Agung di sebelah selatan, Lingkungan Soko Kidul di sebelah timur, serta Kelurahan Ngadirojo Lor di sebelah barat.",
      jumlahKk: 90,
      jumlahJiwa: 263,
      potensi: "Akademi Voli + Akademi Bola",
      pengurus: [
        { nama: "Suwandi", jabatan: "Ketua RW 04" },
        { nama: "Minut Sumarsih", jabatan: "Sekretaris RW 04" },
        { nama: "Syukur Rahmadi", jabatan: "Bendahara RW 04" },
        { nama: "Slamet", jabatan: "Ketua RT 01" },
        { nama: "Syukur Rahmadi", jabatan: "Sekretaris RT 01" },
        { nama: "Lilik Tri Kurniawan", jabatan: "Bendahara RT 01" },
        { nama: "Katino", jabatan: "Ketua RT 02" },
        { nama: "Puji Hastuti", jabatan: "Sekretaris RT 02" },
        { nama: "Katino", jabatan: "Bendahara RT 02" },
        { nama: "Suwandi", jabatan: "Ketua Kelompok Tani Pendowo" },
        { nama: "Puji Hastuti", jabatan: "Sekretaris Kelompok Tani Pendowo" },
        { nama: "Taman", jabatan: "Bendahara Kelompok Tani Pendowo" },
        { nama: "Mustofa", jabatan: "Ketua Karang Taruna REDHOSIN" },
        { nama: "Rudi", jabatan: "Wakil Karang Taruna REDHOSIN" },
        { nama: "Putri Amilus & Dwi Waluyo", jabatan: "Sekretaris Karang Taruna REDHOSIN" },
        { nama: "Erni", jabatan: "Bendahara Karang Taruna REDHOSIN" }
      ]
    },
    {
      id: "rw-05",
      deskripsiSingkat: "Lingkungan Pencil merupakan wilayah administratif RW 5 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Selain menjadi kawasan permukiman masyarakat, Lingkungan Pencil juga merupakan lokasi Kantor Kelurahan Mlokomanis Kulon yang menjadi pusat penyelenggaraan pemerintahan dan pelayanan kepada masyarakat. Secara administratif, Lingkungan Pencil berbatasan dengan Lingkungan Jaten di sebelah utara, Lingkungan Soko Lor dan Lingkungan Bulurejo di sebelah timur, Lingkungan Tempuran di sebelah selatan, serta Kelurahan Ngadirojo Lor di sebelah barat.",
      jumlahKk: 105,
      jumlahJiwa: 316,
      potensi: "Kampung KB",
      pengurus: [
        { nama: "Mujiono, S.Pd.I., M.Pd.I.", jabatan: "Ketua RW 05" },
        { nama: "Sri Mulato", jabatan: "Sekretaris RW 05" },
        { nama: "Nanang Adi Saputro, S.Pd.", jabatan: "Bendahara RW 05" },
        { nama: "Yatno", jabatan: "Ketua RT 01" },
        { nama: "Marlan", jabatan: "Sekretaris RT 01" },
        { nama: "Slamet", jabatan: "Bendahara RT 01" },
        { nama: "Sutrisno", jabatan: "Ketua RT 02" },
        { nama: "Wawan", jabatan: "Sekretaris RT 02" },
        { nama: "Triyanto", jabatan: "Bendahara RT 02" }
      ]
    },
    {
      id: "rw-06",
      deskripsiSingkat: "Lingkungan Jaten merupakan wilayah administratif RW 6 di Kelurahan Mlokomanis Kulon. Wilayah ini didominasi oleh kawasan permukiman dan lahan pertanian yang menjadi bagian dari karakteristik penggunaan lahan di Kelurahan Mlokomanis Kulon. Secara administratif, Lingkungan Jaten berbatasan dengan Kelurahan Kasihan di sebelah utara, Lingkungan Pondok di sebelah timur, Lingkungan Pencil di sebelah selatan, serta Kelurahan Ngadirojo Lor di sebelah barat.",
      jumlahKk: 90,
      jumlahJiwa: 351,
      pengurus: [
        { nama: "Lissawitri", jabatan: "Ketua RW 06" },
        { nama: "Kardi", jabatan: "Ketua RT 01" },
        { nama: "Nur Diansyah", jabatan: "Ketua RT 02" }
      ]
    }
  ];

  for (const item of rwUpdates) {
    const updatePayload: Record<string, any> = {
      deskripsiSingkat: item.deskripsiSingkat,
    };
    if (item.jumlahKk !== undefined) updatePayload.jumlahKk = item.jumlahKk;
    if (item.jumlahJiwa !== undefined) updatePayload.jumlahJiwa = item.jumlahJiwa;
    if (item.potensi !== undefined) updatePayload.potensi = item.potensi;

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

  console.log("All RW Data 1-6 successfully updated!");
}

main().catch((err) => console.error("Update error:", err));
