/* ══════════════════════════════════════════════════════════════
   FUENTE ÚNICA DE VERDAD — FINANCIAMIENTO POR VEHÍCULO
   ══════════════════════════════════════════════════════════════
   Un importe solo aparece aquí si puede trazarse a un catálogo.
   Si no hay documento vigente, el monto es `null` y la UI muestra
   "Consultar disponibilidad y condiciones". Nunca se estima.
   ══════════════════════════════════════════════════════════════ */

import {
  financingPlans,
  getPlan,
  type FinancingPlan,
  type PaymentStage,
  type SourceStatus,
} from "./financingPlans";
import { findVehicle } from "./vehicles";

export interface VehicleFinancing {
  vehicleId: string;
  planId: string;
  currency: "USD";
  /** Estado de los IMPORTES (no de la estructura del plan). */
  amountsSourceStatus: SourceStatus;
  amountsSource: string;
  schedule: PaymentStage[];
}

const PAGO_FACIL_SIGNATURE = 999.9;

const CATALOGO_17_AGO = "Catálogo Compra Directa / Pago Fácil 17 de agosto de 2026";

/* Cuotas mensuales trazables al catálogo del 17 de agosto.
   `pago-facil` = cuota mensual de las 12 cuotas.
   `compra-directa` = cuota de los 7 pagos (plan pendiente de revalidación). */
