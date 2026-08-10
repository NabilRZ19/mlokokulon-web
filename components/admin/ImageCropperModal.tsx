"use client";

import { useEffect, useRef, useState } from "react";

export type CropRatio = "1:1" | "16:9" | "4:3" | "3:2" | "3:4" | "9:16";

interface RatioOption {
  value: CropRatio;
  label: string;
  w: number;
  h: number;
}

const RATIO_OPTIONS: RatioOption[] = [
  { value: "16:9", label: "16:9 Landscape", w: 16, h: 9 },
  { value: "4:3",  label: "4:3 Standar",   w: 4,  h: 3 },
  { value: "3:2",  label: "3:2 Foto",       w: 3,  h: 2 },
  { value: "1:1",  label: "1:1 Persegi",    w: 1,  h: 1 },
  { value: "3:4",  label: "3:4 Potret",     w: 3,  h: 4 },
  { value: "9:16", label: "9:16 Vertikal",  w: 9,  h: 16 },
];

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
  /** "avatar" = circular pasfoto (fixed 1:1), "cover" = rectangular with ratio picker */
  mode?: "avatar" | "cover";
  /** Default ratio for cover mode */
  defaultRatio?: CropRatio;
  /** Limit which ratios are shown in cover mode */
  allowedRatios?: CropRatio[];
  /** Output canvas size in pixels (longest side) */
  outputSize?: number;
}

