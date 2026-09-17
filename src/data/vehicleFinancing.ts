/* ══════════════════════════════════════════════════════════════
   FUENTE ÚNICA DE VERDAD — FINANCIAMIENTO POR VEHÍCULO
   ══════════════════════════════════════════════════════════════
   Un importe solo aparece aquí si puede trazarse a un catálogo.
   Si no hay documento vigente, el monto es `null` y la UI muestra
   "Consultar disponibilidad y condiciones". Nunca se estima.
   ══════════════════════════════════════════════════════════════ */

import {
  financingPlans,
  
  type FinancingPlan,
  type PaymentStage,
  type SourceStatus,
} from "./financingPlans";
import { findVehicle } from "./vehicles";
import { getActiveCatalogs, scheduleOfEntry } from "./catalogStore";

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

const CATALOGO_PF_16_SEP = "PAGO FÁCIL — 16 DE SEPTIEMBRE";

const CATALOGO_CD_16_SEP = "COMPRA DIRECTA — 16 DE SEPTIEMBRE";

const PROMO_DE_UNA = "PROMOCIÓN LLÉVATELO DE UNA — 08 DE SEPTIEMBRE";

/* ── LLÉVATELO DE UNA — promoción del 08 de septiembre ──
   Estructura: 1ra cuota (te llevas el vehículo) + 3 cuotas mensuales del
   resto de la inicial + saldo en cuotas mensuales. Importes de la promoción. */
const deUnaQuotas: { vehicleId: string; primera: number; inicial: number; mensual: number }[] = [
  { vehicleId: "arena-sport-manual", primera: 2999, inicial: 2999, mensual: 799 },
  { vehicleId: "arena-sport-automatico", primera: 3299, inicial: 3299, mensual: 886 },
  { vehicleId: "arena-pro", primera: 3599, inicial: 3599, mensual: 966 },
  { vehicleId: "tepuy-pro", primera: 5669, inicial: 5669, mensual: 1552 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", primera: 4199, inicial: 4199, mensual: 1124 },
  { vehicleId: "la-venezolana-pro-4x4", primera: 5324, inicial: 5324, mensual: 1432 },
];

const buildDeUnaSchedule = (q: {
  primera: number;
  inicial: number;
  mensual: number;
}): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: q.primera, label: "Primera cuota: te llevas el vehículo" },
  { type: "INITIAL", count: 2, amount: q.inicial, label: "2 cuotas adicionales del mismo monto para completar la inicial" },
  { type: "FIXED", count: 27, amount: q.mensual, label: "27 cuotas mensuales del saldo restante" },
];

/* ── PAGO FÁCIL — catálogo del 16 de septiembre ──
   Estructura: US$ 999,90 a la firma + 12 cuotas consecutivas y mensuales +
   1 pago previo a la entrega. 65 configuraciones, importes exactos del PDF. */
