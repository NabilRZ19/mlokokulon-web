// Beda dari PlaceholderNotice (buat konten yang KOSONG total, mis. [DATA MENYUSUL]) — ini buat
// data yang SUDAH ada isinya (hasil riset) tapi belum dikonfirmasi resmi oleh kelurahan.
export function SementaraTag() {
  return (
    <span className="ml-auto shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-amber-700">
      Data sementara
    </span>
  );
}
