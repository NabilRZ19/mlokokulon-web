"use client";

import { useState } from "react";

interface ApprovalModalProps {
  isOpen: boolean;
  title: string;
  action: "approve" | "reject";
  onClose: () => void;
  onConfirm: (note: string) => void;
  isLoading?: boolean;
}

/**
 * Modal untuk konfirmasi approve/reject konten pending.
 * Menampilkan field catatan untuk penjelasan reviewer.
 */
export function ApprovalModal({
  isOpen,
  title,
  action,
  onClose,
  onConfirm,
  isLoading = false,
}: ApprovalModalProps) {
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const isApprove = action === "approve";

  function handleConfirm() {
    onConfirm(note);
    setNote("");
  }

  function handleClose() {
    setNote("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-200 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isApprove ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}>
            {isApprove ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-bold text-foreground">
              {isApprove ? "Setujui Konten" : "Tolak Konten"}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{title}</p>
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label htmlFor="modal-note" className="mb-1.5 block text-sm font-bold text-foreground">
            {isApprove ? "Catatan (opsional)" : "Alasan Penolakan *"}
          </label>
          <textarea
            id="modal-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isApprove
                ? "Catatan tambahan untuk pengusul (opsional)…"
                : "Jelaskan alasan penolakan agar pengusul dapat memperbaikinya…"
            }
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (!isApprove && !note.trim())}
            className={`rounded-lg px-5 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 transition-colors ${
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-destructive hover:bg-destructive/90"
            }`}
          >
            {isLoading
              ? (isApprove ? "Menyetujui…" : "Menolak…")
              : (isApprove ? "Ya, Setujui" : "Ya, Tolak")}
          </button>
        </div>
      </div>
    </div>
  );
}
