import { useState } from "react";
import { waLink } from "@/lib/constants";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { financingPlans, FINANCING_DISCLAIMER, NOT_VERIFIED_LABEL, fmtUsd0 } from "@/data/financingPlans";
import { vehicles } from "@/data/vehicles";
import { pagoFacilMonthly } from "@/data/vehicleFinancing";

/* Estructuras y montos: fuente única en src/data. Sin cifras hardcodeadas. */
const verifiedPlans = financingPlans.filter((p) => p.sourceStatus === "VERIFIED_17_AUG");

/* Referencia de cuota mensual documentada (Pago Fácil, 12 cuotas). */
const quotaRows = vehicles
  .map((v) => ({ vehicle: v, cuota: pagoFacilMonthly(v.id) }))
  .filter((r) => r.cuota !== null)
  .slice(0, 12);

const PaymentSection = () => {
  const [planId, setPlanId] = useState(verifiedPlans[0]?.id ?? "");
  const plan = verifiedPlans.find((p) => p.id === planId) ?? verifiedPlans[0];

  if (!plan) return null;

  return (
    <section id="pago" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">¿Cómo funciona el pago?</h2>
          <p className="section-subtitle">Estructura oficial de cada plan vigente</p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Selector de plan */}
        <div className="mt-8 overflow-x-auto pb-1">
          <div className="flex justify-start md:justify-center gap-3 min-w-max px-1">
            {verifiedPlans.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlanId(p.id)}
                className={`px-6 py-2.5 rounded-full font-heading font-bold text-sm transition-all duration-300 ${
                  plan.id === p.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-secondary text-muted-foreground border border-muted-foreground/30 hover:text-foreground"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Etapas del plan */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {plan.template.map((stage, i) => (
            <div
              key={stage.label}
              className="relative overflow-hidden bg-gradient-to-b from-secondary to-background border-l-4 border-primary rounded-xl p-6 min-h-[160px]"
            >
              <span className="absolute top-2 right-4 text-6xl font-black text-primary/20 leading-none select-none pointer-events-none">
                {i + 1}
              </span>
              <h3 className="font-heading text-lg font-bold relative z-10 uppercase">{stage.label}</h3>
              <p className="text-sm font-semibold mt-1 text-primary relative z-10">
                {stage.count > 1 ? `${stage.count} pagos` : "1 pago"}
              </p>
              {stage.months && (
                <p className="text-muted-foreground text-sm mt-2 relative z-10">
                  Meses {stage.months.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{plan.description}</p>

        {/* Tabla de referencia — Pago Fácil */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="font-heading text-2xl md:text-3xl font-bold">
              Cuota mensual de referencia · Pago Fácil
            </h3>
            <p className="text-muted-foreground text-sm mt-2">
              Corresponde a cada una de las 12 cuotas mensuales, no al precio total del vehículo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left rounded-tl-lg font-heading font-bold">Configuración</th>
                  <th className="p-3 text-center font-heading font-bold">Categoría</th>
                  <th className="p-3 text-center rounded-tr-lg font-heading font-bold">Cuota mensual</th>
                </tr>
              </thead>
              <tbody>
                {quotaRows.map((row, i) => (
                  <tr key={row.vehicle.id} className={i % 2 === 0 ? "bg-card" : "bg-secondary/50"}>
                    <td className="p-3 font-semibold">{row.vehicle.displayName}</td>
                    <td className="p-3 text-center text-muted-foreground">{row.vehicle.category}</td>
                    <td className="p-3 text-center font-bold">
                      {row.cuota ? fmtUsd0(row.cuota) : NOT_VERIFIED_LABEL}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            ¿No ves tu modelo?{" "}
            <a href="#simulador" className="text-primary font-bold underline">
              Consulta el cronograma completo en el simulador
            </a>
            .
          </p>
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
        <div className="mt-8 max-w-3xl mx-auto border-2 border-amber-500/50 bg-amber-500/10 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-foreground leading-relaxed">{FINANCING_DISCLAIMER}</p>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
