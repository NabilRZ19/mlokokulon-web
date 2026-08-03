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
  const { adminUsers } = await import("../lib/db/schema");
  const { hashPassword } = await import("../lib/auth");

  console.log("Checking and altering admin_users table...");

  try {
    await db.execute(sql`ALTER TABLE \`admin_users\` ADD COLUMN \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    console.log("Added updated_at column.");
  } catch (err: any) {
    console.log("updated_at column notice:", err?.message || err);
  }

  try {
    await db.execute(sql`ALTER TABLE \`admin_users\` ADD COLUMN \`last_login\` TIMESTAMP NULL`);
    console.log("Added last_login column.");
  } catch (err: any) {
    console.log("last_login column notice:", err?.message || err);
  }

  console.log("Creating superadmin2...");
  const email = "superadmin2@mlokokulon-ngadirojo.com";
  const password = "admintesting2";
  const passwordHash = await hashPassword(password);

  await db.insert(adminUsers).values({
    nama: "Super Admin 2",
    email,
    passwordHash,
    tier: 1,
    createdBy: null,
  }).onDuplicateKeyUpdate({
    target: adminUsers.email,
    set: { passwordHash, nama: "Super Admin 2" },
  });

  console.log(`SUCCESS: Akun superadmin2 berhasil dibuat/di-update!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
