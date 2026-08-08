import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { initialEventData, initialPengumumanData } from "@/lib/seed-data";

async function main() {
  console.log("Creating event and pengumuman tables...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS event (
      id VARCHAR(64) PRIMARY KEY,
      judul VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      deskripsi TEXT NOT NULL,
      tanggal_mulai DATE NOT NULL,
      tanggal_selesai DATE,
      jam_mulai VARCHAR(50) NOT NULL DEFAULT '08:00 WIB',
      lokasi VARCHAR(255) NOT NULL,
      gambar_cover_url VARCHAR(512),
      penulis VARCHAR(255) NOT NULL,
      pengusul VARCHAR(255),
      status ENUM('draft', 'pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
      reviewer_note TEXT,
      submitted_by_tier TINYINT,
      created_by VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pengumuman (
      id VARCHAR(64) PRIMARY KEY,
      judul VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      target_pengumuman VARCHAR(100) NOT NULL DEFAULT 'Seluruh Warga',
      isi TEXT NOT NULL,
      tanggal DATE NOT NULL,
      gambar_cover_url VARCHAR(512),
      penulis VARCHAR(255) NOT NULL,
      pengusul VARCHAR(255),
      status ENUM('draft', 'pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
      reviewer_note TEXT,
      submitted_by_tier TINYINT,
      created_by VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Seeding event data...");
  for (const item of initialEventData) {
    await db.execute(sql`
      INSERT INTO event (
        id, judul, slug, deskripsi, tanggal_mulai, tanggal_selesai, jam_mulai, lokasi, gambar_cover_url, penulis, status, created_by
      ) VALUES (
        ${item.id}, ${item.judul}, ${item.slug}, ${item.deskripsi}, ${item.tanggalMulai}, ${item.tanggalSelesai}, ${item.jamMulai}, ${item.lokasi}, ${item.gambarCoverUrl}, ${item.penulis}, ${item.status}, ${item.createdBy}
      ) ON DUPLICATE KEY UPDATE id=id;
    `);
  }

  console.log("Seeding pengumuman data...");
  for (const item of initialPengumumanData) {
    await db.execute(sql`
      INSERT INTO pengumuman (
        id, judul, slug, target_pengumuman, isi, tanggal, gambar_cover_url, penulis, status, created_by
      ) VALUES (
        ${item.id}, ${item.judul}, ${item.slug}, ${item.targetPengumuman}, ${item.isi}, ${item.tanggal}, ${item.gambarCoverUrl}, ${item.penulis}, ${item.status}, ${item.createdBy}
      ) ON DUPLICATE KEY UPDATE id=id;
    `);
  }

  console.log("Done seeding event & pengumuman!");
}

main().catch(console.error);
