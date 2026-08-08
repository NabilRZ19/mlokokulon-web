import type { Metadata } from "next";
import { getEventList } from "@/lib/queries";
import { SITE_NAME } from "@/lib/seo";
import { EventHero } from "@/components/event/EventHero";
import { EventList } from "@/components/event/EventList";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Event & Agenda Mendatang | ${SITE_NAME}`,
  description: "Jadwal kegiatan, agenda kerja, musyawarah, dan acara mendatang di Kelurahan Mlokomanis Kulon.",
};

export default async function EventPage() {
  const eventList = await getEventList(true);

  return (
    <div className="bg-background min-h-screen">
      <EventHero />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <Reveal mode="scroll" duration={0.6} distance={20}>
          <EventList list={eventList} />
        </Reveal>
      </div>
    </div>
  );
}
