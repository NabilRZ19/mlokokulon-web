"use client";

import { useEffect, useRef, useState } from "react";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ clientX: 0, clientY: 0, startX: 0, startY: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDim, setNaturalDim] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const CROP_VIEWPORT_SIZE = 250; // Ukuran container modal di UI

  // Reset state saat imageSrc baru dimuat
  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [imageSrc]);

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
    const deltaX = clientX - dragStart.clientX;
    const deltaY = clientY - dragStart.clientY;
    setOffset({
      x: dragStart.startX + deltaX,
      y: dragStart.startY + deltaY,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // Hitung skala penyesuaian agar gambar pas (cover) di dalam viewport 250px
  const fitScale =
    naturalDim.w > 0 && naturalDim.h > 0
      ? Math.max(CROP_VIEWPORT_SIZE / naturalDim.w, CROP_VIEWPORT_SIZE / naturalDim.h)
      : 1;

  const displayedW = naturalDim.w * fitScale;
  const displayedH = naturalDim.h * fitScale;

  function handleSaveCrop() {
    if (!imgRef.current || naturalDim.w === 0 || naturalDim.h === 0) return;

    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const outputSize = 400; // Output standar pasfoto WebP 400x400
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Bersihkan canvas dengan background putih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Hitung posisi penggambaran di canvas 400x400 relatif terhadap viewport 250px
    const scaleFactor = outputSize / CROP_VIEWPORT_SIZE;

    const currentRenderW = displayedW * zoom;
    const currentRenderH = displayedH * zoom;

    const baseCenterX = CROP_VIEWPORT_SIZE / 2;
    const baseCenterY = CROP_VIEWPORT_SIZE / 2;

    const drawX = (baseCenterX - currentRenderW / 2 + offset.x) * scaleFactor;
    const drawY = (baseCenterY - currentRenderH / 2 + offset.y) * scaleFactor;
    const drawW = currentRenderW * scaleFactor;
    const drawH = currentRenderH * scaleFactor;

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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-2xl space-y-4 p-5"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-heading text-base font-extrabold text-foreground">
              Potong Foto Pejabat (Manual Crop)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Geser (drag) foto &amp; gunakan slider zoom untuk menyesuaikan posisi wajah.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground hover:bg-destructive hover:text-white text-sm font-bold"
          >
            ×
          </button>
        </div>

        {/* Interactive Crop Viewport (250x250px Circle Viewport) */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className="relative h-[250px] w-[250px] overflow-hidden rounded-full border-4 border-primary bg-black/90 cursor-grab active:cursor-grabbing shadow-inner select-none touch-none"
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
                marginTop: displayedH ? `-${displayedH / 2}px` : "-125px",
                marginLeft: displayedW ? `-${displayedW / 2}px` : "-125px",
                pointerEvents: "none",
              }}
            />

            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
                Memuat foto…
              </div>
            )}

            {/* Guideline Frame Overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-full border border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
          </div>

          <p className="text-[11px] font-semibold text-primary">
            Klik &amp; tahan lalu geser foto di dalam lingkaran untuk memposisikan wajah.
          </p>
        </div>

        {/* Zoom Slider */}
        <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Perbesar / Zoom:</span>
            <span className="font-mono text-primary">{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.8}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveCrop}
            className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90"
          >
            Gunakan Hasil Crop
          </button>
        </div>
      </div>
    </div>
  );
}
