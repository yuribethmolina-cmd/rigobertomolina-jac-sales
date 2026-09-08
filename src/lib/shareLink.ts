/** Utilidades de compartir con respaldo garantizado (funciona dentro de iframes). */

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* seguimos con el método alternativo */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

/**
 * Intenta compartir de forma nativa; si no está disponible o el navegador lo
 * bloquea (por ejemplo dentro de un iframe), copia el enlace.
 * Devuelve "shared" | "copied" | "failed" | "cancelled".
 */
export const shareOrCopy = async (data: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "copied" | "failed" | "cancelled"> => {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      /* bloqueado: caemos al copiado */
    }
  }
  return (await copyToClipboard(data.url)) ? "copied" : "failed";
};
