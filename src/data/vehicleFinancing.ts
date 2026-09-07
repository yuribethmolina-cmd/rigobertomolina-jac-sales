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

const CATALOGO_PF_04_SEP = "PAGO FÁCIL — 04 DE SEPTIEMBRE";

const CATALOGO_CD_04_SEP = "COMPRA DIRECTA — 04 DE SEPTIEMBRE";

/* ── PAGO FÁCIL — catálogo del 04 de septiembre ──
   Estructura: US$ 999,90 a la firma + 12 cuotas consecutivas y mensuales +
   1 pago previo a la entrega. 64 configuraciones, importes exactos del PDF. */
const pagoFacilSep: { vehicleId: string; cuota: number; preEntrega: number }[] = [
  { vehicleId: "arena-sport-manual", cuota: 1342.2, preEntrega: 3129.9 },
  { vehicleId: "arena-sport-automatico", cuota: 1451.4, preEntrega: 3339.6 },
  { vehicleId: "arena-pro", cuota: 1591.2, preEntrega: 3608.2 },
  { vehicleId: "nevado-manual", cuota: 1788.8, preEntrega: 3987.4 },
  { vehicleId: "tepuy-pro", cuota: 2444.5, preEntrega: 5246.3 },
  { vehicleId: "savanna", cuota: 2595.9, preEntrega: 5537.1 },
  { vehicleId: "rf8", cuota: 4131.1, preEntrega: 8484.7 },
  { vehicleId: "gx7", cuota: 2346.0, preEntrega: 5057.3 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", cuota: 1768.5, preEntrega: 3995.5 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", cuota: 1957.0, preEntrega: 4357.5 },
  { vehicleId: "la-venezolana-a-diesel-4x2", cuota: 1823.1, preEntrega: 4100.4 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", cuota: 2011.6, preEntrega: 4462.3 },
  { vehicleId: "la-venezolana-a-diesel-4x4", cuota: 2036.6, preEntrega: 4510.2 },
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", cuota: 1804.8, preEntrega: 4065.1 },
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", cuota: 2227.8, preEntrega: 4877.3 },
  { vehicleId: "la-venezolana-pro-4x4", cuota: 2402.8, preEntrega: 5213.4 },
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", cuota: 2619.5, preEntrega: 5629.5 },
  { vehicleId: "limited", cuota: 2971.9, preEntrega: 6306.0 },
  { vehicleId: "aventura-a-gasolina", cuota: 2923.8, preEntrega: 6213.7 },
  { vehicleId: "aventura-pro-a-gasolina", cuota: 3611.3, preEntrega: 7533.8 },
  { vehicleId: "x100-ferretero", cuota: 1296.8, preEntrega: 3089.9 },
  { vehicleId: "urban-chasis-largo-3-ton", cuota: 1825.1, preEntrega: 4104.3 },
  { vehicleId: "urban-3-ton", cuota: 1932.1, preEntrega: 4309.6 },
  { vehicleId: "c-3500-ferretero-4x4", cuota: 2476.3, preEntrega: 5354.4 },
  { vehicleId: "doble-cabina-ferretero", cuota: 2157.0, preEntrega: 4741.5 },
  { vehicleId: "6t-chasis", cuota: 2671.7, preEntrega: 5729.6 },
  { vehicleId: "6t-ferretero", cuota: 2864.2, preEntrega: 6099.2 },
  { vehicleId: "bufalo-12-ton", cuota: 4062.4, preEntrega: 8399.9 },
  { vehicleId: "bufalo-xl", cuota: 4285.5, preEntrega: 8828.1 },
  { vehicleId: "leyenda-20-ton", cuota: 5943.0, preEntrega: 12010.7 },
  { vehicleId: "leyenda-380-hp", cuota: 6550.9, preEntrega: 13177.7 },
  { vehicleId: "minero-20m3", cuota: 6361.4, preEntrega: 12813.9 },
  { vehicleId: "minero-28m3", cuota: 9459.4, preEntrega: 18762.1 },
  { vehicleId: "minero-14m3", cuota: 5511.7, preEntrega: 11182.5 },
  { vehicleId: "cavalino", cuota: 4096.5, preEntrega: 8465.2 },
  { vehicleId: "bachaco-400-hp", cuota: 5602.2, preEntrega: 11356.1 },
  { vehicleId: "chuto-4251-430-hp", cuota: 6504.9, preEntrega: 13089.4 },
  { vehicleId: "sunray-v4-pasajeros", cuota: 3052.0, preEntrega: 6459.8 },
  { vehicleId: "sunray-v4-carga", cuota: 2847.3, preEntrega: 6066.9 },
  { vehicleId: "sunray-v6-pasajeros", cuota: 3220.1, preEntrega: 6782.5 },
  { vehicleId: "sunray-v6-carga", cuota: 3060.7, preEntrega: 6476.6 },
  { vehicleId: "sunray-v6-van-escolar", cuota: 3655.4, preEntrega: 7618.4 },
  { vehicleId: "sunray-v4-ambulancia", cuota: 3969.4, preEntrega: 8174.2 },
  { vehicleId: "autobus-28-6-1-puestos", cuota: 5567.3, preEntrega: 11289.2 },
  { vehicleId: "compactador-5-ton", cuota: 4738.4, preEntrega: 9697.7 },
  { vehicleId: "compactador-10m3", cuota: 6695.3, preEntrega: 13455.1 },
  { vehicleId: "x100-cava-seca", cuota: 1640.6, preEntrega: 3749.9 },
  { vehicleId: "x100-cava-de-conservacion", cuota: 1795.0, preEntrega: 4046.3 },
  { vehicleId: "urban-cava-seca", cuota: 2227.3, preEntrega: 4876.4 },
  { vehicleId: "urban-cava-de-conservacion", cuota: 2416.4, preEntrega: 5239.5 },
  { vehicleId: "urban-cava-refrigerada", cuota: 3101.6, preEntrega: 6555.0 },
  { vehicleId: "6t-cava-seca", cuota: 3243.3, preEntrega: 6827.1 },
  { vehicleId: "6t-cava-de-conservacion", cuota: 3623.6, preEntrega: 7557.2 },
  { vehicleId: "6t-cava-refrigerada", cuota: 4599.8, preEntrega: 9431.5 },
  { vehicleId: "6t-brazo-hidraulico", cuota: 5287.1, preEntrega: 10751.2 },
  { vehicleId: "bufalo-cava-seca", cuota: 4978.8, preEntrega: 10159.4 },
  { vehicleId: "bufalo-cava-de-conservacion", cuota: 5361.1, preEntrega: 10893.4 },
  { vehicleId: "bufalo-cava-refrigerada", cuota: 6587.8, preEntrega: 13248.6 },
  { vehicleId: "bufalo-brazo-hidraulico", cuota: 9044.3, preEntrega: 17965.1 },
  { vehicleId: "leyenda-cava-seca", cuota: 7210.8, preEntrega: 14444.8 },
  { vehicleId: "leyenda-cava-refrigerada", cuota: 8377.3, preEntrega: 16684.3 },
  { vehicleId: "leyenda-brazo-hidraulico", cuota: 11478.5, preEntrega: 22638.7 },
  { vehicleId: "doble-cabina-brazo-elevador-20m", cuota: 5370.7, preEntrega: 10911.7 },
  { vehicleId: "volkan-mezclador-9m3", cuota: 9250.2, preEntrega: 18360.5 },
];

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

/** Cronograma de Pago Fácil con los importes del catálogo del 04 de septiembre. */
const buildPagoFacilSchedule = (q: { cuota: number; preEntrega: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: PAGO_FACIL_SIGNATURE, label: "Pago a la firma del contrato" },
  { type: "ORDINARY", count: 12, amount: q.cuota, label: "12 cuotas consecutivas y mensuales" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Pago previo a la entrega" },
];

/* ── COMPRA DIRECTA — catálogo del 04 de septiembre ──
   Estructura: 1 pago a la firma + 5 cuotas mensuales y consecutivas +
   1 pago previo a la entrega. En este catálogo las tres etapas tienen el
   mismo importe, tal como aparece impreso en cada página. 65 configuraciones. */
const compraDirectaSep: { vehicleId: string; monto: number }[] = [
  { vehicleId: "arena-sport-manual", monto: 2758.4 },
  { vehicleId: "arena-sport-automatico", monto: 2965.4 },
  { vehicleId: "arena-pro", monto: 3230.5 },
  { vehicleId: "nevado-manual", monto: 3605.0 },
  { vehicleId: "tepuy-pro", monto: 4847.9 },
  { vehicleId: "savanna", monto: 5135.0 },
  { vehicleId: "rf8", monto: 8045.2 },
  { vehicleId: "gx7", monto: 4661.2 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", monto: 3573.3 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", monto: 3930.6 },
  { vehicleId: "la-venezolana-a-diesel-4x2", monto: 3676.8 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", monto: 4034.1 },
  { vehicleId: "la-venezolana-a-diesel-4x4", monto: 4081.4 },
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", monto: 3642.0 },
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", monto: 4443.9 },
  { vehicleId: "la-venezolana-pro-4x4", monto: 4775.7 },
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", monto: 5186.5 },
  { vehicleId: "limited", monto: 5854.4 },
  { vehicleId: "aventura-a-gasolina", monto: 5763.3 },
  { vehicleId: "aventura-pro-a-gasolina", monto: 7066.6 },
  { vehicleId: "x100-ferretero", monto: 2679.1 },
  { vehicleId: "urban-chasis-largo-3-ton", monto: 3680.6 },
  { vehicleId: "urban-3-ton", monto: 3883.4 },
  { vehicleId: "c-3500-ferretero-4x4", monto: 4914.9 },
  { vehicleId: "doble-cabina-ferretero", monto: 4309.8 },
  { vehicleId: "6t-chasis", monto: 5285.4 },
  { vehicleId: "6t-ferretero", monto: 5650.3 },
  { vehicleId: "bufalo-12-ton", monto: 7921.8 },
  { vehicleId: "bufalo-xl", monto: 8344.5 },
  { vehicleId: "leyenda-20-ton", monto: 11486.7 },
  { vehicleId: "leyenda-380-hp", monto: 12639.0 },
  { vehicleId: "minero-20m3", monto: 12279.7 },
  { vehicleId: "minero-28m3", monto: 18152.5 },
  { vehicleId: "minero-14m3", monto: 10669.1 },
  { vehicleId: "cavalino", monto: 7986.2 },
  { vehicleId: "bachaco-400-hp", monto: 10840.5 },
  { vehicleId: "chuto-4251-430-hp", monto: 12551.8 },
  { vehicleId: "sunray-v4-pasajeros", monto: 6006.3 },
  { vehicleId: "sunray-v4-carga", monto: 5618.4 },
  { vehicleId: "sunray-v6-pasajeros", monto: 6324.9 },
  { vehicleId: "sunray-v6-carga", monto: 6022.8 },
  { vehicleId: "sunray-v6-motorhome", monto: 13500.0 },
  { vehicleId: "sunray-v6-van-escolar", monto: 7150.2 },
  { vehicleId: "sunray-v4-ambulancia", monto: 7738.6 },
  { vehicleId: "autobus-28-6-1-puestos", monto: 10774.4 },
  { vehicleId: "compactador-5-ton", monto: 9203.1 },
  { vehicleId: "compactador-10m3", monto: 12912.8 },
  { vehicleId: "x100-cava-seca", monto: 3330.8 },
  { vehicleId: "x100-cava-de-conservacion", monto: 3623.5 },
  { vehicleId: "urban-cava-seca", monto: 4443.0 },
  { vehicleId: "urban-cava-de-conservacion", monto: 4801.4 },
  { vehicleId: "urban-cava-refrigerada", monto: 6100.3 },
  { vehicleId: "6t-cava-seca", monto: 6368.9 },
  { vehicleId: "6t-cava-de-conservacion", monto: 7089.8 },
  { vehicleId: "6t-cava-refrigerada", monto: 8940.3 },
  { vehicleId: "6t-brazo-hidraulico", monto: 10243.3 },
  { vehicleId: "bufalo-cava-seca", monto: 9659.0 },
  { vehicleId: "bufalo-cava-de-conservacion", monto: 10383.6 },
  { vehicleId: "bufalo-cava-refrigerada", monto: 12709.0 },
  { vehicleId: "bufalo-brazo-hidraulico", monto: 17365.6 },
  { vehicleId: "leyenda-cava-seca", monto: 13890.0 },
  { vehicleId: "leyenda-cava-refrigerada", monto: 16101.1 },
  { vehicleId: "leyenda-brazo-hidraulico", monto: 21979.9 },
  { vehicleId: "doble-cabina-brazo-elevador-20m", monto: 10401.7 },
  { vehicleId: "volkan-mezclador-9m3", monto: 17756.0 },
];

const buildCompraDirectaSchedule = (monto: number): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: monto, label: "Pago a la firma del contrato" },
  { type: "ORDINARY", count: 5, amount: monto, label: "5 cuotas mensuales y consecutivas" },
  { type: "PRE_DELIVERY", count: 1, amount: monto, label: "Pago previo a la entrega" },
];

const buildFiaoSchedule = (q: { firma: number; preEntrega: number; cuota: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: q.firma, label: "Pago a la firma del contrato" },
  { type: "INITIAL", count: 5, amount: q.firma, label: "5 pagos para completar la inicial" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Cuota especial previa a la entrega" },
  { type: "ORDINARY", count: 12, amount: q.cuota, label: "12 cuotas ordinarias mensuales (catálogo 06 ago)" },
];

const CATALOGO_RUTA48_17_AGO = "CREDIJAC RUTA 48 17 DE AGOSTO";

/* Cronogramas CrediJAC Ruta 48 trazables al catálogo del 17 de agosto.
   Estructura oficial: pago 1 con la firma + 15 pagos de inicial del mismo
   importe + cuota especial previa a la entrega + 32 pagos fijos mensuales.
   Solo los vehículos listados aquí tienen importes: no se extrapola. */
const ruta48Quotas: {
  vehicleId: string;
  firma: number;
  preEntrega: number;
  fija: number;
}[] = [
  { vehicleId: "arena-sport-manual", firma: 499.3, preEntrega: 2887.9, fija: 655.5 },
  { vehicleId: "arena-sport-automatico", firma: 540.4, preEntrega: 3082.0, fija: 709.5 },
  { vehicleId: "arena-pro", firma: 593.1, preEntrega: 3330.5, fija: 778.7 },
  { vehicleId: "nevado-manual", firma: 654.9, preEntrega: 3622.1, fija: 859.9 },
  { vehicleId: "tepuy-pro", firma: 901.9, preEntrega: 4787.3, fija: 1184.2 },
  { vehicleId: "savanna", firma: 967.4, preEntrega: 5096.2, fija: 1270.2 },
  { vehicleId: "rf8", firma: 1512.2, preEntrega: 7665.6, fija: 1985.4 },
  { vehicleId: "gx7", firma: 864.8, preEntrega: 4612.3, fija: 1135.5 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", firma: 647.3, preEntrega: 3633.2, fija: 849.9 },
  { vehicleId: "la-venezolana-a-diesel-4x2", firma: 667.9, preEntrega: 3730.2, fija: 876.9 },
  { vehicleId: "la-venezolana-a-diesel-4x4", firma: 748.3, preEntrega: 4109.5, fija: 982.4 },
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", firma: 660.9, preEntrega: 3697.6, fija: 867.8 },
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", firma: 844.8, preEntrega: 4564.8, fija: 1109.2 },
  { vehicleId: "la-venezolana-pro-4x4", firma: 886.2, preEntrega: 4760.3, fija: 1163.6 },
  { vehicleId: "limited", firma: 1100.6, preEntrega: 5771.5, fija: 1445.1 },
];

const buildRuta48Schedule = (q: { firma: number; preEntrega: number; fija: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: q.firma, label: "Pago 1 con la firma del contrato" },
  { type: "INITIAL", count: 15, amount: q.firma, label: "15 pagos adicionales de inicial" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Cuota especial previa a la entrega" },
  { type: "FIXED", count: 32, amount: q.fija, label: "32 pagos fijos mensuales" },
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
  ...ruta48Quotas.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "credijac-ruta-48",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_17_AUG" as SourceStatus,
    amountsSource: CATALOGO_RUTA48_17_AGO,
    schedule: buildRuta48Schedule(q),
  })),
  ...compraDirectaSep.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "compra-directa",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_04_SEP" as SourceStatus,
    amountsSource: CATALOGO_CD_04_SEP,
    schedule: buildCompraDirectaSchedule(q.monto),
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
        plan.sourceStatus !== "REVIEW_NOT_VERIFIED" ||
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
