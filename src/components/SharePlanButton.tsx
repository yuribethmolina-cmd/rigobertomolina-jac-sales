import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  /** Título de lo que se comparte (nombre del plan o de la sección). */
  title: string;
  /** Ruta absoluta del sitio, incluyendo ancla. Ej: /financiamiento/planes#plan-pago-facil */
  path: string;
  className?: string;
  label?: string;
}

const SITE_ORIGIN = "https://rigobertomolina.com";

const buildUrl = (path: string) => {
  const origin =
    typeof window !== "undefined" && window.location.origin.includes("rigobertomolina.com")
      ? window.location.origin
      : SITE_ORIGIN;
  return `${origin}${path}`;
};

const copyToClipboard = async (text: string) => {
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

const SharePlanButton = ({ title, path, className = "", label = "Compartir" }: Props) => {
  const [done, setDone] = useState(false);
  const [manualUrl, setManualUrl] = useState<string | null>(null);

  const handleShare = async () => {
    const url = buildUrl(path);
    const text = `${title} — Rigoberto Molina, vendedor JAC: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        /* si el compartir nativo no está permitido, copiamos el enlace */
      }
    }

    const copied = await copyToClipboard(url);
    if (copied) {
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
      toast.success("Enlace copiado", {
        description: "Ya puedes pegarlo en WhatsApp para enviarlo al cliente.",
      });
      return;
    }

    setManualUrl(url);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Compartir enlace de ${title}`}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 font-heading text-sm font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors ${className}`}
      >
        {done ? <Check size={14} /> : <Share2 size={14} />}
        {done ? "Copiado" : label}
      </button>

      <Dialog open={manualUrl !== null} onOpenChange={(o) => !o && setManualUrl(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Copia el enlace</DialogTitle>
            <DialogDescription>
              Mantén presionado sobre el enlace para copiarlo y enviarlo por WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <input
            readOnly
            value={manualUrl ?? ""}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
          />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title}: ${manualUrl ?? ""}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Copy size={14} /> Enviar por WhatsApp
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SharePlanButton;
