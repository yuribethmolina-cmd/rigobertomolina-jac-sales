import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/constants";
import { trackContact } from "@/lib/track";

const WhatsAppFloat = () => (
  <a
    href={waLink()}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => trackContact("whatsapp", { source: "boton-flotante" })}
    title="¿Tienes dudas? Escríbeme"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-whatsapp text-whatsapp-foreground flex items-center justify-center shadow-lg animate-pulse-glow hover:scale-110 transition-transform"
  >
    <MessageCircle size={28} />
  </a>
);

export default WhatsAppFloat;
