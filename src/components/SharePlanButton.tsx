import { useState } from "react";
import { Share2, Check, MessageCircle } from "lucide-react";
import { shareOrCopy } from "@/lib/shareLink";
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

const SharePlanButton = ({ title, path, className = "", label = "Compartir" }: Props) => {
  const [done, setDone] = useState(false);
  const [manualUrl, setManualUrl] = useState<string | null>(null);

  const handleShare = async () => {
    const url = buildUrl(path);
    const text = `${title} — Rigoberto Molina, vendedor JAC: ${url}`;

    const result = await shareOrCopy({ title, text, url });
    if (result === "copied") {
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
      toast.success("Enlace copiado", {
        description: "Ya puedes pegarlo en WhatsApp para enviarlo al cliente.",
      });
      return;
    }
    if (result === "failed") setManualUrl(url);
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
            <MessageCircle size={14} /> Enviar por WhatsApp
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SharePlanButton;
