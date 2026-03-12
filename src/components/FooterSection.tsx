import { MessageCircle } from "lucide-react";
import { waLink, WHATSAPP_DISPLAY } from "@/lib/constants";

const FooterSection = () => (
  <footer className="py-12 border-t border-border">
    <div className="container text-center space-y-3">
      <p className="font-heading text-lg font-bold">Rigoberto Molina · Vendedor Independiente JAC · Caracas, Venezuela</p>
      <p className="text-muted-foreground text-sm">Catálogo Compra Directa Bel · JAC Venezuela · Feb 2026</p>
      <p className="text-muted-foreground text-sm">Lunes a Sábado · {WHATSAPP_DISPLAY}</p>

      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-whatsapp text-whatsapp-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-whatsapp/90 transition-colors mt-4"
      >
        <MessageCircle size={18} />
        Escribir por WhatsApp
      </a>

      <p className="text-muted-foreground text-xs mt-6 max-w-xl mx-auto leading-relaxed">
        Este sitio no es un portal oficial de JAC Motors ni de Bel Venezuela.
        Es el sitio personal de Rigoberto Molina como vendedor independiente.
      </p>
    </div>
  </footer>
);

export default FooterSection;
