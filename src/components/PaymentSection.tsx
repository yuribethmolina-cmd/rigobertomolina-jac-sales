import { useState } from "react";
import { waLink } from "@/lib/constants";
import { ArrowRight, AlertTriangle } from "lucide-react";

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
  { modelo: "Arena Sport MT", directa: "$2.564 / mes", totalDirecta: "$17.948", facil: "$1.576 / mes", totalFacil: "$22.132", featured: false },
  { modelo: "Arena Sport AT", directa: "$3.236 / mes", totalDirecta: "$22.652", facil: "$1.694 / mes", totalFacil: "$23.876", featured: false },
  { modelo: "Nevado MT ⭐", directa: "$3.018 / mes", totalDirecta: "$21.130", facil: "$2.402 / mes", totalFacil: "$29.436", featured: true },
  { modelo: "La Venezolana 4x2", directa: "$2.972 / mes", totalDirecta: "$20.804", facil: "$1.653 / mes", totalFacil: "$23.295", featured: false },
];

const PaymentSection = () => {
  const [plan, setPlan] = useState<Plan>("directa");
  const steps = plan === "directa" ? directaSteps : facilSteps;
  const accentClass = "text-primary";
  const accentBg = "bg-primary/10 border-primary/30";
  const accentBgSolid = "bg-primary/20";

  return (
     <section id="pago" className="py-20 section-divider">
      <div className="section-container">
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
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative overflow-hidden bg-gradient-to-b from-secondary to-background border-l-4 border-primary rounded-xl p-6 min-h-[160px]"
            >
              <span className="absolute top-2 right-4 text-6xl font-black text-primary/20 leading-none select-none pointer-events-none">
                {i + 1}
              </span>
              <h3 className="font-heading text-xl font-bold relative z-10">{s.title}</h3>
              <p className={`text-sm font-semibold mt-1 ${accentClass} relative z-10`}>{s.sub}</p>
              <p className="text-muted-foreground text-sm mt-2 relative z-10">{s.desc}</p>
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
                <p className="font-heading font-bold text-primary text-lg">
                  Nevado MT → $2.402,3 + ($2.402,3 × 10) + $5.413,9 = aprox. $29.436 total
                </p>
              </div>
              <p className="mt-3 text-sm font-medium text-primary">
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
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left rounded-tl-lg font-heading font-bold">Modelo</th>
                  <th className="p-3 text-center font-heading font-bold">Cuota Directa</th>
                  <th className="p-3 text-center font-heading font-bold">Total Directa</th>
                  <th className="p-3 text-center font-heading font-bold">Cuota Fácil</th>
                  <th className="p-3 text-center font-heading font-bold">Total Fácil</th>
                  <th className="p-3 text-center rounded-tr-lg font-heading font-bold">Total Fácil</th>
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
                    <td className="p-3 text-center font-bold">{row.totalDirecta}</td>
                    <td className="p-3 text-center">{row.facil}</td>
                    <td className="p-3 text-center font-bold">{row.totalFacil}</td>
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
        <div className="mt-8 max-w-2xl mx-auto border-2 border-amber-500/50 bg-amber-500/10 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={22} />
          <p className="text-sm leading-relaxed">
            <strong className="text-amber-500">Precios referenciales.</strong>{" "}
            Los montos mostrados corresponden al catálogo de <strong>Feb 2026</strong> y están{" "}
            <strong>sujetos a cambio</strong> por flete, seguro, IVA, IGTF y gastos de nacionalización.
            Contáctame para el cronograma actualizado de tu modelo.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
