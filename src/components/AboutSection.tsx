import { Check } from "lucide-react";
import { INSTAGRAM, INSTAGRAM_HANDLE } from "@/lib/constants";
import rigbertoImg from "@/assets/rigoberto.png";

const badges = [
  { title: "Atención directa", desc: "Trato personalizado sin intermediarios" },
  { title: "Catálogo oficial", desc: "Modelos y precios siempre actualizados" },
  { title: "Respuesta rápida", desc: "Te respondo por WhatsApp al instante" },
];

const AboutSection = () => (
  <section className="py-20">
    <div className="container">
      <div className="bg-gradient-to-br from-secondary to-background rounded-3xl p-8 md:p-12">
        <div className="text-center md:text-left">
          <h2 className="section-title">¿Por qué comprar con Rigoberto?</h2>
          <div className="teal-underline md:mx-0 mx-auto" />
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center gap-10">
          {/* Photo */}
          <div className="w-full md:w-auto shrink-0">
            <div className="w-full md:w-[280px] aspect-square ring-4 ring-primary/60 rounded-2xl overflow-hidden shadow-lg mx-auto">
              <img
                src={rigbertoImg}
                alt="Rigoberto Molina — Embajador JAC Venezuela"
                className="w-full h-full object-cover scale-[1.6] origin-[50%_25%]"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="relative">
            <span className="absolute -top-4 -left-2 text-[120px] text-primary/10 leading-none select-none pointer-events-none font-serif">"</span>
            <p className="text-muted-foreground leading-relaxed relative z-10">
              Soy <span className="text-foreground font-semibold">Rigoberto Molina</span>, embajador de la marca JAC y vendedor independiente en Caracas.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3 relative z-10">
              Trabajo con el catálogo de Compra Directa y Pago Fácil de Bel · JAC Venezuela.
              Te atiendo directamente — sin intermediarios, sin rodeos.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3 relative z-10">
              Mi trabajo es ayudarte a elegir el carro correcto para ti
              y acompañarte en cada paso del proceso.
            </p>

            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary hover:underline relative z-10"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              {INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>

        {/* Badge cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((b) => (
            <div
              key={b.title}
              className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center"
            >
              <Check size={20} className="text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm text-foreground">{b.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
