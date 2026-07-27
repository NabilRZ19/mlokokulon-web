"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapInnerProps {
  focusedRwId?: string;
  className?: string;
  height?: string;
  showDesaLainByDefault?: boolean;
  showRwByDefault?: boolean;
}

const DASH_KECAMATAN = "1,4,1,4,1,14";
const DASH_DESA_LAIN = "1,4,1,4,1,4,1,14";

// Exact SVG definitions from the original exercise file (script.js)
const SARANA_SVG: Record<string, string> = {
  Masjid:
    '<path d="M12 2.5c-2 2.3-2.8 4.5-2.8 6.5h5.6c0-2-.8-4.2-2.8-6.5z"/>' +
    '<rect x="8.7" y="9" width="6.6" height="1.8"/>' +
    '<path d="M5 21v-6.2c0-3.4 2.9-5.8 7-5.8s7 2.4 7 5.8V21H5z"/>' +
    '<rect x="11" y="14" width="2" height="4"/>',

  Sekolah:
    '<path d="M12 3 2 8l10 5 10-5-10-5z"/>' +
    '<path d="M6 11.3V16c0 1.7 2.7 3.2 6 3.2s6-1.5 6-3.2v-4.7l-6 3-6-3z"/>' +
    '<rect x="19" y="8.3" width="1.4" height="6"/>',

  Lapangan:
    '<circle cx="12" cy="12" r="8.2" fill="none" stroke="#fff" stroke-width="1.6"/>' +
    '<path d="M12 8.2 15 10.4 13.8 14h-3.6L9 10.4z"/>' +
    '<path d="M12 8.2V5.5M15 10.4l2.4-1.7M13.8 14l1 2.6M10.2 14l-1 2.6M9 10.4l-2.4-1.7" stroke="#fff" stroke-width="1.2"/>',

  Pemerintah:
    '<path d="M12 3 3 8.5h18L12 3z"/>' +
    '<rect x="4.2" y="9.5" width="1.8" height="8"/>' +
    '<rect x="8.6" y="9.5" width="1.8" height="8"/>' +
    '<rect x="13.1" y="9.5" width="1.8" height="8"/>' +
    '<rect x="17.6" y="9.5" width="1.8" height="8"/>' +
    '<rect x="3" y="17.8" width="18" height="1.8"/>',

  Kesehatan:
    '<rect x="9.6" y="4" width="4.8" height="16" rx="1"/>' +
    '<rect x="4" y="9.6" width="16" height="4.8" rx="1"/>',

  UMKM:
    '<path d="M6.5 8h11l1.1 12.5H5.4L6.5 8z"/>' +
    '<path d="M9 8V6.3a3 3 0 0 1 6 0V8" fill="none" stroke="#fff" stroke-width="1.5"/>',

  KMP:
    '<rect x="2.5" y="7" width="19" height="8.5" rx="2"/>' +
    '<rect x="4" y="8.5" width="4" height="3.5" fill="#00000033"/>' +
    '<circle cx="7" cy="17.3" r="2"/>' +
    '<circle cx="17" cy="17.3" r="2"/>',

  Lainnya:
    '<path d="M12 2.5c-3.6 0-6.5 2.8-6.5 6.4C5.5 13.5 12 21.5 12 21.5s6.5-8 6.5-12.6c0-3.6-2.9-6.4-6.5-6.4z"/>' +
    '<circle cx="12" cy="9" r="2.3" fill="#00000055"/>',
};

// Exact color mappings from original script.js
function getWarna(jenis: string): string {
  switch (jenis) {
    case "Masjid":
      return "#2E7D32";
    case "Sekolah":
      return "#1976D2";
    case "Lapangan":
      return "#43A047";
    case "Pemerintah":
      return "#F57C00";
    case "Kesehatan":
      return "#D32F2F";
    case "UMKM":
      return "#8E24AA";
    case "KMP":
      return "#00838F";
    default:
      return "#616161";
  }
}

