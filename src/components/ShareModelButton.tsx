import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { modelUrl, shareModelMessage } from "@/lib/modelLinks";
import { trackContact } from "@/lib/track";

interface Props {
  model: string;
  /** Slug/id explícito del vehículo; si no se pasa se deriva del nombre. */
  slug?: string;
  className?: string;
  label?: string;
  compact?: boolean;
}

const ShareModelButton = ({ model, slug, className = "", label = "Compartir", compact = false }: Props) => {
  const [done, setDone] = useState(false);

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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = modelUrl(slug ?? model);
    const message = shareModelMessage(model, url);
    trackContact("copy", { model, source: "compartir-modelo" });

    try {
      if (navigator.share) {
        await navigator.share({ title: model, text: message, url });
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
      aria-label={`Compartir enlace del ${model}`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 text-primary font-heading font-bold hover:bg-primary/10 transition-colors ${
        compact ? "h-10 px-3 text-sm" : "px-5 py-3 text-sm"
      } ${className}`}
    >
      {done ? <Check size={15} /> : <Share2 size={15} />}
      {!compact && (done ? "Copiado" : label)}
    </button>
  );
};

export default ShareModelButton;
