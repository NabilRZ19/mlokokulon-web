interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

// Dipakai di UMKM & Galeri (PRD Bagian 7 & 12 sebut eksplisit pagination di kedua halaman ini).
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-3 text-sm">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Sebelumnya
      </button>
      <span className="text-muted-foreground">
        Halaman {page} dari {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        Selanjutnya →
      </button>
    </div>
  );
}
