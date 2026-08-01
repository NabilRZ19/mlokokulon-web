// Escape "<" biar aman kalau JSON mengandung "</script>" dari konten CMS (judul berita/UMKM).
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
