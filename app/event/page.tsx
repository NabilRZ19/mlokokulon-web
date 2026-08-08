import type { Metadata } from "next";
import Link from "next/link";
import { getPublicImageUrl } from "@/lib/image-url";
import { getEventList } from "@/lib/queries";
import { SITE_NAME } from "@/lib/seo";
import { EventList } from "@/components/event/EventList";

export const metadata: Metadata = {
  title: `Event & Agenda Mendatang | ${SITE_NAME}`,
  description: "Jadwal kegiatan, agenda kerja, musyawarah, dan acara mendatang di Kelurahan Mlokomanis Kulon.",
};

function formatEventRange(startStr: string, endStr?: string | null) {
  const dStart = new Date(startStr);
  if (isNaN(dStart.getTime())) return startStr;

  const startFormatted = dStart.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!endStr || endStr === startStr) {
    return startFormatted;
  }

  const dEnd = new Date(endStr);
  if (isNaN(dEnd.getTime())) return startFormatted;

  const endFormatted = dEnd.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${startFormatted} s/d ${endFormatted}`;
}

function getEventBadgeDate(startStr: string, endStr?: string | null) {
  const dStart = new Date(startStr);
  const dayStart = isNaN(dStart.getTime()) ? "15" : dStart.getDate().toString().padStart(2, "0");
  const monthStart = isNaN(dStart.getTime()) ? "AGU" : dStart.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
  const yearStart = isNaN(dStart.getTime()) ? "2026" : dStart.getFullYear().toString();

  let dayEnd: string | null = null;
  if (endStr && endStr !== startStr) {
    const dEnd = new Date(endStr);
    if (!isNaN(dEnd.getTime())) {
      dayEnd = dEnd.getDate().toString().padStart(2, "0");
    }
  }

  return { dayStart, dayEnd, monthStart, yearStart };
}

export default async function EventPage() {
  const eventList = await getEventList(true);

  return (
    <div className="bg-background min-h-screen py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 space-y-10">
        {/* Header Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-2xs">
            <span>📅 Agenda &amp; Kegiatan Warga</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Event Mendatang
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Jadwal kegiatan kemasyarakatan, pelayanan kesehatan, pelatihan UMKM, dan agenda kerja kelurahan yang akan dilaksanakan dalam waktu dekat.
          </p>
        </div>

        {/* Event List Cards */}
        <EventList list={eventList} />
      </div>
    </div>
  );
}
