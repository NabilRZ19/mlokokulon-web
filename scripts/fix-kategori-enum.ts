import { readFileSync } from "fs";
import { resolve } from "path";
import { sql } from "drizzle-orm";

async function main() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line.includes("=") || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }

  const { db } = await import("../lib/db/client");
  console.log("Updating MySQL table 'berita' enum column 'kategori'...");

  await db.execute(
    sql`ALTER TABLE \`berita\` MODIFY COLUMN \`kategori\` ENUM('pengumuman','kegiatan','pembangunan','berita') NOT NULL;`
  );

  console.log("SUCCESS! Updated 'berita.kategori' enum to include 'berita'.");
  
  const result: any = await db.execute(sql`SHOW CREATE TABLE berita`);
  console.log("Updated Table DDL:");
  console.log(JSON.stringify(result[0], null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Alter table failed:", err);
    process.exit(1);
  });
