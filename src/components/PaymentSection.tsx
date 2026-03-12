import { waLink } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

const steps = [
  { num: "①", title: "AFILIACIÓN", sub: "Día 1", desc: "Primer pago para reservar tu unidad" },
  { num: "②", title: "5 CUOTAS MENSUALES", sub: "Mes a mes", desc: "Pagos consecutivos durante el proceso" },
  { num: "③", title: "PREVIO A LA ENTREGA", sub: "Último paso", desc: "Pago final antes de recibir tu carro" },
];

const PaymentSection = () => (
  <section id="pago" className="py-20 md:py-28">
    <div className="container">
      <div className="text-center">
        <h2 className="section-title">¿Cómo funciona el pago?</h2>
        <p className="section-subtitle">Esquema de Compra Directa JAC · Simple y transparente</p>
        <div className="teal-underline mx-auto" />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {steps.map((s) => (
          <div key={s.title} className="card-glow p-6 text-center">
            <span className="text-4xl">{s.num}</span>
            <h3 className="font-heading text-xl font-bold mt-3">{s.title}</h3>
            <p className="text-primary text-sm font-semibold mt-1">{s.sub}</p>
            <p className="text-muted-foreground text-sm mt-2">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm font-semibold text-muted-foreground">Los tres pagos son iguales entre sí.</p>
        <div className="inline-block mt-4 bg-primary/10 border border-primary/30 rounded-lg px-6 py-4">
          <p className="font-heading font-bold text-primary text-lg">
            Ejemplo Nevado MT → $3.018,6 + $3.018,6 ×5 + $3.018,6 = Total aprox. $21.130,2
          </p>
        </div>
      </div>

      <div className="mt-8 card-glow p-5 max-w-2xl mx-auto text-center">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Los montos son referenciales. Están sujetos a variación por flete, seguro, IVA,
          IGTF y gastos de nacionalización. Contáctame para el cronograma actualizado.
        </p>
      </div>

      <div className="mt-8 text-center">
        <a
          href={waLink("Hola Rigoberto, quiero saber el precio exacto de un modelo. ¿Me puedes enviar el cronograma?")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-heading font-bold text-lg hover:bg-primary/90 transition-colors"
        >
          Quiero saber el precio exacto <ArrowRight size={18} />
        </a>
      </div>
    </div>
  </section>
);

export default PaymentSection;
