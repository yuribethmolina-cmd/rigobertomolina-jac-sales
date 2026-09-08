import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { Check, MessageCircle, ClipboardList, ArrowLeft, ArrowRight } from "lucide-react";
import { waLink } from "@/lib/constants";
import {
  financingPlans,
  FINANCING_DISCLAIMER,
  PENDING_REQUIREMENTS_NOTE,
  APPLICATION_FORM_NOTE,
  REQUIREMENTS_NOTE,
  requirementsForPlan,
  requiresCreditEvaluation,
  fmtUsd,
} from "@/data/financingPlans";
import { vehicleFinancing } from "@/data/vehicleFinancing";
import SharePlanButton from "@/components/SharePlanButton";
import FooterSection from "@/components/FooterSection";

const verifiedPlans = financingPlans.filter((p) => p.sourceStatus !== "REVIEW_NOT_VERIFIED");

const cuotaRangeForPlan = (planId: string): { min: number; max: number } | null => {
  const amounts: number[] = [];
  for (const row of vehicleFinancing.filter((f) => f.planId === planId)) {
    for (const s of row.schedule) {
      if ((s.type === "ORDINARY" || s.type === "FIXED") && s.amount !== null) amounts.push(s.amount);
    }
  }
  if (amounts.length === 0) return null;
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
};

const rangeText = (r: { min: number; max: number } | null) =>
  !r ? "Consultar" : r.min === r.max ? fmtUsd(r.min) : `${fmtUsd(r.min)} a ${fmtUsd(r.max)}`;

const PlanesFinanciamiento = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <>
      <Helmet>
        <title>Planes de financiamiento JAC: cuota, cuotas y pre-entrega</title>
        <meta
          name="description"
          content="Detalle de cada plan de financiamiento JAC: cuota mensual, número de cuotas, pago a la firma, pre-entrega y requisitos. Comparte cada plan por enlace."
        />
        <link rel="canonical" href="https://rigobertomolina.com/financiamiento/planes" />
      </Helmet>

      <section className="pt-16 pb-10 bg-secondary/40 border-b border-border">
        <div className="section-container max-w-3xl text-center">
          <Link
            to="/financiamiento"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft size={15} /> Volver a Financiamiento
          </Link>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight">
            Planes de financiamiento al detalle
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Cada plan con su cuota mensual, número de cuotas, pago a la firma, pre-entrega y requisitos. Puedes
            compartir cualquier plan con un enlace directo.
          </p>
          <div className="mt-6 flex justify-center">
            <SharePlanButton
              title="Planes de financiamiento JAC"
              path="/financiamiento/planes"
              label="Compartir todos los planes"
            />
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="section-container max-w-4xl space-y-6">
          {verifiedPlans.map((plan) => {
            const firma = plan.template.find((s) => s.type === "SIGNATURE");
            const preEntrega = plan.template.find((s) => s.type === "PRE_DELIVERY");
            const iniciales = plan.template
              .filter((s) => s.type === "INITIAL")
              .reduce((sum, s) => sum + s.count, 0);
            const mensuales = plan.template
              .filter((s) => s.type === "ORDINARY" || s.type === "FIXED" || s.type === "SPECIAL")
              .reduce((sum, s) => sum + s.count, 0);
            const reqs = requirementsForPlan(plan.id);
            const isCredit = requiresCreditEvaluation(plan.id);

            return (
              <article
                key={plan.id}
                id={`plan-${plan.id}`}
                className="scroll-mt-24 rounded-2xl border border-border bg-secondary/30 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl font-bold">{plan.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground max-w-xl">{plan.description}</p>
                  </div>
                  <SharePlanButton title={plan.name} path={`/financiamiento/planes#plan-${plan.id}`} />
                </div>

                <dl className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { k: "Cuota mensual", v: rangeText(cuotaRangeForPlan(plan.id)) },
                    {
                      k: "N.º de cuotas",
                      v: iniciales > 0 ? `${iniciales} iniciales + ${mensuales} mensuales` : `${mensuales}`,
                    },
                    { k: "Firma", v: firma ? `${firma.count} pago` : "No aplica" },
                    { k: "Pre-entrega", v: preEntrega ? `${preEntrega.count} pago` : "No aplica" },
                  ].map((item) => (
                    <div key={item.k} className="rounded-xl border border-border bg-background/60 px-4 py-3">
                      <dt className="text-xs uppercase tracking-wide font-bold text-muted-foreground">{item.k}</dt>
                      <dd className="mt-1 text-sm font-semibold text-foreground">{item.v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 grid md:grid-cols-2 gap-5">
                  <div>
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Cronograma
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {plan.template.map((stage) => (
                        <li key={stage.label} className="flex items-start gap-2 text-sm">
                          <Check size={14} className="text-primary mt-0.5 shrink-0" />
                          <span>
                            {stage.count > 1 ? `${stage.count} × ` : ""}
                            {stage.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <ClipboardList size={16} className="text-primary shrink-0" />
                      <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        Requisitos
                      </h3>
                    </div>
                    <span className="mt-2 inline-flex w-fit items-center rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {isCredit === null
                        ? "Requisitos por confirmar"
                        : isCredit
                          ? "Evaluación de crédito"
                          : "Pago programado"}
                    </span>
                    {reqs.length > 0 ? (
                      <ul className="mt-2 space-y-1.5">
                        {reqs.map((req) => (
                          <li key={req} className="flex items-start gap-2 text-sm">
                            <Check size={14} className="text-primary mt-0.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {PENDING_REQUIREMENTS_NOTE}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={waLink(
                      `Hola Rigoberto, me interesa el plan ${plan.name}. ¿Me confirmas cuotas, recaudos y disponibilidad?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <MessageCircle size={15} /> Consultar este plan
                  </a>
                  <Link
                    to="/creditos"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-5 py-2.5 font-heading text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                  >
                    Ver por modelo <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}

          <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm font-bold text-amber-500">
            {APPLICATION_FORM_NOTE}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{FINANCING_DISCLAIMER}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{REQUIREMENTS_NOTE}</p>
        </div>
      </section>

      <FooterSection />
    </>
  );
};

export default PlanesFinanciamiento;
