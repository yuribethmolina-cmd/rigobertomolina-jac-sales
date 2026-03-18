
import { waLink } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <img
        src="https://jacvenezuela.com/wp-content/uploads/2025/10/jac_banners_aventura_pro_edicion_limitada.jpg"
        alt="JAC Venezuela"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)]" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <span className="font-heading text-sm tracking-widest text-muted-foreground uppercase">JAC | bel</span>
        <div className="hidden sm:flex gap-6 text-sm font-medium text-muted-foreground">
          <a href="#modelos" className="hover:text-primary transition-colors">Modelos</a>
          <a href="#pago" className="hover:text-primary transition-colors">Pago</a>
          <a href="#contacto" className="hover:text-primary transition-colors">Contacto</a>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="font-heading text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
          Tu próximo carro JAC,
          <br />
          <span className="text-primary">con la atención que mereces.</span>
        </h1>
        <p className="mt-6 text-muted-foreground text-lg md:text-xl">
          Vendedor independiente en Caracas · Catálogo vigente Feb 2026
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#modelos"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 font-heading text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ver modelos disponibles
          </a>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-8 py-3.5 font-heading text-lg font-bold text-whatsapp-foreground hover:bg-whatsapp/90 transition-colors"
          >
            <MessageCircle size={20} />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