const monthlyQuotas: { vehicleId: string; planId: string; cuota: number }[] = [
  { vehicleId: "arena-sport-manual", planId: "pago-facil", cuota: 1242 },
  { vehicleId: "arena-sport-manual", planId: "compra-directa", cuota: 2568 },
  { vehicleId: "arena-sport-automatico", planId: "pago-facil", cuota: 1351 },
  { vehicleId: "arena-sport-automatico", planId: "compra-directa", cuota: 2775 },
  { vehicleId: "arena-pro", planId: "pago-facil", cuota: 1491 },
  { vehicleId: "arena-pro", planId: "compra-directa", cuota: 3040 },
  { vehicleId: "nevado-manual", planId: "pago-facil", cuota: 1655 },
  { vehicleId: "nevado-manual", planId: "compra-directa", cuota: 3352 },
  { vehicleId: "nevado-automatico", planId: "pago-facil", cuota: 2677 },
  { vehicleId: "nevado-automatico", planId: "compra-directa", cuota: 3715 },
  { vehicleId: "tepuy-pro", planId: "pago-facil", cuota: 2311 },
  { vehicleId: "tepuy-pro", planId: "compra-directa", cuota: 4594 },
  { vehicleId: "gx7", planId: "pago-facil", cuota: 2212 },
  { vehicleId: "gx7", planId: "compra-directa", cuota: 4407 },
  { vehicleId: "refine", planId: "pago-facil", cuota: 3931 },
  { vehicleId: "refine", planId: "compra-directa", cuota: 7665 },
  { vehicleId: "elite", planId: "pago-facil", cuota: 2380 },
  { vehicleId: "elite", planId: "compra-directa", cuota: 4258 },
  { vehicleId: "aventura-pro-a-gasolina", planId: "pago-facil", cuota: 3478 },
  { vehicleId: "aventura-pro-a-gasolina", planId: "compra-directa", cuota: 6813 },
  { vehicleId: "aventura-a-gasolina", planId: "pago-facil", cuota: 2790 },
  { vehicleId: "aventura-a-gasolina", planId: "compra-directa", cuota: 5510 },
  { vehicleId: "limited", planId: "pago-facil", cuota: 2838 },
  { vehicleId: "limited", planId: "compra-directa", cuota: 5601 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", planId: "pago-facil", cuota: 1635 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", planId: "compra-directa", cuota: 3319 },
  { vehicleId: "la-venezolana-a-diesel-4x2", planId: "pago-facil", cuota: 1690 },
  { vehicleId: "la-venezolana-a-diesel-4x2", planId: "compra-directa", cuota: 3423 },
  { vehicleId: "la-venezolana-a-diesel-4x4", planId: "pago-facil", cuota: 1903 },
  { vehicleId: "la-venezolana-a-diesel-4x4", planId: "compra-directa", cuota: 3828 },
  { vehicleId: "la-venezolana-pro-4x4", planId: "pago-facil", cuota: 2269 },
  { vehicleId: "la-venezolana-pro-4x4", planId: "compra-directa", cuota: 4522 },
  { vehicleId: "sunray-v4-carga", planId: "compra-directa", cuota: 5238 },
  { vehicleId: "sunray-v6-pasajeros", planId: "pago-facil", cuota: 2785 },
  { vehicleId: "sunray-v6-pasajeros", planId: "compra-directa", cuota: 5945 },
  { vehicleId: "sunray-v6-carga", planId: "pago-facil", cuota: 3119 },
  { vehicleId: "sunray-v6-carga", planId: "compra-directa", cuota: 5643 },
  { vehicleId: "x100-ferretero", planId: "pago-facil", cuota: 1197 },
  { vehicleId: "x100-ferretero", planId: "compra-directa", cuota: 2489 },
  { vehicleId: "urban-3-ton", planId: "pago-facil", cuota: 1798 },
  { vehicleId: "urban-3-ton", planId: "compra-directa", cuota: 3630 },
  { vehicleId: "urban-chasis-largo-3-ton", planId: "pago-facil", cuota: 1692 },
  { vehicleId: "urban-chasis-largo-3-ton", planId: "compra-directa", cuota: 3427 },
  { vehicleId: "c-3500-ferretero-4x4", planId: "pago-facil", cuota: 2499 },
  { vehicleId: "c-3500-ferretero-4x4", planId: "compra-directa", cuota: 4958 },
  { vehicleId: "doble-cabina-ferretero", planId: "pago-facil", cuota: 2023 },
  { vehicleId: "doble-cabina-ferretero", planId: "compra-directa", cuota: 4056 },
  { vehicleId: "6t-ferretero", planId: "pago-facil", cuota: 2664 },
  { vehicleId: "6t-ferretero", planId: "compra-directa", cuota: 5270 },
  { vehicleId: "bufalo-12-ton", planId: "pago-facil", cuota: 3862 },
  { vehicleId: "bufalo-12-ton", planId: "compra-directa", cuota: 7541 },
  { vehicleId: "bufalo-xl", planId: "pago-facil", cuota: 4068 },
  { vehicleId: "bufalo-xl", planId: "compra-directa", cuota: 7932 },
  { vehicleId: "leyenda-20-ton", planId: "pago-facil", cuota: 5609 },
  { vehicleId: "leyenda-20-ton", planId: "compra-directa", cuota: 10853 },
  { vehicleId: "cavalino", planId: "pago-facil", cuota: 3896 },
  { vehicleId: "cavalino", planId: "compra-directa", cuota: 7606 },
  { vehicleId: "bachaco-400-hp", planId: "pago-facil", cuota: 5429 },
  { vehicleId: "bachaco-400-hp", planId: "compra-directa", cuota: 10249 },
  { vehicleId: "chuto-4251-430-hp", planId: "pago-facil", cuota: 6193 },
  { vehicleId: "chuto-4251-430-hp", planId: "compra-directa", cuota: 11960 },
  { vehicleId: "minero-14m3", planId: "pago-facil", cuota: 5512 },
  { vehicleId: "minero-14m3", planId: "compra-directa", cuota: 10669 },
  { vehicleId: "minero-20m3", planId: "pago-facil", cuota: 7327 },
  { vehicleId: "minero-20m3", planId: "compra-directa", cuota: 14109 },
  { vehicleId: "sunray-v4-ambulancia", planId: "pago-facil", cuota: 4837 },
  { vehicleId: "sunray-v4-ambulancia", planId: "compra-directa", cuota: 5330 },
  { vehicleId: "compactador-5-ton", planId: "pago-facil", cuota: 5642 },
  { vehicleId: "compactador-5-ton", planId: "compra-directa", cuota: 4661 },
  { vehicleId: "m4-carroza", planId: "pago-facil", cuota: 3875 },
  { vehicleId: "m4-carroza", planId: "compra-directa", cuota: 6386 },];

const CATALOGO_FIAO_06_AGO = "Catálogo Llévatelo Fiao 06 de agosto de 2026";

/* Cronogramas Llévatelo Fiao trazables al catálogo del 6 de agosto (OCR).
   Estructura documentada: pago a la firma + 5 pagos de igual monto (inicial)
   + pre-entrega + 12 cuotas ordinarias. */
const fiaoQuotas: {
  vehicleId: string;
  firma: number;
  preEntrega: number;
  cuota: number;
}[] = [
  { vehicleId: "arena-sport-manual", firma: 1298.7, preEntrega: 3559.2, cuota: 974.0 },
  { vehicleId: "arena-sport-automatico", firma: 1419.9, preEntrega: 3841.5, cuota: 1064.9 },
  { vehicleId: "arena-pro", firma: 1564.2, preEntrega: 4177.8, cuota: 1173.2 },
  { vehicleId: "tepuy-pro", firma: 2487.4, preEntrega: 6328.9, cuota: 1865.6 },
  { vehicleId: "la-venezolana-a-diesel-4x2", firma: 1861.5, preEntrega: 4917.5, cuota: 1396.1 },
  { vehicleId: "la-venezolana-a-diesel-4x4", firma: 2063.5, preEntrega: 5388.1, cuota: 1547.6 },
];

