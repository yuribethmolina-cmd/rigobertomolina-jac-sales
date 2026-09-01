import { useState } from "react";
import { toast } from "sonner";
import { Copy, MessageCircle, Check, Share2 } from "lucide-react";

const REVIEW_URL = "https://rigobertomolina.com/resena";

const ShareReviewLink = () => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(REVIEW_URL);
      setCopied(true);
      toast.success("Link de reseñas copiado. Envíalo a tu cliente después de la compra.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`No se pudo copiar. Copia manualmente: ${REVIEW_URL}`);
    }
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(
    "¡Gracias por tu compra! Me ayudaría mucho conocer tu experiencia. Deja tu reseña aquí (toma menos de un minuto): " +
      REVIEW_URL
  )}`;

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Deja tu reseña · Rigoberto Molina JAC",
          text: "¡Gracias por tu compra! Cuéntanos tu experiencia:",
          url: REVIEW_URL,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      void copy();
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-primary/30 bg-card/40 p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Share2 size={18} className="text-primary" />
        <h2 className="font-heading text-base font-bold uppercase tracking-wide text-foreground">
          Link para pedir reseñas
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Copia este link y envíalo a tus clientes al finalizar la compra. Abre el formulario de reseña.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center rounded-lg border border-border bg-background px-3 py-2.5 overflow-hidden">
          <input
            readOnly
            value={REVIEW_URL}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Link de reseñas"
            className="w-full bg-transparent text-sm text-foreground outline-none truncate font-mono"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <button
            type="button"
            onClick={share}
            aria-label="Compartir"
            className="inline-flex items-center justify-center rounded-lg border border-primary/30 px-3 py-2.5 text-primary hover:bg-primary/10 transition-colors"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareReviewLink;
