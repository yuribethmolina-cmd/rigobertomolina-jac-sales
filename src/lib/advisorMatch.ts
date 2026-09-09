import { vehicles, type Vehicle } from "@/data/vehicles";
import { financingOptionsFor } from "@/data/vehicleFinancing";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Modelos mencionados por el asesor en un mensaje. Solo nombres del catálogo. */
export const detectVehicles = (text: string, limit = 3): Vehicle[] => {
  const haystack = norm(text);
  const found: Vehicle[] = [];
  for (const v of vehicles) {
    const names = [v.displayName, v.canonicalName, ...v.aliases];
    if (names.some((n) => haystack.includes(norm(n)))) found.push(v);
    if (found.length >= limit) break;
  }
  return found;
};

export interface DocumentedQuota {
  planName: string;
  amount: number;
  count: number;
  label: string;
  source?: string;
}

/** Cuotas mensuales documentadas de un modelo. Nunca calcula ni estima. */
export const documentedMonthlyQuotas = (vehicleId: string): DocumentedQuota[] =>
  financingOptionsFor(vehicleId)
    .filter((o) => o.hasAmounts)
    .flatMap((o) =>
      o.schedule
        .filter((s) => s.amount !== null && (s.type === "ORDINARY" || s.type === "FIXED"))
        .map((s) => ({
          planName: o.plan.name,
          amount: s.amount as number,
          count: s.count,
          label: s.label,
          source: o.amountsSource,
        }))
    );

export const usd = (n: number) =>
  `US$ ${n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