const pagoFacilSep: { vehicleId: string; cuota: number; preEntrega: number }[] = [
  { vehicleId: "arena-sport-manual", cuota: 1314.4, preEntrega: 3076.6 },
  { vehicleId: "arena-sport-automatico", cuota: 1423.6, preEntrega: 3286.2 },
  { vehicleId: "arena-pro", cuota: 1563.4, preEntrega: 3554.8 },
  { vehicleId: "nevado-manual", cuota: 1751.7, preEntrega: 3916.2 },
  { vehicleId: "tepuy-pro", cuota: 2407.4, preEntrega: 5175.2 },
  { vehicleId: "savanna", cuota: 2558.8, preEntrega: 5465.9 },
  { vehicleId: "rf8", cuota: 4075.5, preEntrega: 8377.9 },
  { vehicleId: "gx7", cuota: 2308.9, preEntrega: 4986.1 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", cuota: 1731.4, preEntrega: 3924.3 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", cuota: 1919.9, preEntrega: 4286.3 },
  { vehicleId: "la-venezolana-a-diesel-4x2", cuota: 1786.0, preEntrega: 4029.2 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", cuota: 1974.5, preEntrega: 4391.1 },
  { vehicleId: "la-venezolana-a-diesel-4x4", cuota: 1999.5, preEntrega: 4439.0 },
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", cuota: 1767.7, preEntrega: 3993.9 },
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", cuota: 2190.7, preEntrega: 4806.1 },
  { vehicleId: "la-venezolana-pro-4x4", cuota: 2365.7, preEntrega: 5142.2 },
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", cuota: 2582.4, preEntrega: 5558.3 },
  { vehicleId: "limited", cuota: 2934.8, preEntrega: 6234.8 },
  { vehicleId: "aventura-a-gasolina", cuota: 2886.7, preEntrega: 6142.5 },
  { vehicleId: "aventura-pro-a-gasolina", cuota: 3574.3, preEntrega: 7462.6 },
  { vehicleId: "x100-ferretero", cuota: 1269.0, preEntrega: 3036.5 },
  { vehicleId: "urban-chasis-largo-3-ton", cuota: 1788.1, preEntrega: 4033.1 },
  { vehicleId: "urban-3-ton", cuota: 1895.0, preEntrega: 4238.4 },
  { vehicleId: "pionero-ferretero-4x4", cuota: 3297.9, preEntrega: 6932.0 },
  { vehicleId: "c-3500-ferretero-4x4", cuota: 2559.2, preEntrega: 5513.7 },
  { vehicleId: "doble-cabina-ferretero", cuota: 2119.9, preEntrega: 4670.3 },
  { vehicleId: "6t-chasis", cuota: 2616.1, preEntrega: 5622.9 },
  { vehicleId: "6t-ferretero", cuota: 2808.5, preEntrega: 5992.4 },
  { vehicleId: "bufalo-12-ton", cuota: 4006.8, preEntrega: 8293.1 },
  { vehicleId: "bufalo-xl", cuota: 4225.2, preEntrega: 8712.4 },
  { vehicleId: "leyenda-20-ton", cuota: 5850.3, preEntrega: 11832.7 },
  { vehicleId: "leyenda-380-hp", cuota: 6457.8, preEntrega: 12999.0 },
  { vehicleId: "minero-20m3", cuota: 7177.5, preEntrega: 14380.9 },
  { vehicleId: "minero-28m3", cuota: 9345.8, preEntrega: 18544.0 },
  { vehicleId: "minero-14m3", cuota: 5420.3, preEntrega: 11007.0 },
  { vehicleId: "cavalino", cuota: 4040.8, preEntrega: 8358.4 },
  { vehicleId: "bachaco-400-hp", cuota: 5515.6, preEntrega: 11190.0 },
  { vehicleId: "chuto-4251-430-hp", cuota: 6418.4, preEntrega: 12923.3 },
  { vehicleId: "sunray-v4-pasajeros", cuota: 2996.4, preEntrega: 6353.0 },
  { vehicleId: "sunray-v4-carga", cuota: 2791.7, preEntrega: 5960.1 },
  { vehicleId: "sunray-v6-pasajeros", cuota: 3164.5, preEntrega: 6675.8 },
  { vehicleId: "sunray-v6-carga", cuota: 3005.1, preEntrega: 6369.8 },
  { vehicleId: "sunray-v6-motorhome", cuota: 7008.7, preEntrega: 14056.6 },
  { vehicleId: "sunray-v6-van-escolar", cuota: 3599.8, preEntrega: 7511.6 },
  { vehicleId: "sunray-v4-ambulancia", cuota: 3913.7, preEntrega: 8067.4 },
  { vehicleId: "autobus-28-6-1-puestos", cuota: 5504.0, preEntrega: 11167.6 },
  { vehicleId: "compactador-5-ton", cuota: 4699.2, preEntrega: 9622.6 },
  { vehicleId: "compactador-10m3", cuota: 6632.9, preEntrega: 13335.2 },
  { vehicleId: "x100-cava-seca", cuota: 1603.7, preEntrega: 3679.0 },
  { vehicleId: "x100-cava-de-conservacion", cuota: 1753.5, preEntrega: 3966.7 },
  { vehicleId: "urban-cava-seca", cuota: 2181.1, preEntrega: 4787.7 },
  { vehicleId: "urban-cava-de-conservacion", cuota: 2365.6, preEntrega: 5142.0 },
  { vehicleId: "urban-cava-refrigerada", cuota: 3046.3, preEntrega: 6448.8 },
  { vehicleId: "6t-cava-seca", cuota: 3174.0, preEntrega: 6694.0 },
  { vehicleId: "6t-cava-de-conservacion", cuota: 3549.7, preEntrega: 7415.4 },
  { vehicleId: "6t-cava-refrigerada", cuota: 4516.3, preEntrega: 9271.4 },
  { vehicleId: "6t-brazo-hidraulico", cuota: 5231.5, preEntrega: 10644.5 },
  { vehicleId: "bufalo-cava-seca", cuota: 4901.3, preEntrega: 10010.6 },
  { vehicleId: "bufalo-cava-de-conservacion", cuota: 5278.2, preEntrega: 10734.1 },
  { vehicleId: "bufalo-cava-refrigerada", cuota: 6495.7, preEntrega: 13071.8 },
  { vehicleId: "bufalo-brazo-hidraulico", cuota: 8945.2, preEntrega: 17774.8 },
  { vehicleId: "leyenda-cava-seca", cuota: 7090.8, preEntrega: 14214.3 },
  { vehicleId: "leyenda-cava-refrigerada", cuota: 8258.7, preEntrega: 16456.8 },
  { vehicleId: "leyenda-brazo-hidraulico", cuota: 11349.8, preEntrega: 22391.6 },
  { vehicleId: "doble-cabina-brazo-elevador-20m", cuota: 5294.1, preEntrega: 10764.6 },
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

/** Cronograma de Pago Fácil con los importes del catálogo del 16 de septiembre. */
const buildPagoFacilSchedule = (q: { cuota: number; preEntrega: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: PAGO_FACIL_SIGNATURE, label: "Pago a la firma del contrato" },
  { type: "ORDINARY", count: 12, amount: q.cuota, label: "12 cuotas consecutivas y mensuales" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Pago previo a la entrega" },
];

/* ── COMPRA DIRECTA — catálogo del 16 de septiembre ──
   Estructura: 1 pago a la firma + 5 cuotas mensuales y consecutivas +
   1 pago previo a la entrega. En este catálogo las tres etapas tienen el
   mismo importe, tal como aparece impreso en cada página. 65 configuraciones. */
const compraDirectaSep: { vehicleId: string; monto: number }[] = [
  { vehicleId: "arena-sport-manual", monto: 2705.7 },
  { vehicleId: "arena-sport-automatico", monto: 2912.7 },
  { vehicleId: "arena-pro", monto: 3177.8 },
  { vehicleId: "nevado-manual", monto: 3557.3 },
  { vehicleId: "tepuy-pro", monto: 4777.6 },
  { vehicleId: "savanna", monto: 5064.7 },
  { vehicleId: "rf8", monto: 7939.7 },
  { vehicleId: "gx7", monto: 4591.0 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", monto: 3503.0 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", monto: 3860.3 },
  { vehicleId: "la-venezolana-a-diesel-4x2", monto: 3606.5 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", monto: 3963.8 },
  { vehicleId: "la-venezolana-a-diesel-4x4", monto: 4011.1 },
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", monto: 3571.7 },
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", monto: 4373.6 },
  { vehicleId: "la-venezolana-pro-4x4", monto: 4705.4 },
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", monto: 5116.2 },
  { vehicleId: "limited", monto: 5784.2 },
  { vehicleId: "aventura-a-gasolina", monto: 5693.1 },
  { vehicleId: "aventura-pro-a-gasolina", monto: 6996.3 },
  { vehicleId: "x100-ferretero", monto: 2626.4 },
  { vehicleId: "urban-chasis-largo-3-ton", monto: 3610.4 },
  { vehicleId: "urban-3-ton", monto: 3813.1 },
  { vehicleId: "c-3500-ferretero-4x4", monto: 5072.2 },
  { vehicleId: "doble-cabina-ferretero", monto: 4239.5 },
  { vehicleId: "pionero-ferretero-4x4", monto: 6472.5 },
  { vehicleId: "6t-chasis", monto: 5180.0 },
  { vehicleId: "6t-ferretero", monto: 5544.8 },
  { vehicleId: "bufalo-12-ton", monto: 7816.3 },
  { vehicleId: "bufalo-xl", monto: 8230.3 },
  { vehicleId: "leyenda-20-ton", monto: 11311.0 },
  { vehicleId: "leyenda-380-hp", monto: 12462.5 },
  { vehicleId: "minero-20m3", monto: 13826.9 },
  { vehicleId: "minero-28m3", monto: 17937.2 },
  { vehicleId: "minero-14m3", monto: 10495.8 },
  { vehicleId: "cavalino", monto: 7880.8 },
  { vehicleId: "bachaco-400-hp", monto: 10676.5 },
  { vehicleId: "chuto-4251-430-hp", monto: 12387.8 },
  { vehicleId: "sunray-v4-pasajeros", monto: 5900.8 },
  { vehicleId: "sunray-v4-carga", monto: 5512.9 },
  { vehicleId: "sunray-v6-pasajeros", monto: 6219.5 },
  { vehicleId: "sunray-v6-carga", monto: 5917.4 },
  { vehicleId: "sunray-v6-motorhome", monto: 13506.8 },
  { vehicleId: "sunray-v6-van-escolar", monto: 7044.8 },
  { vehicleId: "sunray-v4-ambulancia", monto: 7633.2 },
  { vehicleId: "autobus-28-6-1-puestos", monto: 10654.4 },
  { vehicleId: "compactador-5-ton", monto: 9128.9 },
  { vehicleId: "compactador-10m3", monto: 12794.5 },
  { vehicleId: "x100-cava-seca", monto: 3260.8 },
  { vehicleId: "x100-cava-de-conservacion", monto: 3544.8 },
  { vehicleId: "urban-cava-seca", monto: 4355.4 },
  { vehicleId: "urban-cava-de-conservacion", monto: 4705.2 },
  { vehicleId: "urban-cava-refrigerada", monto: 5995.5 },
  { vehicleId: "6t-cava-seca", monto: 6237.5 },
  { vehicleId: "6t-cava-de-conservacion", monto: 6949.8 },
  { vehicleId: "6t-cava-refrigerada", monto: 8782.2 },
  { vehicleId: "6t-brazo-hidraulico", monto: 10137.9 },
  { vehicleId: "bufalo-cava-seca", monto: 9512.0 },
  { vehicleId: "bufalo-cava-de-conservacion", monto: 10226.3 },
  { vehicleId: "bufalo-cava-refrigerada", monto: 12534.5 },
  { vehicleId: "bufalo-brazo-hidraulico", monto: 17177.7 },
  { vehicleId: "leyenda-cava-seca", monto: 13662.4 },
  { vehicleId: "leyenda-cava-refrigerada", monto: 15876.5 },
  { vehicleId: "leyenda-brazo-hidraulico", monto: 21736.0 },
  { vehicleId: "doble-cabina-brazo-elevador-20m", monto: 10256.5 },
  { vehicleId: "volkan-mezclador-9m3", monto: 17555.2 },
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

/** Respaldo de arranque: se usa solo si la base de datos no responde. */
export const vehicleFinancing: VehicleFinancing[] = [
  ...pagoFacilSep.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "pago-facil",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_16_SEP" as SourceStatus,
    amountsSource: CATALOGO_PF_16_SEP,
    schedule: buildPagoFacilSchedule(q),
  })),
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
  ...deUnaQuotas.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "llevatelo-de-una",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_PROMO_SEP" as SourceStatus,
    amountsSource: PROMO_DE_UNA,
    schedule: buildDeUnaSchedule(q),
  })),
  ...compraDirectaSep.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "compra-directa",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_16_SEP" as SourceStatus,
    amountsSource: CATALOGO_CD_16_SEP,
    schedule: buildCompraDirectaSchedule(q.monto),
  })),
];

