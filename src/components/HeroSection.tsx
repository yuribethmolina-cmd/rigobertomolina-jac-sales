import { useState, useEffect } from "react";
import { waLink } from "@/lib/constants";
import { MessageCircle, Menu, X } from "lucide-react";
import logoRM from "@/assets/logo-rigoberto.png";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const navLinks = [
  { label: "Modelos", href: "#modelos" },
  { label: "Pago", href: "#pago" },
  { label: "Simulador", href: "#simulador" },
  { label: "Financiamiento", href: "/financiamiento" },
  { label: "Asesor", href: "/asesor" },
  { label: "Contacto", href: "/contacto" },
];

const HeroSection = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = useIsAdmin();
  const links = isAdmin
    ? [...navLinks, { label: "Admin", href: "/admin" }]
    : navLinks;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <section
      id="hero"
      data-at-top={!scrolled}
      className="relative flex flex-col overflow-hidden min-h-[100svh] bg-[rgb(13,27,42)] md:h-[100svh] md:items-center md:justify-center"
    >
      {/* Mobile: blurred still fills the screen behind the uncropped video */}
      <img
        src="/videos/hero-titanio-poster.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 pointer-events-none md:hidden"
      />
      {/* One video: in-flow 16:9 stage on mobile, full-bleed background from md up */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/videos/hero-titanio-poster.jpg"
        disableRemotePlayback
        disablePictureInPicture
        controls={false}
        aria-hidden="true"
        tabIndex={-1}
        className="relative mt-[4.5rem] w-full aspect-video object-cover pointer-events-none md:absolute md:inset-0 md:mt-0 md:h-full md:aspect-auto [transform:translateZ(0)] [will-change:transform] [backface-visibility:hidden]"
      >
        <source src="/videos/hero-titanio.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay (desktop only: on mobile no text sits over the video) */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,27,42,0.35) 0%, rgba(13,27,42,0.55) 60%, rgba(13,27,42,0.78) 100%)",
        }}
      />

      {/* Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2 md:py-4 md:px-12 transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(13,27,42,0.95)] shadow-lg"
            : "bg-gradient-to-b from-[rgba(0,0,0,0.6)] to-transparent"
        }`}
      >
        {/* The logo file is square with empty bands above and below; crop them on mobile */}
        <div className="h-14 overflow-hidden md:h-auto md:overflow-visible">
          <img src={logoRM} alt="Rigoberto Molina" className="h-28 -mt-7 md:mt-0 md:h-40 w-auto brightness-0 invert" />
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          {links.map((link) => (
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
        style={{ top: '4.5rem', maxHeight: `calc(100dvh - 4.5rem)`, overflowY: "auto" }}
      >
        <div className="py-4 px-6 pb-8 flex flex-col gap-1">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className={link.href === "/admin" ? "block mt-3 py-3 px-4 text-lg font-bold text-center rounded-lg bg-primary text-primary-foreground transition-all" : "block py-2.5 px-4 text-lg font-medium text-foreground border-l-2 border-transparent hover:border-primary hover:text-primary transition-all"}
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
      <div className="relative z-10 flex flex-1 flex-col justify-center text-center px-6 py-6 max-w-3xl md:flex-none md:py-0">
        <h1
          className="font-heading text-4xl md:text-7xl font-extrabold leading-[1.05] tracking-tight [text-wrap:balance] animate-[fade-in_0.6s_ease_0.2s_both]"
        >
          Tu próximo carro JAC,
          <br />
          <span className="text-primary">con la atención que mereces.</span>
        </h1>
        <p
          className="mt-4 md:mt-6 text-white/80 text-base md:text-xl animate-[fade-in_0.6s_ease_0.4s_both]"
        >
          Vendedor independiente en Caracas · Catálogos en constante actualización
        </p>
        <div
          className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-[fade-in_0.6s_ease_0.6s_both]"
        >
          <a
            href="#modelos"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 sm:px-8 py-3.5 font-heading text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ver modelos disponibles
          </a>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 sm:px-8 py-3.5 font-heading text-lg font-bold text-whatsapp-foreground hover:bg-whatsapp/90 transition-colors"
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
