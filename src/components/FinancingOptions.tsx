import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  FINANCING_DISCLAIMER,
  NOT_VERIFIED_LABEL,
  fmtUsd,
} from "@/data/financingPlans";
import { financingOptionsFor } from "@/data/vehicleFinancing";
import type { Vehicle } from "@/data/vehicles";
import WhatsAppButton from "@/components/WhatsAppButton";

export const waPlanMessage = (vehicleName: string, planName: string) =>
  `Hola Rigoberto, estoy viendo el ${vehicleName} y me interesa el plan ${planName}. ¿Me puedes enviar el cronograma actualizado y confirmar disponibilidad?`;

interface Props {
  vehicle: Vehicle;
  source?: string;
}

const FinancingOptions = ({ vehicle, source = "opciones-financiamiento" }: Props) => {
  const options = financingOptionsFor(vehicle.id);
  const [activeId, setActiveId] = useState(options[0]?.plan.id ?? "");
  const active = options.find((o) => o.plan.id === activeId) ?? options[0];

  if (!active) return null;

  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-bold">Opciones de financiamiento</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Selecciona un plan para ver el cronograma de pagos de esta configuración.
      </p>

      {/* Selector de planes */}
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {options.map((o) => (
            <button
              key={o.plan.id}
              type="button"
              onClick={() => setActiveId(o.plan.id)}
              className={`px-4 py-2 rounded-lg text-sm font-heading font-bold border transition-colors ${
                active.plan.id === o.plan.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-primary/30 text-primary hover:bg-primary/10"
              }`}
            >
              {o.plan.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cronograma del plan activo */}
      <div className="mt-4 rounded-xl border border-primary/20 overflow-hidden">
        <div className="px-4 py-3 bg-primary/10">
          <p className="font-heading text-sm font-bold text-primary">{active.plan.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{active.plan.description}</p>
        </div>

        {active.plan.template.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            {NOT_VERIFIED_LABEL}. No tenemos un documento vigente para publicar el cronograma de este plan.
          </p>
        ) : (
          <ul className="divide-y divide-primary/10">
            {active.schedule.map((stage, i) => (
              <li key={`${stage.type}-${i}`} className="px-4 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground font-medium">{stage.label}</p>
                  {stage.count > 1 && (
                    <p className="text-xs text-muted-foreground">{stage.count} pagos</p>
                  )}
                </div>
                <p
                  className={`text-sm font-heading font-bold text-right whitespace-nowrap ${
                    stage.amount === null ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {stage.amount === null
                    ? NOT_VERIFIED_LABEL
                    : `${fmtUsd(stage.amount)}${stage.count > 1 ? " c/u" : ""}`}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="px-4 py-3 border-t border-primary/10 space-y-2">
          {active.plan.sourceStatus === "REVIEW_NOT_VERIFIED" && (
            <p className="flex items-start gap-2 text-xs text-amber-500">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Plan en revisión: sin documento vigente del 17 de agosto. Confirma condiciones antes de contratar.
            </p>
          )}
          {active.plan.sourceStatus === "VERIFIED_17_AUG" && !active.hasAmounts && (
            <p className="flex items-start gap-2 text-xs text-amber-500">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Estructura verificada con el documento del 17 de agosto. Los importes se confirman por WhatsApp.
            </p>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">{FINANCING_DISCLAIMER}</p>
        </div>
      </div>

      <div className="mt-4">
        <WhatsAppButton
          message={waPlanMessage(vehicle.displayName, active.plan.name)}
          label={`Consultar ${active.plan.name} por WhatsApp`}
          model={vehicle.displayName}
          plan={active.plan.name}
          source={source}
        />
      </div>
    </section>
  );
};

export default FinancingOptions;
