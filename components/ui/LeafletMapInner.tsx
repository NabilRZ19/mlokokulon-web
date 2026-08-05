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

// ===============================
// ICON SVG SARANA (custom, flat-outline — sama persis dengan script.js)
// ===============================
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

// ===============================
// WARNA SARANA (per jenis)
// ===============================
function getWarna(jenis: string): string {
  switch (jenis) {
    case "Masjid":    return "#2E7D32";
    case "Sekolah":   return "#1976D2";
    case "Lapangan":  return "#43A047";
    case "Pemerintah":return "#F57C00";
    case "Kesehatan": return "#D32F2F";
    case "UMKM":      return "#8E24AA";
    case "KMP":       return "#00838F";
    default:          return "#616161";
  }
}

// ===============================
// WARNA RW
// ===============================
function getRWColor(rw: number | string): string {
  switch (Number(rw)) {
    case 1:  return "#e41a1c";
    case 2:  return "#377eb8";
    case 3:  return "#4daf4a";
    case 4:  return "#984ea3";
    case 5:  return "#ff7f00";
    case 6:  return "#a65628";
    case 7:  return "#f781bf";
    case 8:  return "#00acc1";
    case 9:  return "#8BC34A";
    case 10: return "#795548";
    default: return "#999999";
  }
}

// ===============================
// BADGE SVG SARANA
// ===============================
// Satu fungsi sumber untuk badge sarana — dipakai marker DI PETA
// maupun entri DI LEGENDA (panel layer control custom).
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
    `<span class="${kelas}" style="background:${warna};width:${ukuranBadge}px;height:${ukuranBadge}px;">` +
    `<svg viewBox="0 0 24 24" width="${ukuranIkon}" height="${ukuranIkon}">${glyph}</svg>` +
    `</span>`
  );
}

