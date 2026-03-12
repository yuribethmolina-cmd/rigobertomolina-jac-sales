import { Check } from "lucide-react";

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
            Soy <span className="text-foreground font-semibold">Rigoberto Molina</span>, vendedor independiente JAC en Caracas.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Trabajo con el catálogo de Compra Directa de Bel · JAC Venezuela.
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
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
