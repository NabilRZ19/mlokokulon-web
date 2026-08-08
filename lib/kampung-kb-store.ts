import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { pengaturanKampungKb } from "./db/schema";
import { kampungKbData as fallbackData } from "./seed-data";
import type { KampungKb } from "./types";

export function getKampungKbStore(): KampungKb {
  return fallbackData;
}

export async function getKampungKbStoreAsync(): Promise<KampungKb> {
  try {
    const rows = await db
      .select()
      .from(pengaturanKampungKb)
      .where(eq(pengaturanKampungKb.id, "default"))
      .limit(1);

    if (rows.length > 0) {
      const row = rows[0];
      return {
        rw_ref: row.rwRef ?? fallbackData.rw_ref,
        nama_program: row.namaProgram,
        ketua: row.ketua,
        deskripsi_program: row.deskripsiProgram,
        sk_tahun: row.skTahun ?? fallbackData.sk_tahun,
        fungsi: (row.fungsi as string[]) ?? fallbackData.fungsi,
        pengurus_inti: (row.pengurusInti as any[]) ?? fallbackData.pengurus_inti,
        pokja: (row.pokja as any[]) ?? fallbackData.pokja,
        foto_highlight_url: row.fotoHighlightUrl ?? fallbackData.foto_highlight_url,
      };
    }
  } catch (err) {
    console.error("[kampung-kb-store] Error reading from DB, using fallback:", err);
  }
  return fallbackData;
}

export async function saveKampungKbStoreAsync(data: KampungKb): Promise<void> {
  try {
    await db
      .insert(pengaturanKampungKb)
      .values({
        id: "default",
        rwRef: data.rw_ref || "rw-05",
        namaProgram: data.nama_program,
        ketua: data.ketua,
        deskripsiProgram: data.deskripsi_program,
        skTahun: data.sk_tahun,
        fungsi: data.fungsi,
        pengurusInti: data.pengurus_inti,
        pokja: data.pokja,
        fotoHighlightUrl: data.foto_highlight_url,
      })
      .onDuplicateKeyUpdate({
        set: {
          rwRef: data.rw_ref || "rw-05",
          namaProgram: data.nama_program,
          ketua: data.ketua,
          deskripsiProgram: data.deskripsi_program,
          skTahun: data.sk_tahun,
          fungsi: data.fungsi,
          pengurusInti: data.pengurus_inti,
          pokja: data.pokja,
          fotoHighlightUrl: data.foto_highlight_url,
        },
      });
  } catch (err) {
    console.error("[kampung-kb-store] Error saving to DB:", err);
    throw err;
  }
}
