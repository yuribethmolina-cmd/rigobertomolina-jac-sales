/* ══════════════════════════════════════════════════════════════
   CATÁLOGOS ACTIVOS (base de datos)
   ══════════════════════════════════════════════════════════════
   El sitio sigue teniendo una sola fuente de verdad. Los importes
   publicados viven en la versión ACTIVA de cada plan; los archivos
   de src/data quedan como respaldo si la base no responde.
   ══════════════════════════════════════════════════════════════ */

import { supabase } from "@/integrations/supabase/client";
import type { PaymentStage, StageType } from "./financingPlans";

export type CatalogStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type ChangeType = "UPDATED" | "UNCHANGED" | "NEW" | "REMOVED" | "NEEDS_REVIEW";

export interface CatalogVersion {
  id: string;
  plan_id: string;
  catalog_date: string;
  status: CatalogStatus;
  source: string;
  pdf_path: string | null;
  entries_count: number;
  notes: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogEntry {
  id: string;
  version_id: string;
  position: number;
  vehicle_id: string | null;
  model_name: string;
  version_label: string | null;
  signature_amount: number | null;
  installments_count: number | null;
  installment_amount: number | null;
  pre_delivery_amount: number | null;
  promo: string | null;
  conditions: string | null;
  extra: { schedule?: PaymentStage[] } & Record<string, unknown>;
  change_type: ChangeType;
  edited_fields: string[];
}

export interface ActivePlanCatalog {
  version: CatalogVersion;
  entries: CatalogEntry[];
}

/** Cronograma de un registro: usa el guardado o lo arma con los campos comunes. */
export const scheduleOfEntry = (entry: CatalogEntry): PaymentStage[] => {
  const saved = entry.extra?.schedule;
  if (Array.isArray(saved) && saved.length) return saved;

  const stages: PaymentStage[] = [];
  if (entry.signature_amount != null)
    stages.push({
      type: "SIGNATURE" as StageType,
      count: 1,
      amount: entry.signature_amount,
      label: "Pago a la firma del contrato",
    });
  if (entry.installment_amount != null && entry.installments_count != null)
    stages.push({
      type: "ORDINARY" as StageType,
      count: entry.installments_count,
      amount: entry.installment_amount,
      label: `${entry.installments_count} cuotas consecutivas y mensuales`,
    });
  if (entry.pre_delivery_amount != null)
    stages.push({
      type: "PRE_DELIVERY" as StageType,
      count: 1,
      amount: entry.pre_delivery_amount,
      label: "Pago previo a la entrega",
    });
  return stages;
};

let activeCatalogs: Record<string, ActivePlanCatalog> | null = null;
let catalogVersion = 0;
const listeners = new Set<() => void>();

export const getActiveCatalogs = () => activeCatalogs;

/** Contador que cambia cada vez que llegan catálogos nuevos. */
export const getCatalogVersion = () => catalogVersion;

export const subscribeToCatalogs = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

/** Permite que un componente se vuelva a calcular cuando cambian los catálogos. */
export const useCatalogVersion = () =>
  useSyncExternalStore(subscribeToCatalogs, getCatalogVersion, getCatalogVersion);

/** Carga las versiones ACTIVAS y sus registros. Silencioso si falla: queda el respaldo. */
export const loadActiveCatalogs = async (): Promise<void> => {
  const { data: versions, error } = await supabase
    .from("catalog_versions")
    .select("*")
    .eq("status", "ACTIVE");
  if (error || !versions?.length) return;

  const { data: entries, error: entriesError } = await supabase
    .from("catalog_entries")
    .select("*")
    .in(
      "version_id",
      versions.map((v) => v.id)
    )
    .order("position", { ascending: true });
  if (entriesError) return;

  const next: Record<string, ActivePlanCatalog> = {};
  for (const version of versions as unknown as CatalogVersion[]) {
    next[version.plan_id] = {
      version,
      entries: ((entries ?? []) as unknown as CatalogEntry[]).filter(
        (e) => e.version_id === version.id
      ),
    };
  }
  activeCatalogs = next;
  listeners.forEach((fn) => fn());
};
