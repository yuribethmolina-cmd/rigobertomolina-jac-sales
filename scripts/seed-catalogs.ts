/**
 * Genera el SQL de carga inicial de los catálogos activos a partir de la
 * fuente actual en src/data. No cambia ningún monto: es una copia literal.
 *
 * Uso: bun run scripts/seed-catalogs.ts > /tmp/seed-catalogs.sql
 */
import { vehicleFinancing } from "../src/data/vehicleFinancing";
import { financingPlans } from "../src/data/financingPlans";
import { findVehicle } from "../src/data/vehicles";

const q = (v: string | null | undefined) =>
  v === null || v === undefined ? "NULL" : `'${v.replace(/'/g, "''")}'`;
const n = (v: number | null | undefined) =>
  v === null || v === undefined ? "NULL" : String(v);

const planIds = [...new Set(vehicleFinancing.map((f) => f.planId))];

const out: string[] = ["BEGIN;"];

for (const planId of planIds) {
  const rows = vehicleFinancing.filter((f) => f.planId === planId);
  const plan = financingPlans.find((p) => p.id === planId);
  if (!plan || rows.length === 0) continue;

  const source = rows[0].amountsSource;
  out.push(`
INSERT INTO public.catalog_versions (plan_id, catalog_date, status, source, entries_count, notes, published_at)
VALUES (${q(planId)}, ${q(plan.effectiveDate)}, 'ACTIVE', ${q(source)}, ${rows.length}, 'Carga inicial desde los datos publicados en el sitio', now());`);

  rows.forEach((row, i) => {
    const vehicle = findVehicle(row.vehicleId);
    const signature = row.schedule.find((s) => s.type === "SIGNATURE");
    const ordinary = row.schedule.find((s) => s.type === "ORDINARY");
    const pre = row.schedule.find((s) => s.type === "PRE_DELIVERY");
    const extra = JSON.stringify({ schedule: row.schedule });
    out.push(
      `INSERT INTO public.catalog_entries (version_id, position, vehicle_id, model_name, signature_amount, installments_count, installment_amount, pre_delivery_amount, extra, change_type)
SELECT id, ${i}, ${q(row.vehicleId)}, ${q(vehicle?.displayName ?? row.vehicleId)}, ${n(signature?.amount ?? null)}, ${n(ordinary?.count ?? null)}, ${n(ordinary?.amount ?? null)}, ${n(pre?.amount ?? null)}, ${q(extra)}::jsonb, 'UNCHANGED'
FROM public.catalog_versions WHERE plan_id = ${q(planId)} AND status = 'ACTIVE';`
    );
  });
}

out.push("COMMIT;");
console.log(out.join("\n"));
