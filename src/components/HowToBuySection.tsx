import { Search, MessageCircle, FileText, Car } from "lucide-react";

const steps = [
  { icon: Search, title: "Elige tu modelo", desc: "Explora el catálogo y decide cuál va contigo" },
  { icon: MessageCircle, title: "Contáctame", desc: "Escríbeme por WhatsApp o llama directo" },
  { icon: FileText, title: "Te envío el cronograma", desc: "Recibes el detalle de pago actualizado para ese modelo" },
  { icon: Car, title: "Reservas y coordinas la entrega", desc: "Haces el primer pago y el proceso comienza" },
];

const HowToBuySection = () => (
  <section className="py-20 md:py-28 bg-secondary/30">
    <div className="container">
      <div className="text-center">
        <h2 className="section-title">¿Cómo compro mi JAC?</h2>
        <div className="teal-underline mx-auto" />
      </div>

      <div className="mt-14 grid md:grid-cols-4 gap-6 relative">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-border" />

        {steps.map((s, i) => (
          <div key={s.title} className="relative text-center">
            <div className="relative z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">
              {i + 1}
            </div>
            <div className="relative z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center mx-auto -mt-2">
              <s.icon size={18} className="text-primary" />
            </div>
            <h3 className="font-heading text-lg font-bold mt-3">{s.title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowToBuySection;
