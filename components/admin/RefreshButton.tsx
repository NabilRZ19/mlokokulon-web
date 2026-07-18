"use client";

// Pengganti realtime listener (dilarang di panel admin, aturan kritikal PRD Bagian 7 poin 1) —
// onClick masih kosong, nanti diisi re-fetch data beneran (getDocs fetch-once).
export function RefreshButton() {
  return (
    <button
      type="button"
      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
    >
      ↻ Muat Ulang Data
    </button>
  );
}
