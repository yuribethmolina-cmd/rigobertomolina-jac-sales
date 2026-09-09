import { X } from "lucide-react";
import { findVehicle } from "@/data/vehicles";
import { documentedMonthlyQuotas, usd } from "@/lib/advisorMatch";

interface Props {
  ids: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const CONSULT = "Consultar con Rigoberto";

const AdvisorCompare = ({ ids, onRemove, onClear }: Props) => {
  const items = ids.map((id) => findVehicle(id)).filter(Boolean);
  if (items.length < 2) return null;

  const rows: { label: string; value: (id: string) => string }[] = [
    { label: "Tipo", value: (id) => findVehicle(id)?.category ?? CONSULT },
    { label: "Transmisión", value: (id) => findVehicle(id)?.transmission ?? CONSULT },
    { label: "Combustible", value: (id) => findVehicle(id)?.fuel ?? CONSULT },
    { label: "Tracción", value: (id) => findVehicle(id)?.drivetrain ?? CONSULT },
    {
      label: "Ideal para",
      value: (id) => findVehicle(id)?.tagline ?? CONSULT,
    },
    {
      label: "Cuota mensual documentada",
      value: (id) => {
        const q = documentedMonthlyQuotas(id);
        if (!q.length) return CONSULT;
        const min = q.reduce((a, b) => (b.amount < a.amount ? b : a));
        return `${usd(min.amount)} (${min.planName})`;
      },
    },
    {
      label: "Disponibilidad",
      value: (id) =>
        findVehicle(id)?.unavailable ? "No disponible por los momentos" : "Consultar con Rigoberto",
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-foreground">Comparación</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-primary"
        >
          Limpiar
        </button>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
        {items.map((v) => (
          <div key={v!.id} className="flex items-start justify-between gap-1">
            <p className="text-sm font-heading font-bold text-foreground">{v!.displayName}</p>
            <button type="button" onClick={() => onRemove(v!.id)} aria-label={`Quitar ${v!.displayName}`}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>

      <dl className="mt-3 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</dt>
            <dd
              className="mt-1 grid gap-3 text-sm text-foreground"
              style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}
            >
              {items.map((v) => (
                <span key={v!.id}>{row.value(v!.id)}</span>
              ))}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs text-muted-foreground">
        Montos, condiciones y disponibilidad pueden cambiar. Confirma siempre con Rigoberto.
      </p>
    </section>
  );
};

export default AdvisorCompare;
