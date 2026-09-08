import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  /** Título de lo que se comparte (nombre del plan o de la sección). */
  title: string;
  /** Ruta absoluta del sitio, incluyendo ancla. Ej: /financiamiento/planes#plan-pago-facil */
  path: string;
  className?: string;
  label?: string;
}

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
};

const SharePlanButton = ({ title, path, className = "", label = "Compartir" }: Props) => {
  const [done, setDone] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}${path}`;
    const text = `${title} — Rigoberto Molina, vendedor JAC: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await copyToClipboard(url);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
      toast.success("Enlace copiado", {
        description: "Ya puedes pegarlo en WhatsApp para enviarlo al cliente.",
      });
    } catch {
      /* el usuario canceló el compartir nativo */
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Compartir enlace de ${title}`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 font-heading text-sm font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors ${className}`}
    >
      {done ? <Check size={14} /> : <Share2 size={14} />}
      {done ? "Copiado" : label}
    </button>
  );
};

export default SharePlanButton;
