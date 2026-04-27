import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  message: string;
  label?: string;
  className?: string;
};

const CopyableMessage = ({
  message,
  label = "Vista previa del mensaje",
  className = "",
}: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        // Fallback para navegadores antiguos / contextos no seguros
        const ta = document.createElement("textarea");
        ta.value = message;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`rounded-lg bg-background border border-border p-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar mensaje"
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold transition-colors ${
            copied
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:border-primary/60 hover:text-primary"
          }`}
        >
          {copied ? (
            <>
              <Check size={13} /> Copiado
            </>
          ) : (
            <>
              <Copy size={13} /> Copiar
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{message}</p>
    </div>
  );
};

export default CopyableMessage;
