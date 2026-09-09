import { Link } from "react-router-dom";
import { ArrowUpRight, Check, GitCompare } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { documentedMonthlyQuotas, usd } from "@/lib/advisorMatch";

interface Props {
  vehicle: Vehicle;
  selected: boolean;
  onCompare: (id: string) => void;
}

const AdvisorModelCard = ({ vehicle, selected, onCompare }: Props) => {
  const quotas = documentedMonthlyQuotas(vehicle.id);
  const cheapest = quotas.length
    ? quotas.reduce((a, b) => (b.amount < a.amount ? b : a))
    : null;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <img
        src={vehicle.image}
        alt={`JAC ${vehicle.displayName}`}
        loading="lazy"
        className={`h-32 w-full object-cover ${vehicle.unavailable ? "opacity-50 grayscale" : ""}`}
      />
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5">{vehicle.category}</span>
          {vehicle.unavailable && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-500">
              No disponible por los momentos
            </span>
          )}
        </div>
        <h3 className="font-heading text-base font-bold text-foreground">{vehicle.displayName}</h3>
        {vehicle.tagline && <p className="text-sm text-muted-foreground">{vehicle.tagline}</p>}
        <p className="text-sm text-foreground">
          {cheapest
            ? `Desde ${usd(cheapest.amount)} al mes en ${cheapest.planName}`
            : "Consultar disponibilidad y condiciones con Rigoberto"}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={`/modelo/${vehicle.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-heading font-bold text-primary-foreground"
          >
            Ver detalles <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onCompare(vehicle.id)}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {selected ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
            {selected ? "En comparación" : "Comparar"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default AdvisorModelCard;
