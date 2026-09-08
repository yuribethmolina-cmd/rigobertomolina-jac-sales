import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Check,
  MessageCircle,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { waLink } from "@/lib/constants";
import {
  financingPlans,
  FINANCING_DISCLAIMER,
  PENDING_REQUIREMENTS_NOTE,
  requirementsForPlan,
  requiresCreditEvaluation,
  REQUIREMENTS_NOTE,
} from "@/data/financingPlans";
import FooterSection from "@/components/FooterSection";
import ModelRequirementsSection from "@/components/ModelRequirementsSection";

const Creditos = () => (
  <>
    <Helmet>
      <title>Créditos JAC · Planes y requisitos · Rigoberto Molina</title>
      <meta
        name="description"
        content="Conoce cada plan de crédito y financiamiento JAC Venezuela con sus requisitos completos: Compra Directa, Pago Fácil, CrediJAC 35x35, Ruta 48, Facilito, Llévatelo Fiao y CrediExpress."
      />
    </Helmet>

    {/* Hero */}
    <section className="pt-16 pb-10 bg-secondary/40 border-b border-border">
      <div className="section-container text-center max-w-2xl">
        <Link
          to="/financiamiento"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft size={15} /> Volver a Financiamiento
        </Link>
        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
          Rigoberto Molina · Vendedor JAC Caracas
        </p>
        <h1 className="font-heading text-4xl font-bold leading-tight">
          Créditos JAC: planes y requisitos
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Cada plan de financiamiento con su cronograma y los documentos que necesitas para aplicar.
        </p>
      </div>
    </section>

    {/* Planes con requisitos */}
    <section className="py-16">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-6">
          {financingPlans.map((plan) => {
            const isCredit = requiresCreditEvaluation(plan.id);
            const reqs = requirementsForPlan(plan.id);
            const isVerified = plan.sourceStatus !== "REVIEW_NOT_VERIFIED";
            return (
              <article
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                  isVerified ? "border-primary/25 bg-secondary/40" : "border-border bg-secondary/20"
                }`}
              >
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl font-bold">{plan.name}</h2>
                    {isVerified ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vigente: {plan.effectiveDate}
                      </p>
                    ) : (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-amber-500">
                        <AlertTriangle size={12} /> Cronograma en revisión
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${
                      isCredit
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-background/60 border-border text-muted-foreground"
                    }`}
                  >
                    {isCredit ? <ShieldCheck size={12} /> : <Banknote size={12} />}
                    {isCredit === null
                      ? "Requisitos por confirmar"
                      : isCredit
                        ? "Evaluación de crédito"
                        : "Pago programado"}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>

                {/* Cronograma */}
                {plan.template.length > 0 && (
                  <div>
                    <h3 className="font-heading text-sm font-bold mb-2">Cómo se paga</h3>
                    <ul className="space-y-1.5">
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
                )}

                {/* Requisitos */}
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h3 className="font-heading text-sm font-bold mb-2 inline-flex items-center gap-2">
                    <ClipboardList size={15} className="text-primary" /> Requisitos
                  </h3>
                  {reqs.length > 0 ? (
                    <ul className="space-y-1.5">
                      {reqs.map((req) => (
                        <li key={req} className="flex items-start gap-2 text-sm">
                          <Check size={14} className="text-primary mt-0.5 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {PENDING_REQUIREMENTS_NOTE}
                    </p>
                  )}
                </div>

                <div className="mt-auto grid gap-2">
                  <Link
                    to={`/enviar-documentos?plan=${plan.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <FileUp size={16} /> Enviar mis documentos
                  </Link>
                  <a
                    href={waLink(
                      `Hola Rigoberto, quiero aplicar al plan ${plan.name}. ¿Me confirmas los recaudos vigentes y disponibilidad?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border px-5 py-3 font-heading text-sm font-bold hover:border-primary transition-colors"
                  >
                    <MessageCircle size={16} /> Aplicar a {plan.name}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {REQUIREMENTS_NOTE}
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {FINANCING_DISCLAIMER}
        </p>
      </div>
    </section>

    <ModelRequirementsSection />

    {/* CTA final */}
    <section className="py-16 bg-secondary/30 section-divider">
      <div className="section-container max-w-xl text-center">
        <h2 className="font-heading text-2xl font-bold">¿No sabes qué plan elegir?</h2>
        <p className="text-muted-foreground mt-2 mb-6">
          Rigoberto te ayuda a comparar y te confirma los recaudos exactos para el modelo que te interesa.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={waLink(
              "Hola Rigoberto, estuve revisando los créditos JAC y quiero que me asesores sobre qué plan me conviene."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <MessageCircle size={18} /> Hablar con Rigoberto
          </a>
          <Link
            to="/financiamiento"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-6 py-3.5 font-heading font-bold text-primary hover:bg-primary/5 transition-colors"
          >
            Ver resumen de financiamiento <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>

    <FooterSection />
  </>
);

export default Creditos;
