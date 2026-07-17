import "server-only";
import { adminDb } from "./firebase-admin";
import type { Rw, StrukturKelurahan } from "./types";

// Fetch server-side (Admin SDK) untuk halaman publik SSG/ISR — sesuai aturan kritikal PRD
// Bagian 7 poin 2: halaman publik tidak boleh fetch Firestore langsung dari client browser.

export async function getStrukturKelurahan(): Promise<StrukturKelurahan[]> {
  const snap = await adminDb.collection("struktur_kelurahan").orderBy("urutan").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as StrukturKelurahan);
}

export async function getRwList(): Promise<Rw[]> {
  const snap = await adminDb.collection("rw").orderBy("nama_rw").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Rw);
}