/**
 * Importes vigentes: la versión ACTIVA de cada plan en la base de datos.
 * Si un plan todavía no tiene versión activa, se conserva su respaldo local.
 */
export const activeFinancingRows = (): VehicleFinancing[] => {
  const catalogs = getActiveCatalogs();
  if (!catalogs) return vehicleFinancing;

  const fromDb: VehicleFinancing[] = [];
  for (const [planId, catalog] of Object.entries(catalogs)) {
    for (const entry of catalog.entries) {
      if (!entry.vehicle_id) continue;
      const schedule = scheduleOfEntry(entry);
      if (!schedule.length) continue;
      fromDb.push({
        vehicleId: entry.vehicle_id,
        planId,
        currency: "USD",
        amountsSourceStatus: "VERIFIED_16_SEP" as SourceStatus,
        amountsSource: catalog.version.source,
        schedule,
      });
    }
  }

  const planesEnBase = new Set(Object.keys(catalogs));
  const respaldo = vehicleFinancing.filter((f) => !planesEnBase.has(f.planId));
  return [...fromDb, ...respaldo];
};

/** Vigencia y fuente publicadas del plan, según su versión activa. */
export const planWithActiveCatalog = (plan: FinancingPlan): FinancingPlan => {
  const catalog = getActiveCatalogs()?.[plan.id];
  if (!catalog) return plan;
  return { ...plan, effectiveDate: catalog.version.catalog_date, source: catalog.version.source };
};

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
 * Devuelve los planes vigentes y, si existen datos
 * previos, los planes en revisión — siempre identificados como tales.
 */
export const financingOptionsFor = (vehicleKey: string): FinancingOption[] => {
  const vehicle = findVehicle(vehicleKey);
  if (!vehicle) return [];
  const rows = activeFinancingRows().filter((f) => f.vehicleId === vehicle.id);

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
          plan: planWithActiveCatalog(plan),
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
  const row = activeFinancingRows().find(
    (f) => f.vehicleId === vehicle.id && f.planId === "pago-facil"
  );
  return row?.schedule.find((s) => s.type === "ORDINARY")?.amount ?? null;
};

/** Cuota de Compra Directa (plan en revisión) si está documentada. */
export const compraDirectaMonthly = (vehicleKey: string): number | null => {
  const vehicle = findVehicle(vehicleKey);
  if (!vehicle) return null;
  const row = activeFinancingRows().find(
    (f) => f.vehicleId === vehicle.id && f.planId === "compra-directa"
  );
  return row?.schedule.find((s) => s.type === "ORDINARY")?.amount ?? null;
};
