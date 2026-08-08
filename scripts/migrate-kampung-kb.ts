import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { kampungKbData as fallbackData } from "@/lib/seed-data";

async function main() {
  console.log("Creating pengaturan_kampung_kb table if not exists...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pengaturan_kampung_kb (
      id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
      rw_ref VARCHAR(64) NOT NULL DEFAULT 'rw-05',
      nama_program VARCHAR(255) NOT NULL,
      ketua VARCHAR(255) NOT NULL,
      deskripsi_program TEXT NOT NULL,
      sk_tahun VARCHAR(64),
      fungsi JSON,
      pengurus_inti JSON,
      pokja JSON,
      foto_highlight_url VARCHAR(512),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  console.log("Seeding default Kampung KB data if empty...");
  await db.execute(sql`
    INSERT INTO pengaturan_kampung_kb (
      id, rw_ref, nama_program, ketua, deskripsi_program, sk_tahun, fungsi, pengurus_inti, pokja, foto_highlight_url
    ) VALUES (
      'default',
      ${fallbackData.rw_ref},
      ${fallbackData.nama_program},
      ${fallbackData.ketua},
      ${fallbackData.deskripsi_program},
      ${fallbackData.sk_tahun},
      ${JSON.stringify(fallbackData.fungsi)},
      ${JSON.stringify(fallbackData.pengurus_inti)},
      ${JSON.stringify(fallbackData.pokja)},
      ${fallbackData.foto_highlight_url}
    )
    ON DUPLICATE KEY UPDATE id = id;
  `);

  console.log("Done migrating Kampung KB data to MySQL!");
}

main().catch(console.error);
