import { Search, MessageCircle, FileText, Car } from "lucide-react";

const steps = [
  { icon: Search, title: "Elige tu modelo", desc: "Explora el catálogo y decide cuál va contigo" },
  { icon: MessageCircle, title: "Contáctame", desc: "Escríbeme por WhatsApp o llama directo" },
  { icon: FileText, title: "Te envío el cronograma", desc: "Recibes el detalle de pago actualizado para ese modelo" },
  { icon: Car, title: "Reservas y coordinas la entrega", desc: "Haces el primer pago y el proceso comienza" },
];

const HowToBuySection = () => (
  <section className="py-20 bg-secondary/30 section-divider">
    <div className="section-container">
      <div className="text-center">
        <h2 className="section-title">¿Cómo compro mi JAC?</h2>
        <div className="teal-underline mx-auto" />
      </div>

      <div className="mt-14 grid md:grid-cols-4 gap-8 relative">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-border" />

        {steps.map((s, i) => (
          <div key={s.title} className="relative text-center">
            <div className="relative z-10 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto">
              <s.icon size={24} />
            </div>
            <span className="inline-block mt-2 text-xs font-bold text-primary">Paso {i + 1}</span>
            <h3 className="font-heading text-lg font-bold mt-1">{s.title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowToBuySection;
