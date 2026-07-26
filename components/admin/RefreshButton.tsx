"use client";

interface RefreshButtonProps {
  onClick?: () => void | Promise<void>;
  loading?: boolean;
}

export function RefreshButton({ onClick, loading }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
    >
      {loading ? "↻ Memuat…" : "↻ Muat Ulang Data"}
    </button>
  );
}
