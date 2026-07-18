import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getUmkmBySlug, getUmkmList } from "@/lib/queries";

export const revalidate = 3600;

export async function generateStaticParams() {
  const umkm = await getUmkmList();
  return umkm.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const umkm = await getUmkmBySlug(slug);
  return { title: umkm ? `${umkm.nama} — Kelurahan Mlokomanis Kulon` : "UMKM tidak ditemukan" };
}

export default async function UmkmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const umkm = await getUmkmBySlug(slug);
  if (!umkm) notFound();

  const [cover, ...rest] = umkm.foto_urls;

  return (
    <div>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Link href="/umkm" className="text-sm text-primary hover:underline">
            ← Semua UMKM
          </Link>
          <div className="mt-4">
            <Badge>{umkm.kategori}</Badge>
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {umkm.nama}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <img
          src={cover}
          alt={umkm.nama}
          className="w-full rounded-lg border border-border object-cover"
        />

        {rest.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {rest.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="aspect-square rounded-md border border-border object-cover"
              />
            ))}
          </div>
        )}

        <p className="mt-6 text-sm leading-relaxed text-foreground">{umkm.deskripsi}</p>

        <Card className="mt-6">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Produk Unggulan
          </h2>
          <ul className="mt-2 list-inside list-disc text-sm text-foreground">
            {umkm.produk_unggulan.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <dl className="mt-4 border-t border-border pt-3 text-sm text-foreground">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Jam Operasional</dt>
              <dd>{umkm.jam_operasional}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${umkm.kontak.replace(/\D/g, "")}`}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              WhatsApp
            </a>
            {umkm.link_gmaps && (
              <a
                href={umkm.link_gmaps}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Lihat di Google Maps
              </a>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
