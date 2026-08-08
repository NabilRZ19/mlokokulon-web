import type { Metadata } from "next";
import { getPengumumanList } from "@/lib/queries";
import { SITE_NAME } from "@/lib/seo";
import { PengumumanHero } from "@/components/pengumuman/PengumumanHero";
import { PengumumanList } from "@/components/pengumuman/PengumumanList";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Pengumuman Resmi | ${SITE_NAME}`,
  description: "Pengumuman resmi dan informasi penting Kelurahan Mlokomanis Kulon untuk seluruh warga dan lembaga masyarakat.",
};

export default async function PengumumanPage() {
  const pengumumanList = await getPengumumanList(true);

  return (
    <div className="bg-background min-h-screen">
      <PengumumanHero />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <Reveal mode="scroll" duration={0.6} distance={20}>
          <PengumumanList list={pengumumanList} />
        </Reveal>
      </div>
    </div>
  );
}
