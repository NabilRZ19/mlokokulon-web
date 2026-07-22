import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { RwPengurus } from "@/lib/types";

interface RwPengurusSectionProps {
  pengurusList: RwPengurus[];
}

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
function IconUserStar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-primary shrink-0"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconSprout() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-emerald-600 shrink-0"
    >
      <path d="M7 20h10" />
      <path d="M12 20v-8" />
      <path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" />
      <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7Z" />
    </svg>
  );
}

function IconUsersGroup() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-blue-600 shrink-0"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconBadgeCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-primary shrink-0"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function RwPengurusSection({ pengurusList }: RwPengurusSectionProps) {
  if (!pengurusList || pengurusList.length === 0) {
    return <p className="text-sm text-muted-foreground">Data pengurus belum tersedia.</p>;
  }

  // 1. Kelompok Tani (misal: Pendowo)
  const taniList = pengurusList.filter((p) =>
    p.jabatan.toLowerCase().includes("tani")
  );

  // 2. Karang Taruna (misal: REDHOSIN)
  const tarunaList = pengurusList.filter((p) =>
    p.jabatan.toLowerCase().includes("karang taruna") || p.jabatan.toLowerCase().includes("redhosin")
  );

  // 3. Pengurus RT (misal: Ketua RT 01, Sekretaris RT 01, dll)
  const rtList = pengurusList.filter(
    (p) =>
      p.jabatan.toLowerCase().includes("rt") &&
      !taniList.includes(p) &&
      !tarunaList.includes(p)
  );

  // Grouping RT by RT number/identifier
  const rtMap = new Map<string, { ketua?: RwPengurus; others: RwPengurus[] }>();
  rtList.forEach((p) => {
    // Extract RT name e.g., "RT 01" or "RT 02" or default "RT"
    const match = p.jabatan.match(/RT\s*\d+/i);
    const rtKey = match ? match[0].toUpperCase() : "RT";

    const current = rtMap.get(rtKey) || { others: [] };
    if (p.jabatan.toLowerCase().includes("ketua")) {
      current.ketua = p;
    } else {
      current.others.push(p);
    }
    rtMap.set(rtKey, current);
  });

  // 4. Inti RW (Ketua RW, Sekretaris RW, Bendahara RW)
  const rwCoreList = pengurusList.filter(
    (p) =>
      !taniList.includes(p) &&
      !tarunaList.includes(p) &&
      !rtList.includes(p)
  );

  const ketuaRw = rwCoreList.find((p) => p.jabatan.toLowerCase().includes("ketua"));
  const otherRwCore = rwCoreList.filter((p) => p !== ketuaRw);

  // Extract Nama Kelompok Tani (jika ada di jabatan)
  const namaKelompokTani =
    taniList.length > 0
      ? taniList[0].jabatan.match(/Kelompok Tani\s+([\w\s]+)/i)?.[1] || "Kelompok Tani"
      : "Kelompok Tani";

  // Extract Nama Karang Taruna (jika ada di jabatan)
  const namaKarangTaruna =
    tarunaList.length > 0
      ? tarunaList[0].jabatan.match(/Karang Taruna\s+([\w\s]+)/i)?.[1] || "Karang Taruna"
      : "Karang Taruna";

  return (
    <div className="space-y-8">
      {/* ── 1. HIGHLIGHT KETUA RW & PENGURUS INTI RW ────────────────────── */}
      <Card className="p-6 sm:p-7">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <IconUserStar />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Pengurus Inti RW</h3>
            <p className="text-xs text-muted-foreground">Pimpinan dan Pengurus Wilayah RW</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Highlight Utama: Ketua RW */}
          {ketuaRw ? (
            <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-white shadow">
                    {ketuaRw.nama.charAt(0)}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
                      <IconBadgeCheck />
                      {ketuaRw.jabatan}
                    </span>
                    <h4 className="font-heading text-xl font-extrabold text-foreground mt-0.5">
                      {ketuaRw.nama}
                    </h4>
                  </div>
                </div>
                <Badge variant="default">Pimpinan RW</Badge>
              </div>
            </div>
          ) : null}

          {/* Pengurus Inti Lainnya (Sekretaris RW, Bendahara RW) */}
          {otherRwCore.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              {otherRwCore.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5 shadow-xs"
                >
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{p.jabatan}</p>
                    <p className="font-heading text-sm font-semibold text-foreground mt-0.5">
                      {p.nama}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ── 2. HIGHLIGHT KETUA RT & PENGURUS RT ─────────────────────────── */}
      {rtMap.size > 0 && (
        <Card className="p-6 sm:p-7">
          <div className="border-b border-border pb-4">
            <h3 className="font-heading text-lg font-bold text-foreground">Pengurus Rukun Tetangga (RT)</h3>
            <p className="text-xs text-muted-foreground">Ketua RT dan jajaran pengurus RT di lingkungan RW</p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {Array.from(rtMap.entries()).map(([rtName, data]) => (
              <div
                key={rtName}
                className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
              >
                {/* Highlight Utama Ketua RT */}
                {data.ketua ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        {data.ketua.jabatan}
                      </span>
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {rtName}
                      </span>
                    </div>
                    <p className="font-heading text-base font-extrabold text-foreground mt-1">
                      {data.ketua.nama}
                    </p>
                  </div>
                ) : (
                  <div className="font-heading text-sm font-bold text-primary">{rtName}</div>
                )}

                {/* Anggota RT Lainnya */}
                {data.others.length > 0 && (
                  <ul className="divide-y divide-border/60 text-xs">
                    {data.others.map((p, i) => (
                      <li key={i} className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground font-medium">{p.jabatan}</span>
                        <span className="font-semibold text-foreground">{p.nama}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 3. ORGANISASI UTAMA (Kelompok Tani & Karang Taruna) ───────────── */}
      {(taniList.length > 0 || tarunaList.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-xl font-bold text-foreground">
              Organisasi &amp; Kemasyarakatan Utama
            </h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Kelompok Tani ────────────────────────────────────────────── */}
            {taniList.length > 0 && (
              <Card className="flex flex-col justify-between border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 via-card to-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-emerald-100 pb-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100/80">
                      <IconSprout />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        Organisasi Pertanian
                      </span>
                      <h4 className="font-heading text-lg font-extrabold text-foreground">
                        Kelompok Tani {namaKelompokTani !== "Kelompok Tani" ? namaKelompokTani : ""}
                      </h4>
                    </div>
                  </div>

                  {/* Highlight Ketua Kelompok Tani */}
                  {(() => {
                    const ketuaTani = taniList.find((p) => p.jabatan.toLowerCase().includes("ketua"));
                    const otherTani = taniList.filter((p) => p !== ketuaTani);

                    return (
                      <div className="space-y-3">
                        {ketuaTani && (
                          <div className="rounded-lg border border-emerald-300/70 bg-emerald-100/50 p-4">
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                              {ketuaTani.jabatan}
                            </span>
                            <p className="font-heading text-lg font-extrabold text-foreground mt-0.5">
                              {ketuaTani.nama}
                            </p>
                          </div>
                        )}

                        {/* Pengurus Tani Lainnya */}
                        {otherTani.length > 0 && (
                          <div className="space-y-2 pt-1 text-sm">
                            {otherTani.map((p, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-md border border-border bg-card px-3.5 py-2 text-xs"
                              >
                                <span className="text-muted-foreground font-medium">{p.jabatan}</span>
                                <span className="font-bold text-foreground">{p.nama}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </Card>
            )}

            {/* ── Karang Taruna ────────────────────────────────────────────── */}
            {tarunaList.length > 0 && (
              <Card className="flex flex-col justify-between border-blue-200/80 bg-gradient-to-b from-blue-50/40 via-card to-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-blue-100 pb-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100/80">
                      <IconUsersGroup />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        Kepemudaan &amp; Kepemimpinan
                      </span>
                      <h4 className="font-heading text-lg font-extrabold text-foreground">
                        Karang Taruna {namaKarangTaruna !== "Karang Taruna" ? namaKarangTaruna : ""}
                      </h4>
                    </div>
                  </div>

                  {/* Highlight Ketua Karang Taruna */}
                  {(() => {
                    const ketuaTaruna = tarunaList.find((p) => p.jabatan.toLowerCase().includes("ketua") && !p.jabatan.toLowerCase().includes("wakil"));
                    const otherTaruna = tarunaList.filter((p) => p !== ketuaTaruna);

                    return (
                      <div className="space-y-3">
                        {ketuaTaruna && (
                          <div className="rounded-lg border border-blue-300/70 bg-blue-100/50 p-4">
                            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                              {ketuaTaruna.jabatan}
                            </span>
                            <p className="font-heading text-lg font-extrabold text-foreground mt-0.5">
                              {ketuaTaruna.nama}
                            </p>
                          </div>
                        )}

                        {/* Pengurus Karang Taruna Lainnya */}
                        {otherTaruna.length > 0 && (
                          <div className="space-y-2 pt-1 text-sm">
                            {otherTaruna.map((p, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-md border border-border bg-card px-3.5 py-2 text-xs"
                              >
                                <span className="text-muted-foreground font-medium">{p.jabatan}</span>
                                <span className="font-bold text-foreground">{p.nama}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
