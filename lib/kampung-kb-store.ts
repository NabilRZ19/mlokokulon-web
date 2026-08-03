import fs from "fs";
import path from "path";
import { kampungKbData as fallbackData } from "./seed-data";
import type { KampungKb } from "./types";

const FILE_PATH = path.join(process.cwd(), "data", "kampung-kb.json");

export function getKampungKbStore(): KampungKb {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const content = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && parsed.nama_program) {
        return parsed as KampungKb;
      }
    }
  } catch (err) {
    console.error("[kampung-kb-store] Failed to read kampung-kb.json, using fallback:", err);
  }
  return fallbackData;
}

export function saveKampungKbStore(data: KampungKb): void {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}
