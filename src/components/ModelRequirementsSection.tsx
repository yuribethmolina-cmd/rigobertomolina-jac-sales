import { Check, MessageCircle, Banknote, ShieldCheck, ClipboardList } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { vehicleCategories, vehiclesByCategory } from "@/data/vehicles";
import { financingOptionsFor } from "@/data/vehicleFinancing";
import {
  requiresCreditEvaluation,
  PENDING_REQUIREMENTS_NOTE,
  DIRECT_PLAN_REQUIREMENTS,
  CREDIT_PLAN_REQUIREMENTS,
  REQUIREMENTS_NOTE,
} from "@/data/financingPlans";
import { waLink } from "@/lib/constants";

const ModelRequirementsSection = () => (
  <section id="requisitos-modelo" className="py-16 bg-secondary/30 section-divider">
    <div className="section-container">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="section-title">Requisitos por modelo</h2>
        <p className="section-subtitle">
          Elige tu modelo y revisa qué planes aplican y qué documentos necesitas para cada uno.
        </p>
        <div className="teal-underline mx-auto" />
      </div>

      <div className="mt-10 space-y-8">
        {vehicleCategories.map((category) => {
          const models = vehiclesByCategory(category);
          if (models.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-primary">
                {category}
              </h3>
              <Accordion type="single" collapsible className="mt-3 space-y-2">
                {models.map((vehicle) => {
                  const options = financingOptionsFor(vehicle.id).filter((o) => o.hasAmounts);
                  const creditPlans = options.filter((o) => requiresCreditEvaluation(o.plan.id) === true);
                  const directPlans = options.filter((o) => requiresCreditEvaluation(o.plan.id) === false);
                  const pendingPlans = options.filter((o) => requiresCreditEvaluation(o.plan.id) === null);
                  return (
                    <AccordionItem
                      key={vehicle.id}
                      value={vehicle.id}
                      className="rounded-xl border border-primary/15 bg-background/60 px-4"
                    >
                      <AccordionTrigger className="text-left font-heading text-sm font-bold hover:no-underline hover:text-primary">
                        {vehicle.displayName}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5">
                        {options.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Consulta disponibilidad y condiciones vigentes para este modelo. Los
                            recaudos dependen del plan que elijas.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {options.map((o) => (
                                <span
                                  key={o.plan.id}
                                  className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"
                                >
                                  {o.plan.name}
                                </span>
                              ))}
                            </div>

                            {directPlans.length > 0 && (
                              <div className="rounded-lg border border-border p-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                  <Banknote size={12} /> Pago programado
                                </span>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {directPlans.map((o) => o.plan.name).join(" · ")}
                                </p>
                                <ul className="mt-2 space-y-1.5">
                                  {DIRECT_PLAN_REQUIREMENTS.map((r) => (
                                    <li key={r} className="flex items-start gap-2 text-sm">
                                      <Check size={13} className="text-primary mt-1 shrink-0" />
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {creditPlans.length > 0 && (
                              <div className="rounded-lg border border-border p-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                                  <ShieldCheck size={12} /> Evaluación de crédito
                                </span>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {creditPlans.map((o) => o.plan.name).join(" · ")}
                                </p>
                                <ul className="mt-2 space-y-1.5">
                                  {CREDIT_PLAN_REQUIREMENTS.map((r) => (
                                    <li key={r} className="flex items-start gap-2 text-sm">
                                      <Check size={13} className="text-primary mt-1 shrink-0" />
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {pendingPlans.length > 0 && (
                              <div className="rounded-lg border border-border p-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                  <ClipboardList size={12} /> Requisitos por confirmar
                                </span>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {pendingPlans.map((o) => o.plan.name).join(" · ")}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                  {PENDING_REQUIREMENTS_NOTE}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-3">
                          <a
                            href={waLink(
                              `Hola Rigoberto, quiero los recaudos para comprar el ${vehicle.displayName}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-heading text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                          >
                            <MessageCircle size={14} /> Consultar recaudos
                          </a>
                          <Link
                            to={`/modelo/${vehicle.id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-4 py-2.5 font-heading text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                          >
                            Ver el modelo
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
        {REQUIREMENTS_NOTE}
      </p>
    </div>
  </section>
);

export default ModelRequirementsSection;
