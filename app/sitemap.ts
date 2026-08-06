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
  const baseUrl = SITE_URL.replace(/\/+$/, "");

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: route === "/" ? `${baseUrl}/` : `${baseUrl}${route}`,
    changeFrequency: route === "/" || route === "/berita" ? "daily" : "weekly",
    priority: route === "/" ? 1.0 : 0.8,
  }));

  try {
    const [berita, umkm, rwList] = await Promise.all([
      getBeritaList(),
      getUmkmList(),
      getRwList(),
    ]);

    const beritaEntries: MetadataRoute.Sitemap = berita.map((b) => {
      const parsedDate = b.tanggal ? new Date(b.tanggal) : new Date();
      const lastModified = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      return {
        url: `${baseUrl}/berita/${b.slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

    const umkmEntries: MetadataRoute.Sitemap = umkm.map((u) => ({
      url: `${baseUrl}/umkm/${u.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const rwEntries: MetadataRoute.Sitemap = rwList.map((rw) => ({
      url: `${baseUrl}/wilayah/${rw.id}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticEntries, ...beritaEntries, ...umkmEntries, ...rwEntries];
  } catch (err) {
    console.error("[sitemap] Failed to fetch dynamic data for sitemap:", err);
    return staticEntries;
  }
}

