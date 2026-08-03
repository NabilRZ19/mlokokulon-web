/**
/** Helper untuk auto-scroll secara halus ke elemen form pertama yang belum terisi / error
 */
export function scrollToFirstError(elementIds: string[]) {
  setTimeout(() => {
    for (const id of elementIds) {
      const el = document.getElementById(id) || document.querySelector<HTMLElement>(`[name="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof el.focus === "function") {
          el.focus();
        }
        break;
      }
    }
  }, 50);
}