/** Cronograma con importes conocidos (Pago Fácil y Compra Directa). */
const buildScheduleFor = (plan: FinancingPlan, cuota: number): PaymentStage[] => {
  if (plan.id === "pago-facil") {
    return [
      { type: "SIGNATURE", count: 1, amount: PAGO_FACIL_SIGNATURE, label: "Pago a la firma del contrato" },
      { type: "ORDINARY", count: 12, amount: cuota, label: "12 cuotas consecutivas y mensuales" },
      { type: "PRE_DELIVERY", count: 1, amount: null, label: "Pago previo a la entrega" },
    ];
  }
  return [
    { type: "SIGNATURE", count: 1, amount: cuota, label: "Afiliación / pago a la firma" },
    { type: "ORDINARY", count: 5, amount: cuota, label: "5 cuotas mensuales" },
    { type: "PRE_DELIVERY", count: 1, amount: null, label: "Pago previo a la entrega" },
  ];
};

const buildFiaoSchedule = (q: { firma: number; preEntrega: number; cuota: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: q.firma, label: "Pago a la firma del contrato" },
  { type: "INITIAL", count: 5, amount: q.firma, label: "5 pagos para completar la inicial" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Cuota especial previa a la entrega" },
  { type: "ORDINARY", count: 12, amount: q.cuota, label: "12 cuotas ordinarias mensuales (catálogo 06 ago)" },
];

export const vehicleFinancing: VehicleFinancing[] = [
  ...monthlyQuotas.flatMap((q) => {
    const plan = getPlan(q.planId);
    if (!plan) return [];
    return [
      {
        vehicleId: q.vehicleId,
        planId: q.planId,
        currency: "USD" as const,
        amountsSourceStatus: plan.sourceStatus,
        amountsSource: CATALOGO_17_AGO,
        schedule: buildScheduleFor(plan, q.cuota),
      },
    ];
  }),
  ...fiaoQuotas.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "llevatelo-fiao",
    currency: "USD" as const,
    amountsSourceStatus: "REVIEW_NOT_VERIFIED" as SourceStatus,
    amountsSource: CATALOGO_FIAO_06_AGO,
    schedule: buildFiaoSchedule(q),
  })),
];

/** Cronograma sin importes: solo estructura oficial del plan. */
const templateSchedule = (plan: FinancingPlan): PaymentStage[] =>
  plan.template.map((s) => ({ ...s, amount: null }));

export interface FinancingOption {
  plan: FinancingPlan;
  schedule: PaymentStage[];
  hasAmounts: boolean;
  amountsSourceStatus: SourceStatus;
  amountsSource?: string;
}

/**
 * Opciones de financiamiento de una configuración.
 * Devuelve los 6 planes verificados del 17 de agosto y, si existen datos
 * previos, los planes en revisión — siempre identificados como tales.
 */
export const financingOptionsFor = (vehicleKey: string): FinancingOption[] => {
  const vehicle = findVehicle(vehicleKey);
  if (!vehicle) return [];
  const rows = vehicleFinancing.filter((f) => f.vehicleId === vehicle.id);

  return financingPlans
    .filter(
      (plan) =>
        plan.sourceStatus === "VERIFIED_17_AUG" ||
        rows.some((r) => r.planId === plan.id)
    )
    .map((plan) => {
      const row = rows.find((r) => r.planId === plan.id);
      if (row) {
        return {
          plan,
          schedule: row.schedule,
          hasAmounts: row.schedule.some((s) => s.amount !== null),
          amountsSourceStatus: row.amountsSourceStatus,
          amountsSource: row.amountsSource,
        };
      }
      return {
        plan,
        schedule: templateSchedule(plan),
        hasAmounts: false,
        amountsSourceStatus: "REVIEW_NOT_VERIFIED" as SourceStatus,
      };
    });
};

/** Cuota mensual de Pago Fácil (12 cuotas) si está documentada. */
export const pagoFacilMonthly = (vehicleKey: string): number | null => {
  const vehicle = findVehicle(vehicleKey);
  if (!vehicle) return null;
  const row = vehicleFinancing.find(
    (f) => f.vehicleId === vehicle.id && f.planId === "pago-facil"
  );
  return row?.schedule.find((s) => s.type === "ORDINARY")?.amount ?? null;
};

/** Cuota de Compra Directa (plan en revisión) si está documentada. */
export const compraDirectaMonthly = (vehicleKey: string): number | null => {
  const vehicle = findVehicle(vehicleKey);
  if (!vehicle) return null;
  const row = vehicleFinancing.find(
    (f) => f.vehicleId === vehicle.id && f.planId === "compra-directa"
  );
  return row?.schedule.find((s) => s.type === "ORDINARY")?.amount ?? null;
};
