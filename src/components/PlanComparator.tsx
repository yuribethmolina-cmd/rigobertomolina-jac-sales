import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { financingOptionsFor } from "@/data/vehicleFinancing";
import { FINANCING_DISCLAIMER, NOT_VERIFIED_LABEL, fmtUsd } from "@/data/financingPlans";
import WhatsAppButton from "@/components/WhatsAppButton";

/* Comparador de planes para una misma configuración.
   Todo sale de src/data — sin estimaciones propias. */
const PlanComparator = () => {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const options = useMemo(() => (vehicle ? financingOptionsFor(vehicle.id) : []), [vehicle]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof vehicles>();
    for (const v of vehicles) {
      if (!map.has(v.category)) map.set(v.category, []);
      map.get(v.category)!.push(v);
    }
    return [...map.entries()];
  }, []);

  return (
    <section id="comparador" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">Compara los planes lado a lado</h2>
          <p className="section-subtitle">
            Elige una configuración y revisa el cronograma documentado de cada plan
          </p>
          <div className="teal-underline mx-auto" />
        </div>

        <div className="mt-8 max-w-md mx-auto">
          <label
            htmlFor="pc-vehicle"
            className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
          >
            Configuración
          </label>
          <select
            id="pc-vehicle"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
          >
            {grouped.map(([cat, list]) => (
              <optgroup key={cat} label={cat}>
                {list.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.displayName}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((o) => (
            <div
              key={o.plan.id}
              className="rounded-2xl border border-primary/25 bg-gradient-to-b from-secondary to-background p-5 flex flex-col"
            >
              <h3 className="font-heading text-lg font-bold">{o.plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{o.plan.description}</p>

              {o.plan.sourceStatus === "REVIEW_NOT_VERIFIED" && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-500">
                  <AlertTriangle size={13} /> Plan en revisión
                </p>
              )}

              <div className="mt-4 divide-y divide-primary/10 border-y border-primary/10 flex-1">
                {o.schedule.map((s) => (
                  <div key={s.label} className="flex items-start justify-between gap-3 py-2">
                    <span className="text-xs text-muted-foreground">
                      {s.count > 1 ? `${s.count} × ${s.label}` : s.label}
                    </span>
                    <span className="text-xs font-heading font-bold text-foreground text-right">
                      {s.amount === null ? "Consultar" : fmtUsd(s.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {!o.hasAmounts && (
                <p className="mt-3 text-xs text-muted-foreground">{NOT_VERIFIED_LABEL}</p>
              )}

              <WhatsAppButton
                className="mt-4 w-full !py-3 text-sm"
                label="Consultar este plan"
                message={`Hola Rigoberto, estoy viendo el ${vehicle?.displayName} y me interesa el plan ${o.plan.name}. ¿Me confirmas cronograma y disponibilidad?`}
                model={vehicle?.displayName}
                plan={o.plan.name}
                source="comparador-planes"
              />
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground max-w-3xl mx-auto text-center leading-relaxed">
          {FINANCING_DISCLAIMER}
        </p>
      </div>
    </section>
  );
};

export default PlanComparator;
