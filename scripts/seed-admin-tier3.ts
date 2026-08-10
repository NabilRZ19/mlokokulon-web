import { readFileSync } from "fs";
import { resolve } from "path";
import { eq, inArray } from "drizzle-orm";

interface Tier3Account {
  nama: string;
  email: string;
  passwordRaw: string;
  rwId: string;
}

const tier3Accounts: Tier3Account[] = [
  {
    nama: "Admin RW 01 BULUREJO",
    email: "adminbulurejo@kel-mlokomaniskulon.com",
    passwordRaw: "bulurejo01o",
    rwId: "rw-01",
  },
  {
    nama: "Admin RW 02 POCUNG",
    email: "adminpocung@kel-mlokomaniskulon.com",
    passwordRaw: "pocung02g",
    rwId: "rw-02",
  },
  {
    nama: "Admin RW 03 BONAGUNG",
    email: "adminbonagung@kel-mlokomaniskulon.com",
    passwordRaw: "bonagung03g",
    rwId: "rw-03",
  },
  {
    nama: "Admin RW 04 TEMPURAN",
    email: "admintempuran@kel-mlokomaniskulon.com",
    passwordRaw: "tempuran04n",
    rwId: "rw-04",
  },
  {
    nama: "Admin RW 05 PENCIL",
    email: "adminpencil@kel-mlokomaniskulon.com",
    passwordRaw: "pencil05l",
    rwId: "rw-05",
  },
  {
    nama: "Admin RW 06 JATEN",
    email: "adminjaten@kel-mlokomaniskulon.com",
    passwordRaw: "jaten06n",
    rwId: "rw-06",
  },
  {
    nama: "Admin RW 07 PONDOK",
    email: "adminpondok@kel-mlokomaniskulon.com",
    passwordRaw: "pondok07k",
    rwId: "rw-07",
  },
  {
    nama: "Admin RW 08 NGASINAN",
    email: "adminngasinan@kel-mlokomaniskulon.com",
    passwordRaw: "ngasinan08n",
    rwId: "rw-08",
  },
  {
    nama: "Admin RW 09 SOKO LOR",
    email: "adminsokolor@kel-mlokomaniskulon.com",
    passwordRaw: "sokolor09r",
    rwId: "rw-09",
  },
  {
    nama: "Admin RW 10 SOKO KIDUL",
    email: "adminsokokidul@kel-mlokomaniskulon.com",
    passwordRaw: "sokokidul10l",
    rwId: "rw-10",
  },
];

async function main() {
  console.log("Memulai penambahan/pembaruan akun Admin Tier 3 dari PDF (dengan domain .com)...");
  console.log("🔒 Data Super Admin (Tier 1/2), Berita, UMKM, RW, dll TIDAK terganggu.\n");

  const envPath = resolve(process.cwd(), ".env.local");
  try {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      if (!line.includes("=") || line.startsWith("#")) continue;
      const idx = line.indexOf("=");
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local opsional
  }

  const { db } = await import("../lib/db/client");
  const { adminUsers } = await import("../lib/db/schema");
  const { hashPassword } = await import("../lib/auth");

  // Hapus akun tanpa .com sebelumnya jika ada (agar bersih)
  const oldEmailsWithoutCom = tier3Accounts.map((a) => a.email.replace(/\.com$/, ""));
  if (oldEmailsWithoutCom.length > 0) {
    await db.delete(adminUsers).where(inArray(adminUsers.email, oldEmailsWithoutCom));
    console.log("  🧹 Membersihkan temporary email tanpa .com sebelumnya.");
  }

  let insertedCount = 0;
  let updatedCount = 0;

  for (const acc of tier3Accounts) {
    const passwordHash = await hashPassword(acc.passwordRaw);

    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, acc.email))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(adminUsers)
        .set({
          nama: acc.nama,
          passwordHash,
          tier: 3,
          rwId: acc.rwId,
        })
        .where(eq(adminUsers.email, acc.email));
      console.log(`  ✓ Updated: ${acc.nama} (${acc.email}) -> ${acc.rwId}`);
      updatedCount++;
    } else {
      await db.insert(adminUsers).values({
        nama: acc.nama,
        email: acc.email,
        passwordHash,
        tier: 3,
        rwId: acc.rwId,
        createdBy: null,
      });
      console.log(`  ✓ Inserted: ${acc.nama} (${acc.email}) -> ${acc.rwId}`);
      insertedCount++;
    }
  }

  console.log(`\n🎉 Selesai! Inserted: ${insertedCount}, Updated: ${updatedCount}. Total ${tier3Accounts.length} akun Tier 3 (.com) terkonfigurasi dengan sempurna.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Gagal menambahkan akun Tier 3:", err);
    process.exit(1);
  });