function createSaranaIcon(jenis: string): L.DivIcon {
  const html = saranaBadgeHtml(jenis, 30, 16);
  return L.divIcon({
    html,
    className: "sarana-icon-wrapper",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

// Versi kecil badge sarana, khusus untuk baris legenda di panel custom control
function legendBadgeSarana(jenis: string): string {
  return saranaBadgeHtml(jenis, 18, 11, "legend-badge");
}

// ===============================
// SWATCH GARIS LEGENDA (SVG inline)
// ===============================
function legendLineHtml(
  mode: "casing" | "solid",
  warna: string,
  dash?: string | null,
  tebal?: number
): string {
  const w = 42, h = 14, y = h / 2;

  let svg = `<svg width="${w}" height="${h}" class="legend-line">`;
  if (mode === "casing") {
    svg += `<line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="#ffffff" stroke-width="6"/>`;
    svg += `<line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="${warna}" stroke-width="2.6"/>`;
    svg += `<line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="${dash}"/>`;
  } else {
    svg += `<line x1="2" y1="${y}" x2="${w - 2}" y2="${y}" stroke="${warna}" stroke-width="${tebal || 3}"${
      dash ? ` stroke-dasharray="${dash}"` : ""
    }/>`;
  }
  svg += "</svg>";
  return svg;
}

// ===============================
// BARIS CHECKBOX PANEL CONTROL
// ===============================
function barisCheckbox(key: string, iconHtml: string, teks: string, checked: boolean): string {
  return (
    `<label class="lc-row" data-key="${key}">` +
    `<input type="checkbox"${checked ? " checked" : ""}>` +
    iconHtml +
    `<span>${teks}</span>` +
    `</label>`
  );
}

// ===============================
// GARIS CASING (halo putih + garis utama + putus-putus)
// ===============================
function buatGarisCasing(data: any, opsi: any): L.LayerGroup {
  const filter = opsi.filter;

  const halo = L.geoJSON(data, {
    filter,
    style: {
      color: "#ffffff",
      weight: 7,
      opacity: 1,
      fillOpacity: 0,
    },
  });

  const utama = L.geoJSON(data, {
    filter,
    style: {
      color: opsi.warnaGaris || "#1a1a1a",
      weight: 3,
      opacity: 1,
      fillOpacity: 0,
    },
  });

  const putus = L.geoJSON(data, {
    filter,
    style: {
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      dashArray: opsi.dashPattern,
      fillOpacity: 0,
    },
    onEachFeature(feature, layer) {
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

    // ===============================
    // BASEMAP
    // ===============================
    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri", maxZoom: 19 }
    );

    const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    });

    const map = L.map(containerRef.current, {
      center: [-7.84, 111.08],
      zoom: 15,
      layers: [satellite],
    });
    mapRef.current = map;

    // Invalidate size agar peta render dengan benar di layout dinamis
    const invalidate = () => { if (mapRef.current) mapRef.current.invalidateSize(); };
    const timer1 = setTimeout(invalidate, 100);
    const timer2 = setTimeout(invalidate, 400);
    window.addEventListener("resize", invalidate);

    // ===============================
    // STYLE LABEL TOOLTIP
    // ===============================
    const labelDesa      = { permanent: true, direction: "center" as const, className: "labeldesa" };
    const labelRW        = { permanent: true, direction: "center" as const, className: "labelrw" };
    const labelDesaLain  = { permanent: true, direction: "center" as const, className: "labeldesalain" };
    const labelKecamatan = { permanent: true, direction: "center" as const, className: "labelkec" };

    // ===============================
    // FETCH GEOJSON
    // ===============================
    const fetchGeoJSON = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Gagal memuat ${url} (HTTP ${res.status})`);
      return res.json();
    };

    Promise.all([
      fetchGeoJSON("/data/DesaNgadirojo.geojson"),
      fetchGeoJSON("/data/MlokoFIX.geojson"),
      fetchGeoJSON("/data/WonogiriWADMKC.geojson"),
      fetchGeoJSON("/data/TitikSarana.geojson"),
    ])
      .then(([desaData, rwData, kecamatanData, saranaGeojson]) => {
        if (!isSubscribed || !mapRef.current) return;

        const targetRwNum = focusedRwId
          ? parseInt(focusedRwId.replace(/\D/g, ""), 10)
          : null;

        // Nama desa utama diambil otomatis dari data RW
        const NAMA_DESA_UTAMA =
          (rwData.features[0] && rwData.features[0].properties.WADMKD) || "Mlokomanis Kulon";

        // -----------------------------------------------
        // 1. BATAS DESA UTAMA — hanya outline, tanpa fill
        // -----------------------------------------------
        const desaLayer = L.geoJSON(desaData, {
          filter: (feature) => feature.properties.WADMKD === NAMA_DESA_UTAMA,
          style: {
            color: "#C62828",
            weight: 4,
            fillOpacity: 0,
          },
          onEachFeature: (feature, layer) => {
            layer.bindTooltip(feature.properties.WADMKD, labelDesa);
          },
        }).addTo(map);

        // -----------------------------------------------
        // 2. BATAS DESA/KELURAHAN LAIN (garis casing)
        // Tidak tampil di awal (checkbox kosong)
        // -----------------------------------------------
        const desaLainLayer = buatGarisCasing(desaData, {
          filter: (feature: any) => feature.properties.WADMKD !== NAMA_DESA_UTAMA,
          dashPattern: DASH_DESA_LAIN,
          warnaGaris: "#1a1a1a",
          labelKey: "WADMKD",
          labelStyle: labelDesaLain,
        });

        if (showDesaLainByDefault) desaLainLayer.addTo(map);

        // -----------------------------------------------
        // 3. BATAS RW
        // -----------------------------------------------
        let targetRwLayer: L.Layer | null = null;

        const rwLayer = L.geoJSON(rwData, {
          style: (feature) => {
            const rwNum = Number(feature?.properties.BATASRW);

            // MODE DETAIL RW: hanya RW aktif berwarna, sisanya monochrome
            if (targetRwNum !== null) {
              const isFocused = rwNum === targetRwNum;
              if (isFocused) {
                return { color: "#ffffff", weight: 3, fillColor: getRWColor(rwNum), fillOpacity: 0.55 };
              } else {
                return { color: "#94a3b8", weight: 1, fillColor: "#64748b", fillOpacity: 0.08 };
              }
            }

            // MODE UMUM: semua RW berwarna
            return {
              color: "#333",
              weight: 1,
              fillColor: getRWColor(rwNum),
              fillOpacity: 0.45,
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
              `<span style="font-size:12px;color:#475569;">Lingkungan : ${lingkungan}</span>` +
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
              mouseout: (e) => { rwLayer.resetStyle(e.target); },
            });
          },
        });

        if (showRwByDefault) rwLayer.addTo(map);

        // -----------------------------------------------
        // 4. BATAS KECAMATAN (garis casing, tidak tampil di awal)
        // -----------------------------------------------
        const kecamatanLayer = buatGarisCasing(kecamatanData, {
          dashPattern: DASH_KECAMATAN,
          warnaGaris: "#000000",
          labelKey: "WADMKC",
          labelStyle: labelKecamatan,
        });

        // -----------------------------------------------
        // 5. SARANA
        // -----------------------------------------------

        // Popup dengan tombol Google Maps untuk semua sarana/lokasi
        function popupSarana(feature: any, layer: L.Layer) {
          const name = feature.properties?.Nama || "Lokasi Sarana";
          const jenis = feature.properties?.Jenis || "-";
          const link = feature.properties?.GmapsLink;

          let gmapsUrl = link;
          if (!gmapsUrl) {
            const latlng = (layer as any).getLatLng ? (layer as any).getLatLng() : null;
            if (latlng) {
              gmapsUrl = `https://www.google.com/maps?q=${latlng.lat},${latlng.lng}`;
            } else {
              gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " Mlokomanis Kulon Wonogiri")}`;
            }
          }

          const tombolGmaps = `<a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-gmaps">📍 Buka di Google Maps</a>`;

          layer.bindPopup(
            `<div class="popup-sarana">` +
            `<strong style="font-size:14px;color:#0f172a;display:block;margin-bottom:2px;">${name}</strong>` +
            `<span style="font-size:12px;color:#64748b;">Jenis : ${jenis}</span><br>` +
            tombolGmaps +
            `</div>`
          );
        }

        function buatSaranaLayer(jenis: string) {
          return L.geoJSON(saranaGeojson, {
            filter: (feature) => feature.properties.Jenis === jenis,
            pointToLayer: (_feature, latlng) =>
              L.marker(latlng, { icon: createSaranaIcon(jenis) }),
            onEachFeature: popupSarana,
          });
        }

        const masjidLayer    = buatSaranaLayer("Masjid");
        const sekolahLayer   = buatSaranaLayer("Sekolah");
        const lapanganLayer  = buatSaranaLayer("Lapangan");
        const pemerintahLayer= buatSaranaLayer("Pemerintah");
        const kesehatanLayer = buatSaranaLayer("Kesehatan");
        const umkmLayer      = buatSaranaLayer("UMKM");
        const kmpLayer       = buatSaranaLayer("KMP");
        const lainnyaLayer   = buatSaranaLayer("Lainnya");

        // Semua kategori sarana tampil default
        masjidLayer.addTo(map);
        sekolahLayer.addTo(map);
        lapanganLayer.addTo(map);
        pemerintahLayer.addTo(map);
        kesehatanLayer.addTo(map);
        umkmLayer.addTo(map);
        kmpLayer.addTo(map);
        lainnyaLayer.addTo(map);

        // desaLainLayer & kecamatanLayer SENGAJA tidak addTo(map) di sini —
        // checkbox-nya kosong (belum dicentang) saat peta pertama dibuka.

        // -----------------------------------------------
        // 6. CUSTOM LAYER CONTROL
        // Dibangun setelah semua layer pasti terisi (bukan undefined),
        // sehingga checkbox-nya pasti muncul dengan benar.
        // -----------------------------------------------

        const saranaKeys = ["masjid", "sekolah", "lapangan", "pemerintah", "kesehatan", "umkm", "kmp", "lainnya"];

        const layerByKey: Record<string, L.Layer | L.LayerGroup> = {
          desaUtama:   desaLayer,
          desaLain:    desaLainLayer,
          rw:          rwLayer,
          kecamatan:   kecamatanLayer,
          masjid:      masjidLayer,
          sekolah:     sekolahLayer,
          lapangan:    lapanganLayer,
          pemerintah:  pemerintahLayer,
          kesehatan:   kesehatanLayer,
          umkm:        umkmLayer,
          kmp:         kmpLayer,
          lainnya:     lainnyaLayer,
        };

        const CustomLayerControl = L.Control.extend({
          options: { position: "topright" },

          onAdd() {
            const container = L.DomUtil.create("div", "custom-layer-control-wrapper");

            // ---- Tombol toggle (selalu terlihat) ----
            const toggleBtn = L.DomUtil.create("button", "lc-toggle-btn", container);
            toggleBtn.setAttribute("title", "Tampilkan/Sembunyikan Layer");
            toggleBtn.innerHTML =
              `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
              `<polygon points="3 6 10 3 17 6 22 3 22 15 17 18 10 15 3 18"/>` +
              `<line x1="10" y1="3" x2="10" y2="15"/>` +
              `<line x1="17" y1="6" x2="17" y2="18"/>` +
              `</svg>`;

            // ---- Panel isi filter ----
            const panel = L.DomUtil.create("div", "custom-layer-control leaflet-bar", container);
            // Default: tertutup
            panel.classList.add("lc-panel-hidden");

            panel.innerHTML =
              // BASEMAP
              `<div class="lc-basemap">` +
              `<label class="lc-row"><input type="radio" name="lc-basemap" value="satellite" checked> 🛰 Satellite</label>` +
              `<label class="lc-row"><input type="radio" name="lc-basemap" value="street"> 🗺 Street</label>` +
              `</div>` +

              `<hr>` +

              // BATAS ADMINISTRASI
              `<div class="lc-section-header">BATAS ADMINISTRASI</div>` +
              barisCheckbox("desaUtama", legendLineHtml("solid", "#C62828", null, 4), "Batas Kelurahan (Utama)", true) +
              barisCheckbox("desaLain",  legendLineHtml("casing", "#1a1a1a", DASH_DESA_LAIN), "Desa/Kelurahan Lain", false) +
              barisCheckbox("rw",        `<span class="legend-swatch" style="background:#4daf4a"></span>`, "Wilayah RW (Filter)", showRwByDefault) +
              barisCheckbox("kecamatan", legendLineHtml("casing", "#000000", DASH_KECAMATAN), "Batas Kecamatan", false) +

              `<hr>` +

              // SARANA — master checkbox
              `<label class="lc-row lc-master" data-key="saranaMaster">` +
              `<input type="checkbox" checked> <b>SARANA</b>` +
              `</label>` +

              barisCheckbox("masjid",     legendBadgeSarana("Masjid"),     "Masjid",     true) +
              barisCheckbox("sekolah",    legendBadgeSarana("Sekolah"),    "Sekolah",    true) +
              barisCheckbox("lapangan",   legendBadgeSarana("Lapangan"),   "Lapangan",   true) +
              barisCheckbox("pemerintah", legendBadgeSarana("Pemerintah"), "Pemerintah", true) +
              barisCheckbox("kesehatan",  legendBadgeSarana("Kesehatan"),  "Kesehatan",  true) +
              barisCheckbox("umkm",       legendBadgeSarana("UMKM"),       "UMKM",       true) +
              barisCheckbox("kmp",        legendBadgeSarana("KMP"),        "KMP",        true) +
              barisCheckbox("lainnya",    legendBadgeSarana("Lainnya"),    "Lainnya",    true);

            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            // Toggle panel saat tombol diklik
            toggleBtn.addEventListener("click", () => {
              const isHidden = panel.classList.toggle("lc-panel-hidden");
              toggleBtn.classList.toggle("lc-toggle-active", !isHidden);
            });

            function pasangLepasLayer(layer: L.Layer | L.LayerGroup, nyala: boolean) {
              if (nyala) {
                if (!map.hasLayer(layer)) map.addLayer(layer);
              } else {
                if (map.hasLayer(layer)) map.removeLayer(layer);
              }
            }

            panel.addEventListener("change", function (e) {
              const target = e.target as HTMLInputElement;

              // --- Ganti basemap ---
              if (target.name === "lc-basemap") {
                if (target.value === "satellite") {
                  pasangLepasLayer(street, false);
                  pasangLepasLayer(satellite, true);
                } else {
                  pasangLepasLayer(satellite, false);
                  pasangLepasLayer(street, true);
                }
                return;
              }

              const row = (target as HTMLElement).closest("[data-key]");
              if (!row) return;
              const key = row.getAttribute("data-key")!;

              // --- Master "SARANA": nyalain/matiin semua kategori sekaligus ---
              if (key === "saranaMaster") {
                const nyala = target.checked;
                saranaKeys.forEach((k) => {
                  pasangLepasLayer(layerByKey[k], nyala);
                  const inputAnak = panel.querySelector<HTMLInputElement>(`[data-key="${k}"] input`);
                  if (inputAnak) inputAnak.checked = nyala;
                });
                return;
              }

              // --- Checkbox individual ---
              const layer = layerByKey[key];
              if (layer) pasangLepasLayer(layer, target.checked);

              // Sinkronisasi status checkbox master SARANA
              if (saranaKeys.indexOf(key) !== -1) {
                const inputMaster = panel.querySelector<HTMLInputElement>('[data-key="saranaMaster"] input');
                if (inputMaster) {
                  inputMaster.checked = saranaKeys.every((k) => map.hasLayer(layerByKey[k]));
                }
              }
            });

            return container;
          },
        });

        new CustomLayerControl().addTo(map);

        // -----------------------------------------------
        // 7. ZOOM / FIT BOUNDS
        // Zoom ke rwLayer (area RW — lebih presisi ke desa)
        // -----------------------------------------------
        if (targetRwLayer && "getBounds" in (targetRwLayer as object)) {
          map.fitBounds((targetRwLayer as L.GeoJSON).getBounds(), { padding: [40, 40] });
        } else if (rwLayer.getBounds().isValid()) {
          map.fitBounds(rwLayer.getBounds());
        } else if (desaLayer.getBounds().isValid()) {
          map.fitBounds(desaLayer.getBounds(), { padding: [30, 30] });
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
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <style jsx global>{`
        /* ================================
           BADGE ICON SARANA DI PETA
        ================================ */
        .leaflet-div-icon.sarana-icon-wrapper {
          background: transparent !important;
          border: none !important;
        }

        .sarana-badge {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.45);
        }

        .sarana-badge svg {
          fill: #ffffff;
          display: block;
        }

        /* Versi kecil badge — dipakai di legenda panel custom control */
        .sarana-badge.legend-badge {
          border-width: 1.5px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.35);
          flex-shrink: 0;
        }

        /* ================================
           LABEL TOOLTIP
        ================================ */
        .labeldesa {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #B71C1C !important;
          font-weight: bold !important;
          font-size: 14px !important;
          text-shadow: 1px 1px white, -1px -1px white, 1px -1px white, -1px 1px white !important;
        }

        .labelrw {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #0D47A1 !important;
          font-size: 10px !important;
          font-weight: bold !important;
          text-shadow: 1px 1px white, -1px -1px white, 1px -1px white, -1px 1px white !important;
        }

        .labeldesalain {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #4A148C !important;
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
          font-size: 16px !important;
          letter-spacing: 0.5px !important;
          text-transform: uppercase !important;
          text-shadow: 1px 1px white, -1px -1px white, 1px -1px white, -1px 1px white !important;
        }

        /* ================================
           WRAPPER & TOMBOL TOGGLE
        ================================ */
        .custom-layer-control-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .lc-toggle-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #ffffff;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #334155;
          transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
          flex-shrink: 0;
        }

        .lc-toggle-btn:hover {
          background: #f1f5f9;
          transform: scale(1.08);
        }

        .lc-toggle-btn.lc-toggle-active {
          background: #1a73e8;
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(26,115,232,0.45);
        }

        /* ================================
           CUSTOM LAYER CONTROL PANEL
        ================================ */
        .custom-layer-control {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          padding: 10px 14px;
          font-size: 13px;
          line-height: 1.7;
          max-height: 80vh;
          overflow-y: auto;
          min-width: 200px;
          /* Animasi muncul */
          transform-origin: top right;
          transition: opacity 0.2s ease, transform 0.2s ease;
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        /* State tersembunyi */
        .custom-layer-control.lc-panel-hidden {
          pointer-events: none;
          opacity: 0;
          transform: scale(0.92) translateY(-6px);
          max-height: 0;
          padding: 0;
          overflow: hidden;
          border: none;
          box-shadow: none;
        }

        .custom-layer-control hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 6px 0;
        }

        .custom-layer-control .lc-row {
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          white-space: nowrap;
        }

        .custom-layer-control .lc-row input {
          cursor: pointer;
          flex-shrink: 0;
          margin: 0;
        }

        .custom-layer-control .lc-basemap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .custom-layer-control .lc-section-header {
          font-size: 11px;
          font-weight: bold;
          color: #666666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 2px 0 3px;
        }

        .custom-layer-control .lc-row.lc-master {
          font-size: 11px;
          font-weight: bold;
          color: #444444;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 2px 0 3px;
        }

        .legend-swatch {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 1px solid #333;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .legend-line {
          flex-shrink: 0;
        }

        /* ================================
           POPUP SARANA
        ================================ */
        .popup-sarana {
          font-size: 13px;
          line-height: 1.5;
          min-width: 150px;
        }

        .btn-gmaps {
          display: block;
          margin-top: 10px;
          padding: 7px 10px;
          background: #1a73e8;
          color: #ffffff !important;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-decoration: none;
          text-align: center;
        }

        .btn-gmaps:hover {
          background: #1558b0;
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
