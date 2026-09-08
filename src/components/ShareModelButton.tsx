import { useState } from "react";
import { Share2, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { modelUrl, shareModelMessage } from "@/lib/modelLinks";
import { trackContact } from "@/lib/track";
import { shareOrCopy } from "@/lib/shareLink";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [manual, setManual] = useState<{ url: string; message: string } | null>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = modelUrl(slug ?? model);
    const message = shareModelMessage(model, url);
    trackContact("copy", { model, source: "compartir-modelo" });

    const result = await shareOrCopy({ title: model, text: message, url });

    if (result === "copied") {
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
      toast.success("Enlace copiado", {
        description: "Ya puedes pegarlo en WhatsApp para enviarlo al cliente.",
      });
      return;
    }
    if (result === "failed") setManual({ url, message });
  };

  return (
    <>
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

      <Dialog open={manual !== null} onOpenChange={(o) => !o && setManual(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Copia el enlace</DialogTitle>
            <DialogDescription>
              Mantén presionado sobre el enlace para copiarlo, o envíalo directo por WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <input
            readOnly
            value={manual?.url ?? ""}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
          />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(manual?.message ?? "")}`}
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

export default ShareModelButton;
