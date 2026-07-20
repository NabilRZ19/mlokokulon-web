import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line.includes("=") || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx);
    const value = line.slice(idx + 1).replace(/^"|"$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }

  const [, , email, password, nama] = process.argv;
  if (!email || !password) {
    console.error("Usage: npm run db:create-admin -- <email> <password> [nama]");
    process.exit(1);
  }

  const { db } = await import("../lib/db/client");
  const { adminUsers } = await import("../lib/db/schema");
  const { hashPassword } = await import("../lib/auth");

  const passwordHash = await hashPassword(password);

  await db.insert(adminUsers).values({
    nama: nama ?? "Super Admin",
    email,
    passwordHash,
    tier: 1,
    createdBy: null,
  });

  console.log(`Admin Tier 1 dibuat: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Gagal bikin admin:", err);
    process.exit(1);
  });