function getRWColor(rw: number | string): string {
  switch (Number(rw)) {
    case 1:
      return "#e41a1c";
    case 2:
      return "#377eb8";
    case 3:
      return "#4daf4a";
    case 4:
      return "#984ea3";
    case 5:
      return "#ff7f00";
    case 6:
      return "#a65628";
    case 7:
      return "#f781bf";
    case 8:
      return "#00acc1";
    case 9:
      return "#8BC34A";
    case 10:
      return "#795548";
    default:
      return "#999999";
  }
}

// Circular badge HTML generator for map markers
function saranaBadgeHtml(
  jenis: string,
  ukuranBadge: number,
  ukuranIkon: number,
  kelasTambahan?: string
): string {
  const warna = getWarna(jenis);
  const glyph = SARANA_SVG[jenis] || SARANA_SVG["Lainnya"];
  const kelas = "sarana-badge" + (kelasTambahan ? " " + kelasTambahan : "");

  return (
    `<span class="${kelas}" style="background-color:${warna} !important;background:${warna} !important;width:${ukuranBadge}px !important;height:${ukuranBadge}px !important;min-width:${ukuranBadge}px;min-height:${ukuranBadge}px;display:inline-flex !important;align-items:center !important;justify-content:center !important;border-radius:50% !important;border:1.5px solid #ffffff !important;box-shadow:0 1px 4px rgba(0,0,0,0.45) !important;box-sizing:border-box !important;vertical-align:middle !important;flex-shrink:0 !important;">` +
    `<svg viewBox="0 0 24 24" width="${ukuranIkon}" height="${ukuranIkon}" style="fill:#ffffff !important;display:block !important;width:${ukuranIkon}px;height:${ukuranIkon}px;">${glyph}</svg>` +
    `</span>`
  );
}

function createSaranaIcon(jenis: string): L.DivIcon {
  const html = saranaBadgeHtml(jenis, 28, 15);
  return L.divIcon({
    html: html,
    className: "sarana-icon-wrapper",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -15],
  });
}

// Circular badge HTML generator dedicated for Legend items (matches user screenshot)
function legendBadgeSarana(jenis: string): string {
  const warna = getWarna(jenis);
  const glyph = SARANA_SVG[jenis] || SARANA_SVG["Lainnya"];
  return (
    `<span style="display:inline-flex !important;align-items:center !important;justify-content:center !important;width:20px !important;height:20px !important;min-width:20px !important;min-height:20px !important;border-radius:50% !important;background-color:${warna} !important;background:${warna} !important;border:1.5px solid #ffffff !important;box-shadow:0 1px 3px rgba(0,0,0,0.35) !important;vertical-align:middle !important;box-sizing:border-box !important;margin:0 4px 0 2px !important;flex-shrink:0 !important;">` +
    `<svg viewBox="0 0 24 24" width="11" height="11" style="fill:#ffffff !important;display:block !important;width:11px !important;height:11px !important;">${glyph}</svg>` +
    `</span>`
  );
}

