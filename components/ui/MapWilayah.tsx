"use client";

import dynamic from "next/dynamic";

interface MapWilayahProps {
  focusedRwId?: string;
  className?: string;
  height?: string;
  showDesaLainByDefault?: boolean;
  showRwByDefault?: boolean;
}

const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[550px] w-full items-center justify-center rounded-2xl border border-border bg-slate-900 animate-pulse">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-semibold text-slate-300">Menyiapkan WebGIS Leaflet...</p>
      </div>
    </div>
  ),
});

export function MapWilayah(props: MapWilayahProps) {
  return <LeafletMapInner {...props} />;
}
