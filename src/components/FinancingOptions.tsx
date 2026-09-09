import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, Check, ChevronDown, FileUp } from "lucide-react";
import ApplicationFormButton from "@/components/ApplicationFormButton";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FINANCING_DISCLAIMER,
  DE_UNA_DISCLAIMER,
  NOT_VERIFIED_LABEL,
  PENDING_REQUIREMENTS_NOTE,
  APPLICATION_FORM_NOTE,
  REQUIREMENTS_NOTE,
  requirementsForPlan,
  requirementsStatusForPlan,
  requiresCreditEvaluation,
  fmtUsd,
} from "@/data/financingPlans";
import { financingOptionsFor } from "@/data/vehicleFinancing";
import type { Vehicle } from "@/data/vehicles";
import WhatsAppButton from "@/components/WhatsAppButton";
import SharePlanButton from "@/components/SharePlanButton";
import { cn } from "@/lib/utils";

export const waPlanMessage = (vehicleName: string, planName: string) =>
  `Hola Rigoberto, estoy viendo el ${vehicleName} y me interesa el plan ${planName}. ¿Me puedes enviar el cronograma actualizado y confirmar disponibilidad?`;

interface Props {
  vehicle: Vehicle;
  source?: string;
}

const FinancingOptions = ({ vehicle, source = "opciones-financiamiento" }: Props) => {
  const options = financingOptionsFor(vehicle.id);
  const [openValue, setOpenValue] = useState<string>(options[0]?.plan.id ?? "");
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash?.startsWith("#plan-")) return;
    const planId = hash.slice("#plan-".length);
    if (!options.some((o) => o.plan.id === planId)) return;
    setOpenValue(planId);
    const el = document.getElementById(`plan-${planId}`);
    if (el) {
      window.setTimeout(
        () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
        150,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, vehicle.id]);

  if (options.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-bold">Opciones de financiamiento</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Toca cada plan para ver su cronograma de pagos.
      </p>

      <Accordion
        type="single"
        collapsible
        value={openValue}
        onValueChange={setOpenValue}
        className="mt-4 space-y-2"
      >
        {options.map((opt) => {
          const isOpen = openValue === opt.plan.id;
          /* La cuota mensual real es la última etapa recurrente del cronograma
             (ORDINARY o FIXED), nunca los pagos de inicial. */
          const monthlyStages = opt.schedule.filter(
            (s) => (s.type === "ORDINARY" || s.type === "FIXED") && s.count > 1 && s.amount !== null,
          );
          const keyAmount =
            monthlyStages[monthlyStages.length - 1]?.amount ??
            opt.schedule.find((s) => s.count > 1 && s.amount !== null)?.amount;
          const inReview = opt.plan.sourceStatus === "REVIEW_NOT_VERIFIED";

          return (
            <AccordionItem
              key={opt.plan.id}
              id={`plan-${opt.plan.id}`}
              value={opt.plan.id}
              className={cn(
                "rounded-xl border overflow-hidden border-b",
                isOpen
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-secondary/40",
              )}
            >
              <AccordionTrigger
                className={cn(
                  "px-4 py-3.5 hover:no-underline group [&>svg]:hidden",
                  isOpen ? "text-primary" : "text-foreground",
                )}
              >
                <div className="flex items-center justify-between gap-3 w-full pr-2">
                  <div className="text-left min-w-0">
                    <p className="font-heading text-sm font-bold truncate">
                      {opt.plan.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {inReview
                        ? "En revisión"
                        : keyAmount !== undefined && keyAmount !== null
                          ? `Desde ${fmtUsd(keyAmount)} / mes`
                          : NOT_VERIFIED_LABEL}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {inReview && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> Revisión
                      </span>
                    )}
                    <ChevronDown
                      size={18}
                      className={cn(
                        "text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180 text-primary",
                      )}
                    />
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-0">
                <div className="pt-1 pb-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opt.plan.description}
                  </p>

                  {opt.plan.template.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      {NOT_VERIFIED_LABEL}. No tenemos un documento vigente para publicar el cronograma de este plan.
                    </p>
                  ) : (
                    <>
                      <ul className="divide-y divide-primary/10 rounded-lg border border-primary/15 overflow-hidden">
                        {opt.schedule.map((stage, i) => (
                          <li
                            key={`${stage.type}-${i}`}
                            className="px-3 py-2.5 flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-foreground font-medium">
                                {stage.label}
                              </p>
                              {stage.count > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  {stage.count} pagos
                                </p>
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-sm font-heading font-bold text-right whitespace-nowrap shrink-0",
                                stage.amount === null
                                  ? "text-muted-foreground"
                                  : "text-foreground",
                              )}
                            >
                              {stage.amount === null
                                ? "—"
                                : `${fmtUsd(stage.amount)}${stage.count > 1 ? " c/u" : ""}`}
                            </p>
                          </li>
                        ))}
                      </ul>
                      {!opt.hasAmounts && (
                        <p className="text-xs text-muted-foreground">
                          {NOT_VERIFIED_LABEL}. Estructura oficial del plan; los importes se confirman por WhatsApp.
                        </p>
                      )}
                    </>
                  )}

                  <div className="rounded-lg border border-border bg-background/40 p-3">
                    <p className="font-heading text-sm font-bold">
                      Requisitos para este plan
                    </p>
                    {requirementsStatusForPlan(opt.plan.id) ? (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {PENDING_REQUIREMENTS_NOTE}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {requiresCreditEvaluation(opt.plan.id)
                            ? "Incluye evaluación de crédito."
                            : "Sin evaluación de crédito."}
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {requirementsForPlan(opt.plan.id).map((req) => (
                            <li key={req} className="flex items-start gap-2 text-sm text-foreground">
                              <Check size={14} className="mt-1 shrink-0 text-primary" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs font-bold leading-relaxed text-amber-500">
                          {APPLICATION_FORM_NOTE}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {REQUIREMENTS_NOTE}
                        </p>

                      </>
                    )}
                  </div>



                  <div className="space-y-2">
                    {opt.plan.sourceStatus === "REVIEW_NOT_VERIFIED" && (
                      <p className="flex items-start gap-2 text-xs text-amber-500">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        Plan en revisión: sin documento vigente. Confirma condiciones antes de contratar.
                      </p>
                    )}
                    {opt.plan.sourceStatus !== "REVIEW_NOT_VERIFIED" && !opt.hasAmounts && (
                      <p className="flex items-start gap-2 text-xs text-amber-500">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        Estructura verificada con el catálogo vigente. Los importes se confirman por WhatsApp.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {FINANCING_DISCLAIMER}
                    </p>
                    {opt.plan.id === "llevatelo-de-una" && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {DE_UNA_DISCLAIMER}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <WhatsAppButton
                      message={waPlanMessage(vehicle.displayName, opt.plan.name)}
                      label={`Consultar ${opt.plan.name} por WhatsApp`}
                      model={vehicle.displayName}
                      plan={opt.plan.name}
                      source={source}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        to={`/enviar-documentos?plan=${encodeURIComponent(opt.plan.id)}&modelo=${encodeURIComponent(vehicle.displayName)}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary/15 px-4 py-3 font-heading text-sm font-bold text-primary hover:bg-primary/25 transition-colors"
                      >
                        <FileUp size={16} /> Enviar mis documentos
                      </Link>
                      <ApplicationFormButton
                        modelo={vehicle.displayName}
                        plan={opt.plan.name}
                        label="Descargar planilla"
                        className="flex-1"
                      />
                    </div>
                    <SharePlanButton
                      title={`${vehicle.displayName} — ${opt.plan.name}`}
                      path={`/modelo/${vehicle.id}#plan-${opt.plan.id}`}
                      label="Compartir esta opción"
                      className="w-full"
                    />
                  </div>

                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
};

export default FinancingOptions;
