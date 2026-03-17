import { Check } from "lucide-react";
import { INSTAGRAM, INSTAGRAM_HANDLE } from "@/lib/constants";

const badges = [
  "Atención directa y personalizada",
  "Catálogo oficial actualizado",
  "Respuesta rápida por WhatsApp",
];

const AboutSection = () => (
  <section className="py-20 md:py-28">
    <div className="container">
      <div className="text-center md:text-left">
        <h2 className="section-title">¿Por qué comprar con Rigoberto?</h2>
        <div className="teal-underline md:mx-0 mx-auto" />
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center gap-10">
        {/* Photo placeholder */}
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground text-sm shrink-0">
          Foto de Rigoberto
        </div>

        <div>
          <p className="text-muted-foreground leading-relaxed">
            Soy <span className="text-foreground font-semibold">Rigoberto Molina</span>, embajador de la marca JAC y vendedor independiente en Caracas.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Trabajo con el catálogo de Compra Directa y Pago Fácil de Bel · JAC Venezuela.
            Te atiendo directamente — sin intermediarios, sin rodeos.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Mi trabajo es ayudarte a elegir el carro correcto para ti
            y acompañarte en cada paso del proceso.
          </p>

          <div className="mt-6 space-y-2">
            {badges.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-primary shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary hover:underline"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            {INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
