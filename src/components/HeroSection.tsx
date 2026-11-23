import { useState, useEffect } from "react";
import { waLink } from "@/lib/constants";
import { MessageCircle, Menu, X } from "lucide-react";
import logoRM from "@/assets/logo-rigoberto.png";
import heroVideo from "@/assets/hero-titanio.mp4.asset.json";
import heroPoster from "@/assets/hero-titanio-poster.jpg.asset.json";
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
    <section id="hero" className="relative flex items-center justify-center overflow-hidden h-[100svh]">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={heroPoster.url}
        disableRemotePlayback
        disablePictureInPicture
        controls={false}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none hidden md:block [transform:translateZ(0)] [will-change:transform] [backface-visibility:hidden]"
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      {/* Mobile: full video uncropped, with a blurred copy filling the screen behind */}
      <div className="absolute inset-0 md:hidden pointer-events-none" aria-hidden="true">
        <img src={heroPoster.url} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60" />
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroPoster.url}
          disableRemotePlayback
          disablePictureInPicture
          controls={false}
          tabIndex={-1}
          className="absolute left-0 right-0 top-[22%] w-full aspect-video object-contain"
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,27,42,0.35) 0%, rgba(13,27,42,0.55) 60%, rgba(13,27,42,0.78) 100%)",
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
        style={{ top: '9rem', maxHeight: `calc(100dvh - 9rem)`, overflowY: "auto" }}
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
          Vendedor independiente en Caracas · Catálogos en constante actualización
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
