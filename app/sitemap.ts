import type { MetadataRoute } from "next";
import { getBeritaList, getRwList, getUmkmList } from "@/lib/queries";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES = [
  "/",
  "/profil",
  "/layanan",
  "/kontak",
  "/struktur",
  "/wilayah",
  "/kampung-kb",
  "/berita",
  "/galeri",
  "/umkm",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [berita, umkm, rwList] = await Promise.all([
    getBeritaList(),
    getUmkmList(),
    getRwList(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === "/" || route === "/berita" ? "daily" : "weekly",
    priority: route === "/" ? 1.0 : 0.8,
  }));

  const beritaEntries: MetadataRoute.Sitemap = berita.map((b) => ({
    url: `${SITE_URL}/berita/${b.slug}`,
    lastModified: new Date(b.tanggal),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const umkmEntries: MetadataRoute.Sitemap = umkm.map((u) => ({
    url: `${SITE_URL}/umkm/${u.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const rwEntries: MetadataRoute.Sitemap = rwList.map((rw) => ({
    url: `${SITE_URL}/wilayah/${rw.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...beritaEntries, ...umkmEntries, ...rwEntries];
}
