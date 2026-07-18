import "server-only";
import { adminDb } from "./firebase-admin";
import type { Berita, Galeri, Rw, StrukturKelurahan, Umkm } from "./types";

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

export async function getRwById(id: string): Promise<Rw | null> {
  const doc = await adminDb.collection("rw").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Rw;
}

export async function getBeritaList(): Promise<Berita[]> {
  const snap = await adminDb.collection("berita").orderBy("tanggal", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Berita);
}

export async function getBeritaBySlug(slug: string): Promise<Berita | null> {
  const snap = await adminDb.collection("berita").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Berita;
}

export async function getUmkmList(): Promise<Umkm[]> {
  const snap = await adminDb.collection("umkm").orderBy("nama").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Umkm);
}

export async function getUmkmBySlug(slug: string): Promise<Umkm | null> {
  const snap = await adminDb.collection("umkm").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Umkm;
}

export async function getGaleriList(): Promise<Galeri[]> {
  const snap = await adminDb.collection("galeri").orderBy("judul").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Galeri);
}
