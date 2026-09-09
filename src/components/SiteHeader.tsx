import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoRM from "@/assets/logo-rigoberto.png";

const navLinks = [
  { label: "Modelos", href: "/#modelos" },
  { label: "Pago", href: "/#pago" },
  { label: "Simulador", href: "/#simulador" },
  { label: "Financiamiento", href: "/financiamiento" },
  { label: "Asesor", href: "/asesor" },
  { label: "Contacto", href: "/contacto" },
];

const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(13,27,42,0.95)] shadow-lg"
            : "bg-[rgba(13,27,42,0.92)]"
        }`}
      >
        <a href="/" className="flex items-center" aria-label="Ir al inicio">
          <img src={logoRM} alt="Rigoberto Molina" className="h-16 md:h-24 w-auto brightness-0 invert" />
        </a>

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
          aria-expanded={menuOpen}
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
        style={{ top: "5rem" }}
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
    </>
  );
};

export default SiteHeader;
