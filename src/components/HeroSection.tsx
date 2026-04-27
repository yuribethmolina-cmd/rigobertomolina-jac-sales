import { useState, useEffect } from "react";
import { waLink } from "@/lib/constants";
import { MessageCircle, Menu, X } from "lucide-react";
import logoRM from "@/assets/logo-rigoberto.png";

const navLinks = [
  { label: "Modelos", href: "#modelos" },
  { label: "Pago", href: "#pago" },
  { label: "Simulador", href: "#simulador" },
  { label: "Contacto", href: "#contacto" },
];

const HeroSection = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <section id="hero" className="relative flex items-center justify-center overflow-hidden h-[100svh]">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        defaultMuted
        playsInline
        preload="metadata"
        disableRemotePlayback
        disablePictureInPicture
        controls={false}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none [transform:translateZ(0)] [will-change:transform] [backface-visibility:hidden]"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,27,42,0.3) 0%, rgba(13,27,42,0.5) 60%, rgba(13,27,42,0.7) 100%)",
        }}
      />

      {/* Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(13,27,42,0.95)] shadow-lg"
            : "bg-gradient-to-b from-[rgba(0,0,0,0.6)] to-transparent"
        }`}
      >
        <img src={logoRM} alt="Rigoberto Molina" className="h-28 md:h-40 w-auto brightness-0 invert" />

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-1 self-center"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {menuOpen ? <X size={36} /> : <Menu size={36} />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={`fixed left-0 right-0 z-40 bg-[rgba(13,27,42,0.97)] backdrop-blur-[10px] transition-all duration-300 ease-in-out md:hidden ${
          menuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-8 opacity-0 pointer-events-none"
        }`}
        style={{ top: scrolled ? '4.5rem' : '9rem' }}
      >
        <div className="py-6 px-6 flex flex-col gap-1">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="block py-3 px-4 text-lg font-medium text-white border-l-2 border-transparent hover:border-primary hover:text-primary transition-all"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateX(0)" : "translateX(-20px)",
                transition: `opacity 0.3s ease ${0.1 + i * 0.08}s, transform 0.3s ease ${0.1 + i * 0.08}s`,
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1
          className="font-heading text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight animate-[fade-in_0.6s_ease_0.2s_both]"
        >
          Tu próximo carro JAC,
          <br />
          <span className="text-primary">con la atención que mereces.</span>
        </h1>
        <p
          className="mt-6 text-white/80 text-lg md:text-xl animate-[fade-in_0.6s_ease_0.4s_both]"
        >
          Vendedor independiente en Caracas · Catálogo vigente Feb 2026
        </p>
        <div
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-[fade-in_0.6s_ease_0.6s_both]"
        >
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
