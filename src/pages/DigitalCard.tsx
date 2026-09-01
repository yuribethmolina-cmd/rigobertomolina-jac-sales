import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  MessageCircle,
  Star,
  Globe,
  Instagram,
  Mail,
  Download,
  Share2,
  ArrowLeft,
  Check,
  Phone,
} from "lucide-react";
import {
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
  EMAIL,
  INSTAGRAM,
  INSTAGRAM_HANDLE,
  waLink,
} from "@/lib/constants";

const CARD_URL = "https://rigobertomolina.com/tarjeta";
const REVIEW_URL = "https://rigobertomolina.com/resena";
const SITE_URL = "https://rigobertomolina.com";

/** Minimal vCard 3.0 string for "Save to contacts". */
const vCard = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:Molina;Rigoberto;;;",
  "FN:Rigoberto Molina",
  "ORG:JAC Venezuela;Vendedor Independiente",
  "TITLE:Vendedor JAC Caracas",
  `TEL;TYPE=CELL,WHATSAPP:${WHATSAPP_NUMBER}`,
  `EMAIL:${EMAIL}`,
  `URL:${SITE_URL}`,
  `URL:${REVIEW_URL}`,
  "NOTE:Vendedor independiente de la marca JAC en Caracas. Compra Directa y Pago Facil.",
  "END:VCARD",
].join("\r\n");

const DigitalCard = () => {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(CARD_URL);
      setCopied(true);
      toast.success("Link de la tarjeta copiado.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`No se pudo copiar. Copia manualmente: ${CARD_URL}`);
    }
  };

  const downloadVcf = () => {
    const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rigoberto-molina.vcf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Contacto descargado. Abre el archivo para guardarlo.");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tarjeta de Rigoberto Molina · Vendedor JAC",
          text: "Conoce el catálogo JAC Venezuela con Rigoberto Molina.",
          url: CARD_URL,
        });
      } catch {
        /* cancelled */
      }
    } else {
      void copyUrl();
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        {/* The card */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-secondary shadow-2xl">
          {/* Decorative teal glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative p-8 text-center">
            {/* Monogram */}
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 ring-2 ring-primary/40 shadow-lg">
              <span className="font-heading text-4xl font-black tracking-tight text-primary-foreground">
                RM
              </span>
            </div>

            <h1 className="font-heading text-3xl font-black tracking-tight text-foreground">
              Rigoberto Molina
            </h1>
            <p className="mt-1 text-sm font-heading font-semibold uppercase tracking-[0.18em] text-primary">
              Vendedor JAC Caracas
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Embajador de la marca JAC en Venezuela. Catálogo Compra Directa y
              Pago Fácil. Atención directa, sin intermediarios.
            </p>

            {/* Contact line */}
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone size={14} className="text-primary" />
              <span className="font-mono">{WHATSAPP_DISPLAY}</span>
            </div>

            {/* QR */}
            <div className="mt-6 mx-auto w-fit rounded-2xl border border-border bg-background p-3">
              <QRCodeSVG
                value={CARD_URL}
                size={168}
                bgColor="transparent"
                fgColor="hsl(186 100% 39%)"
                level="M"
              />
              <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                Escanea para guardar
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 space-y-3">
          <a
            href={waLink("Hola Rigoberto, te contacto desde tu tarjeta digital. Quiero información sobre un modelo JAC.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-whatsapp px-5 py-4 font-heading font-bold text-whatsapp-foreground hover:bg-whatsapp/90 transition-colors"
          >
            <MessageCircle size={20} /> WhatsApp
          </a>

          <a
            href={REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-4 font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Star size={20} /> Dejar reseña
          </a>

          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-4 font-heading font-bold text-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Globe size={20} /> Ver catálogo web
          </a>

          <div className="grid grid-cols-3 gap-3">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${INSTAGRAM_HANDLE}`}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-2 py-3 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Instagram size={18} />
              <span className="hidden sm:block">{INSTAGRAM_HANDLE}</span>
              <span className="sm:hidden">IG</span>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              aria-label="Correo electrónico"
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-2 py-3 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Mail size={18} />
              <span className="hidden sm:block truncate w-full text-center">Correo</span>
              <span className="sm:hidden">Mail</span>
            </a>
            <button
              type="button"
              onClick={downloadVcf}
              aria-label="Guardar contacto"
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-2 py-3 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Download size={18} />
              <span>Guardar</span>
            </button>
          </div>
        </div>

        {/* Share row */}
        <div className="mt-5 flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-xl border border-border bg-card px-3 py-3 overflow-hidden">
            <input
              readOnly
              value={CARD_URL}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Link de la tarjeta"
              className="w-full bg-transparent text-xs text-foreground outline-none truncate font-mono"
            />
          </div>
          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <button
            type="button"
            onClick={share}
            aria-label="Compartir"
            className="inline-flex items-center justify-center rounded-xl border border-primary/40 px-4 py-3 text-primary hover:bg-primary/10 transition-colors"
          >
            <Share2 size={16} />
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Rigoberto Molina · JAC Venezuela · Catálogo Agosto 2026
        </p>
      </div>
    </main>
  );
};

export default DigitalCard;