function legendLineHtml(
  mode: "casing" | "solid",
  warna: string,
  dash?: string | null,
  tebal?: number
): string {
  const w = 30,
    h = 12,
    y = h / 2;

  let svg = `<svg width="${w}" height="${h}" class="legend-line" style="display:inline-block;vertical-align:middle;flex-shrink:0;margin-right:2px;">`;
  if (mode === "casing") {
    svg += `<line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="#ffffff" stroke-width="3.5"/>`;
    svg += `<line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="${warna}" stroke-width="1.5"/>`;
    svg += `<line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="#ffffff" stroke-width="1" stroke-dasharray="${dash}"/>`;
  } else {
    svg += `<line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="${warna}" stroke-width="${
      tebal || 3
    }"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
  }
  svg += "</svg>";
  return svg;
}

function legendRow(iconHtml: string, teks: string): string {
  return `<span class="legend-row" style="display:inline-flex;align-items:center;gap:4px;vertical-align:middle;">${iconHtml}<span style="color:#1e293b;font-weight:500;font-size:13px;vertical-align:middle;">${teks}</span></span>`;
}

// Thin casing line function for subtle surrounding boundaries
function buatGarisCasing(data: any, opsi: any): L.LayerGroup {
  const filter = opsi.filter;
  const isThin = opsi.isThin;

  const halo = L.geoJSON(data, {
    filter: filter,
    style: {
      color: "#ffffff",
      weight: isThin ? 3 : 5,
      opacity: 0.8,
      fillOpacity: 0,
    },
  });

  const utama = L.geoJSON(data, {
    filter: filter,
    style: {
      color: opsi.warnaGaris || "#475569",
      weight: isThin ? 1 : 2,
      opacity: 0.8,
      fillOpacity: 0,
    },
  });

  const putus = L.geoJSON(data, {
    filter: filter,
    style: {
      color: "#ffffff",
      weight: isThin ? 0.8 : 1.2,
      opacity: 0.8,
      dashArray: opsi.dashPattern,
      fillOpacity: 0,
    },
    onEachFeature: function (feature, layer) {
      if (opsi.labelKey) {
        layer.bindTooltip(String(feature.properties[opsi.labelKey]), opsi.labelStyle);
      }
    },
  });

  return L.layerGroup([halo, utama, putus]);
}

export default function LeafletMapInner({
  focusedRwId,
  className = "",
  height = "550px",
  showDesaLainByDefault = false,
  showRwByDefault = true,
}: LeafletMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    let isSubscribed = true;

    // Base Maps: Esri Satellite & OpenStreetMap Street
    const esriSatellite = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri", maxZoom: 19 }
    );

    const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      subdomains: ["a", "b", "c"],
      maxZoom: 19,
    });

    const map = L.map(containerRef.current, {
      center: [-7.84, 111.08],
      zoom: 15,
      layers: [esriSatellite],
    });
    mapRef.current = map;

    // Invalidate size immediately & on window resize
    const invalidate = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    const timer1 = setTimeout(invalidate, 100);
    const timer2 = setTimeout(invalidate, 400);
    window.addEventListener("resize", invalidate);

    // Style Tooltip Labels
    const labelDesa = { permanent: true, direction: "center" as const, className: "labeldesa" };
    const labelRW = { permanent: true, direction: "center" as const, className: "labelrw" };
    const labelDesaLain = { permanent: true, direction: "center" as const, className: "labeldesalain" };
    const labelKecamatan = { permanent: true, direction: "center" as const, className: "labelkec" };

    // Fetch All GeoJSON Data
    Promise.all([
      fetch("/data/DesaNgadirojo.geojson").then((r) => r.json()),
      fetch("/data/MlokoFIX.geojson").then((r) => r.json()),
      fetch("/data/WonogiriWADMKC.geojson").then((r) => r.json()),
      fetch("/data/TitikSarana.geojson").then((r) => r.json()),
    ])
      .then(([desaData, rwData, kecamatanData, saranaGeojson]) => {
        if (!isSubscribed || !mapRef.current) return;

        const targetRwNum = focusedRwId
          ? parseInt(focusedRwId.replace(/\D/g, ""), 10)
          : null;

        const NAMA_DESA_UTAMA =
          (rwData.features[0] && rwData.features[0].properties.WADMKD) || "Mlokomanis Kulon";

        // 1. Batas Kelurahan Utama (Highlight Merah Utuh secara Default)
        const desaLayer = L.geoJSON(desaData, {
          filter: (feature) => feature.properties.WADMKD === NAMA_DESA_UTAMA,
          style: {
            color: "#D32F2F",
            weight: 3.5,
            fillColor: "#D32F2F",
            fillOpacity: 0.2,
          },
          onEachFeature: (feature, layer) => {
            layer.bindTooltip(feature.properties.WADMKD, labelDesa);
          },
        }).addTo(map);

        // 2. Batas Desa/Kelurahan Lain (Outline Ditipiskan)
        const desaLainLayer = buatGarisCasing(desaData, {
          filter: (feature: any) => feature.properties.WADMKD !== NAMA_DESA_UTAMA,
          dashPattern: DASH_DESA_LAIN,
          warnaGaris: "#475569",
          labelKey: "WADMKD",
          labelStyle: labelDesaLain,
          isThin: true,
        });

        if (showDesaLainByDefault) {
          desaLainLayer.addTo(map);
        }

        // 3. Batas RW
        let targetRwLayer: L.Layer | null = null;

        const rwLayer = L.geoJSON(rwData, {
          style: (feature) => {
            const rwNum = Number(feature?.properties.BATASRW);

            // MODE DETAIL RW: Hanya RW aktif yang berwarna, RW lain monochrome transparan
            if (targetRwNum !== null) {
              const isFocused = rwNum === targetRwNum;
              if (isFocused) {
                return {
                  color: "#ffffff",
                  weight: 3,
                  fillColor: getRWColor(rwNum),
                  fillOpacity: 0.55,
                };
              } else {
                return {
                  color: "#94a3b8",
                  weight: 1,
                  fillColor: "#64748b",
                  fillOpacity: 0.08,
                };
              }
            }

            // MODE UMUM: Semua RW berwarna dengan transparansi halus
            return {
              color: "#333333",
              weight: 1.5,
              fillColor: getRWColor(rwNum),
              fillOpacity: 0.35,
            };
          },
          onEachFeature: (feature, layer) => {
            const rw = feature.properties.BATASRW;
            const lingkungan = feature.properties.Lingkungan;
            const rwNum = Number(rw);

            if (targetRwNum !== null && rwNum === targetRwNum) {
              targetRwLayer = layer;
            }

            layer.bindTooltip(`RW ${rw} (${lingkungan})`, labelRW);
            layer.bindPopup(
              `<div style="font-family:sans-serif;padding:4px;">` +
                `<strong style="font-size:14px;color:#1e293b;">RW ${rw}</strong><br/>` +
                `<span style="font-size:12px;color:#475569;">Lingkungan: ${lingkungan}</span>` +
                `</div>`
            );

            layer.on({
              mouseover: (e) => {
                const isFocused = targetRwNum !== null && rwNum === targetRwNum;
                e.target.setStyle({
                  weight: isFocused ? 4 : 2.5,
                  color: isFocused ? "#ffffff" : "#000000",
                  fillOpacity: targetRwNum !== null && !isFocused ? 0.25 : 0.6,
                });
              },
              mouseout: (e) => {
                rwLayer.resetStyle(e.target);
              },
            });
          },
        });

        if (showRwByDefault) {
          rwLayer.addTo(map);
        }

        // 4. Batas Kecamatan (Ditipiskan)
        const kecamatanLayer = buatGarisCasing(kecamatanData, {
          dashPattern: DASH_KECAMATAN,
          warnaGaris: "#1e293b",
          labelKey: "WADMKC",
          labelStyle: labelKecamatan,
          isThin: true,
        });

        // 5. Sarana Layers
        function popupSarana(feature: any, layer: L.Layer) {
          layer.bindPopup(
            `<div style="font-family:sans-serif;padding:4px;">` +
              `<strong style="font-size:14px;color:#1e293b;">${feature.properties.Nama}</strong><br/>` +
              `<span style="font-size:12px;color:#475569;">Jenis: ${feature.properties.Jenis}</span>` +
              `</div>`
          );
        }

        function buatSaranaLayer(jenis: string) {
          return L.geoJSON(saranaGeojson, {
            filter: (feature) => feature.properties.Jenis === jenis,
            pointToLayer: (feature, latlng) => {
              return L.marker(latlng, { icon: createSaranaIcon(jenis) });
            },
            onEachFeature: popupSarana,
          });
        }

        const masjidLayer = buatSaranaLayer("Masjid").addTo(map);
        const sekolahLayer = buatSaranaLayer("Sekolah").addTo(map);
        const lapanganLayer = buatSaranaLayer("Lapangan").addTo(map);
        const pemerintahLayer = buatSaranaLayer("Pemerintah").addTo(map);
        const kesehatanLayer = buatSaranaLayer("Kesehatan").addTo(map);
        const umkmLayer = buatSaranaLayer("UMKM").addTo(map);
        const kmpLayer = buatSaranaLayer("KMP").addTo(map);
        const lainnyaLayer = buatSaranaLayer("Lainnya").addTo(map);

        // 6. Layer Control & Legenda (collapsed: true agar berupa tombol pop/expand)
        const baseMaps = {
          "🛰 Satellite": esriSatellite,
          "🗺 Street": street,
        };

        const overlayMaps: Record<string, L.LayerGroup | L.GeoJSON> = {
          [legendRow(legendLineHtml("solid", "#D32F2F", null, 3), "Batas Kelurahan (Utama)")]: desaLayer,
          [legendRow(legendLineHtml("casing", "#475569", DASH_DESA_LAIN, 1.5), "Desa/Kelurahan Lain")]: desaLainLayer,
          [legendRow('<span style="display:inline-block;width:14px;height:14px;border:1px solid #333;border-radius:3px;background:#4daf4a;vertical-align:middle;margin-right:4px;"></span>', "Wilayah RW (Filter)")]: rwLayer,
          [legendRow(legendLineHtml("casing", "#1e293b", DASH_KECAMATAN, 1.5), "Batas Kecamatan")]: kecamatanLayer,
          [legendRow(legendBadgeSarana("Masjid"), "Masjid")]: masjidLayer,
          [legendRow(legendBadgeSarana("Sekolah"), "Sekolah")]: sekolahLayer,
          [legendRow(legendBadgeSarana("Lapangan"), "Lapangan")]: lapanganLayer,
          [legendRow(legendBadgeSarana("Pemerintah"), "Pemerintah")]: pemerintahLayer,
          [legendRow(legendBadgeSarana("Kesehatan"), "Kesehatan")]: kesehatanLayer,
          [legendRow(legendBadgeSarana("UMKM"), "UMKM")]: umkmLayer,
          [legendRow(legendBadgeSarana("KMP"), "KMP")]: kmpLayer,
          [legendRow(legendBadgeSarana("Lainnya"), "Lainnya")]: lainnyaLayer,
        };

        // collapsed: true agar berupa popup option / tombol melayang
        L.control
          .layers(baseMaps, overlayMaps, { collapsed: true })
          .addTo(map);

        // Zoom / Fit bounds logic
        if (targetRwLayer && "getBounds" in targetRwLayer) {
          map.fitBounds((targetRwLayer as L.GeoJSON).getBounds(), { padding: [40, 40] });
        } else if (desaData) {
          const mainDesaBounds = desaLayer.getBounds();
          if (mainDesaBounds.isValid()) {
            map.fitBounds(mainDesaBounds, { padding: [30, 30] });
          }
        } else if (rwLayer.getBounds().isValid()) {
          map.fitBounds(rwLayer.getBounds(), { padding: [20, 20] });
        }

        setIsLoading(false);
        setTimeout(invalidate, 150);
      })
      .catch((err) => {
        console.error("Gagal memuat data WebGIS:", err);
        if (isSubscribed) {
          setError("Gagal memuat data peta WebGIS. Pastikan file GeoJSON tersedia.");
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", invalidate);
      map.remove();
      mapRef.current = null;
    };
  }, [focusedRwId, showDesaLainByDefault, showRwByDefault]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-md bg-slate-900 ${className}`}>
      <style jsx global>{`
        .leaflet-div-icon.sarana-icon-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .labeldesa {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #d32f2f !important;
          font-weight: bold !important;
          font-size: 14px !important;
          text-shadow: 1px 1px white, -1px -1px white, 1px -1px white, -1px 1px white !important;
        }
        .labeldesalain {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #4a148c !important;
          font-weight: bold !important;
          font-size: 13px !important;
          text-shadow: 1px 1px white, -1px -1px white, 1px -1px white, -1px 1px white !important;
        }
        .labelkec {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #000000 !important;
          font-weight: bold !important;
          font-size: 15px !important;
          letter-spacing: 0.5px !important;
          text-transform: uppercase !important;
          text-shadow: 1px 1px white, -1px -1px white, 1px -1px white, -1px 1px white !important;
        }
        .leaflet-control-layers {
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
          padding: 8px 12px !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(4px) !important;
        }
      `}</style>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
          <p className="text-xs font-semibold text-muted-foreground">Memuat WebGIS Kelurahan...</p>
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-destructive/10 text-destructive">
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : (
        <div ref={containerRef} style={{ height }} className="w-full z-10" />
      )}
    </div>
  );
}
