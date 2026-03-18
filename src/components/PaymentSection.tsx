import { useState } from "react";
import { waLink } from "@/lib/constants";
import { ArrowRight, ArrowDown } from "lucide-react";

type Plan = "directa" | "facil";

const directaSteps = [
  { num: "①", title: "AFILIACIÓN", sub: "Día 1", desc: "Primer pago para reservar tu unidad" },
  { num: "②", title: "5 CUOTAS MENSUALES", sub: "Mes a mes", desc: "Pagos iguales durante el proceso" },
  { num: "③", title: "PREVIO A LA ENTREGA", sub: "Último paso", desc: "Pago final antes de recibir tu carro" },
];

const facilSteps = [
  { num: "①", title: "AFILIACIÓN", sub: "Día 1", desc: "Primer pago para reservar tu unidad" },
  { num: "②", title: "10 CUOTAS MENSUALES", sub: "Mes a mes por 10 meses", desc: "Cuotas más bajas, más tiempo para pagar" },
  { num: "③", title: "ÚLTIMA CUOTA", sub: "Antes de la entrega", desc: "Cuota final mayor antes de recibir tu carro" },
];

const comparisonData = [
  { modelo: "Arena Sport MT", directa: "$2.564 / mes", facil: "$1.576 / mes", diff: "-$988/mes", featured: false },
  { modelo: "Arena Sport AT", directa: "$3.236 / mes", facil: "$1.694 / mes", diff: "-$1.541/mes", featured: false },
  { modelo: "Nevado MT ⭐", directa: "$3.018 / mes", facil: "$2.402 / mes", diff: "-$616/mes", featured: true },
  { modelo: "La Venezolana 4x2", directa: "$2.972 / mes", facil: "$1.653 / mes", diff: "-$1.318/mes", featured: false },
];

const PaymentSection = () => {
  const [plan, setPlan] = useState<Plan>("directa");
  const steps = plan === "directa" ? directaSteps : facilSteps;
  const accentClass = plan === "directa" ? "text-primary" : "text-amber-400";
  const accentBg = plan === "directa" ? "bg-primary/10 border-primary/30" : "bg-amber-400/10 border-amber-400/30";
  const accentBgSolid = plan === "directa" ? "bg-primary/20" : "bg-amber-400/20";

  return (
    <section id="pago" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">¿Cómo funciona el pago?</h2>
          <p className="section-subtitle">Elige el plan que mejor se adapta a ti</p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Plan toggle */}
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => setPlan("directa")}
            className={`px-6 py-2.5 rounded-full font-heading font-bold text-sm transition-all duration-300 ${
              plan === "directa"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-secondary text-muted-foreground border border-muted-foreground/30 hover:text-foreground"
            }`}
          >
            Compra Directa
          </button>
          <button
            onClick={() => setPlan("facil")}
            className={`px-6 py-2.5 rounded-full font-heading font-bold text-sm transition-all duration-300 ${
              plan === "facil"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-secondary text-muted-foreground border border-muted-foreground/30 hover:text-foreground"
            }`}
          >
            Pago Fácil
          </button>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {steps.map((s) => (
            <div key={s.title} className="card-glow p-6 text-center">
              <span className="text-4xl">{s.num}</span>
              <h3 className="font-heading text-xl font-bold mt-3">{s.title}</h3>
              <p className={`text-sm font-semibold mt-1 ${accentClass}`}>{s.sub}</p>
              <p className="text-muted-foreground text-sm mt-2">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Example and tag */}
        <div className="mt-10 text-center">
          {plan === "directa" ? (
            <>
              <p className="text-sm font-semibold text-muted-foreground">Los tres pagos son exactamente iguales entre sí.</p>
              <div className={`inline-block mt-4 border rounded-lg px-6 py-4 ${accentBg}`}>
                <p className={`font-heading font-bold text-lg ${accentClass}`}>
                  Nevado MT → $3.018,6 + ($3.018,6 × 5) + $3.018,6 = aprox. $21.130 total
                </p>
              </div>
              <p className={`mt-3 text-sm font-medium ${accentClass}`}>
                Ideal si quieres terminar de pagar rápido
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-muted-foreground">Las cuotas mensuales son significativamente menores que en Compra Directa.</p>
              <div className={`inline-block mt-4 border rounded-lg px-6 py-4 ${accentBg}`}>
                <p className="font-heading font-bold text-amber-400 text-lg">
                  Nevado MT → $2.402,3 + ($2.402,3 × 10) + $5.413,9 = aprox. $29.436 total
                </p>
              </div>
              <p className="mt-3 text-sm font-medium text-amber-400">
                Ideal si prefieres cuotas bajas y más tiempo
              </p>
            </>
          )}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="font-heading text-2xl md:text-3xl font-bold">¿Cuánto pagarías por mes con cada plan?</h3>
            <p className="text-muted-foreground text-sm mt-2">Cuotas mensuales referenciales · Feb 2026</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left rounded-tl-lg font-heading font-bold">Modelo</th>
                  <th className="p-3 text-center font-heading font-bold">Compra Directa</th>
                  <th className="p-3 text-center font-heading font-bold">Pago Fácil</th>
                  <th className="p-3 text-center rounded-tr-lg font-heading font-bold">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr
                    key={row.modelo}
                    className={`${row.featured ? "bg-primary/10 font-semibold" : i % 2 === 0 ? "bg-card" : "bg-secondary/50"}`}
                  >
                    <td className="p-3 font-semibold">{row.modelo}</td>
                    <td className="p-3 text-center">{row.directa}</td>
                    <td className="p-3 text-center">{row.facil}</td>
                    <td className="p-3 text-center text-green-400 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <ArrowDown size={14} /> {row.diff}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm mb-4">¿Cuál plan te conviene más? Escríbeme y te explico sin compromiso.</p>
          <a
            href={waLink("Hola Rigoberto, quiero saber cuál plan de pago me conviene más. ¿Me puedes asesorar?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-heading font-bold text-lg hover:bg-primary/90 transition-colors"
          >
            Consultar por WhatsApp <ArrowRight size={18} />
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 card-glow p-5 max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground text-xs leading-relaxed">
            * Montos referenciales del catálogo Feb 2026. Sujetos a variación por flete, seguro, IVA,
            IGTF y gastos de nacionalización. Contáctame para el cronograma actualizado de tu modelo.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
