import { Check, ArrowRight, AlertTriangle } from "lucide-react";
import { waLink } from "@/lib/constants";
import { financingPlans, FINANCING_DISCLAIMER } from "@/data/financingPlans";

/* Todas las estructuras provienen de la fuente única src/data/financingPlans.ts */
const verified = financingPlans.filter((p) => p.sourceStatus === "VERIFIED_17_AUG");
const inReview = financingPlans.filter((p) => p.sourceStatus === "REVIEW_NOT_VERIFIED");

const PurchasePlansSection = () => (
  <section id="planes" className="py-20 section-divider">
    <div className="section-container">
      {/* Header */}
      <div className="text-center">
        <h2 className="section-title">¿Cuál es tu plan?</h2>
        <p className="section-subtitle">
          {verified.length} planes vigentes de JAC — elige el que más te convenga
        </p>
        <div className="teal-underline mx-auto" />
      </div>

      {/* Cards de planes verificados */}
      <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {verified.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-primary/30 bg-gradient-to-b from-secondary to-background p-6 flex flex-col"
          >
            <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

            <ul className="mt-4 space-y-2 flex-1">
              {plan.template.map((stage) => (
                <li key={stage.label} className="flex items-start gap-2 text-sm text-foreground">
                  <Check size={15} className="text-primary mt-0.5 shrink-0" />
                  <span>
                    {stage.count > 1 ? `${stage.count} × ` : ""}
                    {stage.label}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="#simulador"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ver opciones de financiamiento <ArrowRight size={16} />
            </a>
          </div>
        ))}
      </div>

      {/* Planes sin documento vigente */}
      {inReview.length > 0 && (
        <div className="mt-10 rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
          <p className="flex items-start gap-2 font-heading text-sm font-bold text-amber-500">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Planes en revisión
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {inReview.map((p) => p.name).join(", ")} siguen disponibles para consulta, pero no contamos con
            documento vigente del 17 de agosto para publicar sus cronogramas. Consulta disponibilidad y
            condiciones por WhatsApp.
          </p>
          <a
            href={waLink(
              "Hola Rigoberto, quiero información y condiciones actualizadas de los planes Compra Directa, Crédito Bel y Travesía."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-500/50 px-4 py-2 font-heading text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-colors"
          >
            Consultar requisitos <ArrowRight size={15} />
          </a>
        </div>
      )}

      <p className="mt-8 text-xs text-muted-foreground leading-relaxed max-w-3xl mx-auto">
        {FINANCING_DISCLAIMER}
      </p>
    </div>
  </section>
);

export default PurchasePlansSection;