// Size of the visible crop viewport in the UI (px)
const BASE_VIEWPORT = 280;

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  mode = "avatar",
  defaultRatio = "16:9",
  allowedRatios,
  outputSize = 1200,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ clientX: 0, clientY: 0, startX: 0, startY: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDim, setNaturalDim] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [selectedRatio, setSelectedRatio] = useState<CropRatio>(defaultRatio);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const ratioOptions =
    mode === "avatar"
      ? RATIO_OPTIONS.filter((r) => r.value === "1:1")
      : allowedRatios
      ? RATIO_OPTIONS.filter((r) => allowedRatios.includes(r.value))
      : RATIO_OPTIONS;

  const activeRatio =
    mode === "avatar"
      ? RATIO_OPTIONS.find((r) => r.value === "1:1")!
      : RATIO_OPTIONS.find((r) => r.value === selectedRatio) ?? RATIO_OPTIONS[0];

  // Viewport dimensions
  const vpW =
    activeRatio.w >= activeRatio.h
      ? BASE_VIEWPORT
      : Math.round(BASE_VIEWPORT * (activeRatio.w / activeRatio.h));
  const vpH =
    activeRatio.h >= activeRatio.w
      ? BASE_VIEWPORT
      : Math.round(BASE_VIEWPORT * (activeRatio.h / activeRatio.w));

  // Reset state when a new image is loaded or ratio changes
  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [imageSrc]);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [selectedRatio]);

  if (!isOpen || !imageSrc) return null;

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setNaturalDim({ w: img.naturalWidth, h: img.naturalHeight });
    }
    setImageLoaded(true);
  }

  function handleMouseDown(e: React.MouseEvent | React.TouchEvent) {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ clientX, clientY, startX: offset.x, startY: offset.y });
  }

  function handleMouseMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: dragStart.startX + (clientX - dragStart.clientX),
      y: dragStart.startY + (clientY - dragStart.clientY),
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // Scale image to cover the viewport
  const fitScale =
    naturalDim.w > 0 && naturalDim.h > 0
      ? Math.max(vpW / naturalDim.w, vpH / naturalDim.h)
      : 1;

  const displayedW = naturalDim.w * fitScale;
  const displayedH = naturalDim.h * fitScale;

  function handleSaveCrop() {
    if (!imgRef.current || naturalDim.w === 0 || naturalDim.h === 0) return;

    const img = imgRef.current;
    const canvas = document.createElement("canvas");

    // Output canvas dimensions preserve ratio at the target size
    let outW: number, outH: number;
    if (mode === "avatar") {
      outW = outH = Math.min(outputSize, 600);
    } else {
      const longestSide = Math.min(outputSize, 1920);
      if (activeRatio.w >= activeRatio.h) {
        outW = longestSide;
        outH = Math.round(longestSide * (activeRatio.h / activeRatio.w));
      } else {
        outH = longestSide;
        outW = Math.round(longestSide * (activeRatio.w / activeRatio.h));
      }
    }

    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);

    const scaleX = outW / vpW;
    const scaleY = outH / vpH;

    const currentRenderW = displayedW * zoom;
    const currentRenderH = displayedH * zoom;

    const baseCenterX = vpW / 2;
    const baseCenterY = vpH / 2;

    const drawX = (baseCenterX - currentRenderW / 2 + offset.x) * scaleX;
    const drawY = (baseCenterY - currentRenderH / 2 + offset.y) * scaleY;
    const drawW = currentRenderW * scaleX;
    const drawH = currentRenderH * scaleY;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const previewUrl = URL.createObjectURL(blob);
        onCropComplete(blob, previewUrl);
        onClose();
      },
      "image/webp",
      0.92
    );
  }

  const isRound = mode === "avatar";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 pb-4">
          <div>
            <h3 className="font-heading text-base font-extrabold text-foreground">
              {isRound ? "Potong Foto Pejabat" : "Potong & Sesuaikan Foto"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRound
                ? "Geser dan zoom untuk memposisikan wajah dalam lingkaran."
                : "Pilih rasio, geser, dan zoom untuk menyesuaikan area crop."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground hover:bg-destructive hover:text-white text-sm font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Ratio Picker — only shown in cover mode */}
          {!isRound && ratioOptions.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Pilih Rasio Crop</p>
              <div className="flex flex-wrap gap-2">
                {ratioOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedRatio(opt.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedRatio === opt.value
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-border bg-muted/50 text-foreground hover:border-primary/60 hover:bg-primary/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Crop Viewport */}
          <div className="flex flex-col items-center gap-3">
            <div
              style={{ width: vpW, height: vpH }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className={`relative overflow-hidden border-2 border-primary bg-black/90 cursor-grab active:cursor-grabbing shadow-inner select-none touch-none ${
                isRound ? "rounded-full" : "rounded-xl"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Cropping target"
                onLoad={handleImageLoad}
                style={{
                  width: displayedW ? `${displayedW}px` : "auto",
                  height: displayedH ? `${displayedH}px` : "auto",
                  maxWidth: "none",
                  maxHeight: "none",
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: displayedH ? `-${displayedH / 2}px` : `-${vpH / 2}px`,
                  marginLeft: displayedW ? `-${displayedW / 2}px` : `-${vpW / 2}px`,
                  pointerEvents: "none",
                }}
              />

              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
                  Memuat foto…
                </div>
              )}

              {/* Rule-of-thirds grid overlay for cover mode */}
              {!isRound && imageLoaded && (
                <div className="pointer-events-none absolute inset-0">
                  {/* Vertical thirds */}
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/20" />
                  <div className="absolute inset-y-0 right-1/3 w-px bg-white/20" />
                  {/* Horizontal thirds */}
                  <div className="absolute inset-x-0 top-1/3 h-px bg-white/20" />
                  <div className="absolute inset-x-0 bottom-1/3 h-px bg-white/20" />
                  {/* Corner frame */}
                  <div className="absolute inset-0 border border-white/30 rounded-xl" />
                </div>
              )}

              {/* Avatar overlay */}
              {isRound && (
                <div className="pointer-events-none absolute inset-0 rounded-full border border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
              )}
            </div>

            <p className="text-[11px] font-semibold text-muted-foreground text-center">
              {isRound
                ? "Klik & tahan lalu geser untuk memposisikan wajah."
                : "Geser gambar untuk menyesuaikan posisi dalam frame."}
            </p>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <div className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
                <span>Zoom</span>
              </div>
              <span className="font-mono text-primary tabular-nums">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>50%</span>
              <span>400%</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-border p-4">
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Output: <span className="font-bold text-foreground">WebP</span>, kualitas tinggi
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
            >
              Gunakan Hasil Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
