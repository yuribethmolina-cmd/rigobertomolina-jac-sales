import { MessageCircle } from "lucide-react";
import { waLink, WHATSAPP_DISPLAY, INSTAGRAM, INSTAGRAM_HANDLE } from "@/lib/constants";

const FooterSection = () => (
  <footer className="py-12 section-divider">
    <div className="section-container text-center space-y-3">
      <p className="font-heading text-lg font-bold">Rigoberto Molina · Embajador de la marca JAC · Caracas, Venezuela</p>
      <p className="text-muted-foreground text-sm">Catálogo Compra Directa & Pago Fácil · Bel · JAC Venezuela · Feb 2026</p>
      <p className="text-muted-foreground text-sm">Lunes a Sábado · {WHATSAPP_DISPLAY}</p>

      <div className="flex justify-center gap-3 mt-4">
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-whatsapp text-whatsapp-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-whatsapp/90 transition-colors"
        >
          <MessageCircle size={18} />
          WhatsApp
        </a>
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-secondary/80 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          {INSTAGRAM_HANDLE}
        </a>
      </div>

      <p className="text-muted-foreground text-xs mt-6 max-w-xl mx-auto leading-relaxed">
        Este sitio no es un portal oficial de JAC Motors ni de Bel Venezuela.
        Es el sitio personal de Rigoberto Molina como embajador de la marca y vendedor independiente.
      </p>
      <p className="text-muted-foreground/40 text-[10px] mt-4">v20260318-1400</p>
    </div>
  </footer>
);

export default FooterSection;
