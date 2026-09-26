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

const CATALOGO_PF_25_SEP = "PAGO FÁCIL — 25 DE SEPTIEMBRE";

const CATALOGO_CD_25_SEP = "COMPRA DIRECTA — 25 DE SEPTIEMBRE";

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

/* ── PAGO FÁCIL — catálogo del 25 de septiembre ──
   Estructura: US$ 999,90 a la firma + 12 cuotas consecutivas y mensuales +
   1 pago previo a la entrega. 66 configuraciones, importes exactos del PDF. */
const pagoFacilSep: { vehicleId: string; cuota: number; preEntrega: number }[] = [
  { vehicleId: "arena-sport-manual", cuota: 1272.6, preEntrega: 2996.5 },
  { vehicleId: "arena-sport-automatico", cuota: 1381.8, preEntrega: 3206.1 },
  { vehicleId: "arena-pro", cuota: 1521.7, preEntrega: 3474.7 },
  { vehicleId: "nevado-manual", cuota: 1708.0, preEntrega: 3832.4 },
  { vehicleId: "tepuy-pro", cuota: 2351.8, preEntrega: 5068.4 },
  { vehicleId: "savanna", cuota: 2503.2, preEntrega: 5359.1 },
  { vehicleId: "rf8", cuota: 3992.0, preEntrega: 8217.7 },
  { vehicleId: "gx7", cuota: 2253.3, preEntrega: 4879.3 },
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", cuota: 1712.1, preEntrega: 3887.1 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", cuota: 1675.8, preEntrega: 3817.6 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", cuota: 1864.3, preEntrega: 4179.5 },
  { vehicleId: "la-venezolana-a-diesel-4x2", cuota: 1730.4, preEntrega: 3922.4 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", cuota: 1918.9, preEntrega: 4284.3 },
  { vehicleId: "la-venezolana-a-diesel-4x4", cuota: 1943.9, preEntrega: 4332.2 },
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", cuota: 2135.1, preEntrega: 4699.3 },
  { vehicleId: "la-venezolana-pro-4x4", cuota: 2310.1, preEntrega: 5035.4 },
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", cuota: 2526.8, preEntrega: 5451.5 },
  { vehicleId: "limited", cuota: 2879.2, preEntrega: 6128.0 },
  { vehicleId: "aventura-a-gasolina", cuota: 2831.1, preEntrega: 6035.8 },
  { vehicleId: "aventura-pro-a-gasolina", cuota: 3518.6, preEntrega: 7355.8 },
  { vehicleId: "x100-ferretero", cuota: 1227.3, preEntrega: 2956.4 },
  { vehicleId: "urban-chasis-largo-3-ton", cuota: 1732.4, preEntrega: 3926.3 },
  { vehicleId: "urban-3-ton", cuota: 1839.4, preEntrega: 4131.6 },
  { vehicleId: "pionero-ferretero-4x4", cuota: 3216.6, preEntrega: 6775.8 },
  { vehicleId: "c-3500-ferretero-4x4", cuota: 2495.4, preEntrega: 5391.2 },
  { vehicleId: "doble-cabina-ferretero", cuota: 2064.3, preEntrega: 4563.5 },
  { vehicleId: "6t-chasis", cuota: 2532.6, preEntrega: 5462.7 },
  { vehicleId: "6t-ferretero", cuota: 2725.1, preEntrega: 5832.2 },
  { vehicleId: "bufalo-12-ton", cuota: 3923.4, preEntrega: 8132.9 },
  { vehicleId: "bufalo-xl", cuota: 4134.8, preEntrega: 8538.9 },
  { vehicleId: "leyenda-20-ton", cuota: 5711.3, preEntrega: 11565.7 },
  { vehicleId: "leyenda-380-hp", cuota: 6318.2, preEntrega: 12730.9 },
  { vehicleId: "minero-20m3", cuota: 7086.2, preEntrega: 14205.4 },
  { vehicleId: "minero-28m3", cuota: 9232.2, preEntrega: 18325.9 },
  { vehicleId: "minero-14m3", cuota: 5328.9, preEntrega: 10831.5 },
  { vehicleId: "cavalino", cuota: 3957.4, preEntrega: 8198.2 },
  { vehicleId: "bachaco-400-hp", cuota: 5385.9, preEntrega: 10940.9 },
  { vehicleId: "chuto-4251-430-hp", cuota: 6288.6, preEntrega: 12674.1 },
  { vehicleId: "sunray-v4-pasajeros", cuota: 2912.9, preEntrega: 6192.8 },
  { vehicleId: "sunray-v4-carga", cuota: 2708.3, preEntrega: 5799.9 },
  { vehicleId: "sunray-v6-pasajeros", cuota: 3081.0, preEntrega: 6515.6 },
  { vehicleId: "sunray-v6-carga", cuota: 2921.7, preEntrega: 6209.6 },
  { vehicleId: "sunray-v6-motorhome", cuota: 7008.7, preEntrega: 14056.6 },
  { vehicleId: "sunray-v6-van-escolar", cuota: 3516.4, preEntrega: 7351.4 },
  { vehicleId: "sunray-v4-ambulancia", cuota: 3830.3, preEntrega: 7907.2 },
  { vehicleId: "autobus-28-6-1-puestos", cuota: 5440.7, preEntrega: 11046.1 },
  { vehicleId: "compactador-5-ton", cuota: 4660.1, preEntrega: 9547.4 },
  { vehicleId: "compactador-10m3", cuota: 6570.5, preEntrega: 13215.4 },
  { vehicleId: "x100-cava-seca", cuota: 1548.3, preEntrega: 3572.7 },
  { vehicleId: "x100-cava-de-conservacion", cuota: 1691.3, preEntrega: 3847.2 },
  { vehicleId: "urban-cava-seca", cuota: 2111.8, preEntrega: 4654.7 },
  { vehicleId: "urban-cava-de-conservacion", cuota: 2289.5, preEntrega: 4995.8 },
  { vehicleId: "urban-cava-refrigerada", cuota: 2963.3, preEntrega: 6289.5 },
  { vehicleId: "6t-cava-seca", cuota: 3070.0, preEntrega: 6494.4 },
  { vehicleId: "6t-cava-de-conservacion", cuota: 3438.9, preEntrega: 7202.7 },
  { vehicleId: "6t-cava-refrigerada", cuota: 4391.2, preEntrega: 9031.1 },
  { vehicleId: "6t-brazo-hidraulico", cuota: 5148.1, preEntrega: 10484.3 },
  { vehicleId: "bufalo-cava-seca", cuota: 4785.1, preEntrega: 9787.4 },
  { vehicleId: "bufalo-cava-de-conservacion", cuota: 5153.7, preEntrega: 10495.1 },
  { vehicleId: "bufalo-cava-refrigerada", cuota: 6357.6, preEntrega: 12806.6 },
  { vehicleId: "bufalo-brazo-hidraulico", cuota: 7771.0, preEntrega: 15520.3 },
  { vehicleId: "leyenda-cava-seca", cuota: 6910.7, preEntrega: 13868.5 },
  { vehicleId: "leyenda-cava-refrigerada", cuota: 8081.0, preEntrega: 16115.5 },
  { vehicleId: "leyenda-brazo-hidraulico", cuota: 10637.1, preEntrega: 21023.3 },
  { vehicleId: "doble-cabina-brazo-elevador-20m", cuota: 5217.5, preEntrega: 10617.6 },
  { vehicleId: "volkan-mezclador-9m3", cuota: 9038.4, preEntrega: 17953.8 },
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

/** Cronograma de Pago Fácil con los importes del catálogo del 25 de septiembre. */
const buildPagoFacilSchedule = (q: { cuota: number; preEntrega: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: PAGO_FACIL_SIGNATURE, label: "Pago a la firma del contrato" },
  { type: "ORDINARY", count: 12, amount: q.cuota, label: "12 cuotas consecutivas y mensuales" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Pago previo a la entrega" },
];

/* ── COMPRA DIRECTA — catálogo del 25 de septiembre ──
   Estructura: US$ 999,90 a la firma + 5 cuotas mensuales y consecutivas +
   1 pago previo a la entrega. Cuota y pago previo copiados tal cual del PDF
   (en algunos modelos difieren en US$ 0,10). 66 configuraciones. */
const compraDirectaSep: { vehicleId: string; cuota: number; preEntrega: number }[] = [
  { vehicleId: "arena-sport-manual", cuota: 2897.7, preEntrega: 2897.7 },
  { vehicleId: "arena-sport-automatico", cuota: 3139.2, preEntrega: 3139.2 },
  { vehicleId: "arena-pro", cuota: 3448.5, preEntrega: 3448.5 },
  { vehicleId: "nevado-manual", cuota: 3860.5, preEntrega: 3860.5 },
  { vehicleId: "tepuy-pro", cuota: 5284.2, preEntrega: 5284.3 },
  { vehicleId: "savanna", cuota: 5619.2, preEntrega: 5619.2 },
  { vehicleId: "rf8", cuota: 8911.9, preEntrega: 8911.9 },
  { vehicleId: "gx7", cuota: 5066.5, preEntrega: 5066.5 },
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", cuota: 3877.3, preEntrega: 3877.3 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", cuota: 3797.2, preEntrega: 3797.2 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", cuota: 4214.1, preEntrega: 4214.1 },
  { vehicleId: "la-venezolana-a-diesel-4x2", cuota: 3917.9, preEntrega: 3917.9 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", cuota: 4334.8, preEntrega: 4334.8 },
  { vehicleId: "la-venezolana-a-diesel-4x4", cuota: 4390.0, preEntrega: 4390.0 },
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", cuota: 4812.9, preEntrega: 4812.9 },
  { vehicleId: "la-venezolana-pro-4x4", cuota: 5200.0, preEntrega: 5200.0 },
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", cuota: 5679.3, preEntrega: 5679.3 },
  { vehicleId: "limited", cuota: 6458.5, preEntrega: 6458.5 },
  { vehicleId: "aventura-a-gasolina", cuota: 6352.2, preEntrega: 6352.3 },
  { vehicleId: "aventura-pro-a-gasolina", cuota: 7872.7, preEntrega: 7872.8 },
  { vehicleId: "x100-ferretero", cuota: 2805.2, preEntrega: 2805.2 },
  { vehicleId: "urban-chasis-largo-3-ton", cuota: 3922.4, preEntrega: 3922.4 },
  { vehicleId: "urban-3-ton", cuota: 4158.9, preEntrega: 4158.9 },
  { vehicleId: "pionero-ferretero-4x4", cuota: 7204.7, preEntrega: 7204.7 },
  { vehicleId: "c-3500-ferretero-4x4", cuota: 5609.8, preEntrega: 5609.8 },
  { vehicleId: "doble-cabina-ferretero", cuota: 4656.4, preEntrega: 4656.4 },
  { vehicleId: "6t-chasis", cuota: 5692.1, preEntrega: 5692.1 },
  { vehicleId: "6t-ferretero", cuota: 6117.8, preEntrega: 6117.8 },
  { vehicleId: "bufalo-12-ton", cuota: 8767.9, preEntrega: 8767.9 },
  { vehicleId: "bufalo-xl", cuota: 9235.5, preEntrega: 9235.5 },
  { vehicleId: "leyenda-20-ton", cuota: 12722.0, preEntrega: 12722.0 },
  { vehicleId: "leyenda-380-hp", cuota: 14064.2, preEntrega: 14064.2 },
  { vehicleId: "minero-20m3", cuota: 15762.6, preEntrega: 15762.6 },
  { vehicleId: "minero-28m3", cuota: 20508.8, preEntrega: 20508.9 },
  { vehicleId: "minero-14m3", cuota: 11876.3, preEntrega: 11876.3 },
  { vehicleId: "cavalino", cuota: 8843.1, preEntrega: 8843.1 },
  { vehicleId: "bachaco-400-hp", cuota: 12002.3, preEntrega: 12002.3 },
  { vehicleId: "chuto-4251-430-hp", cuota: 13998.8, preEntrega: 13998.8 },
  { vehicleId: "sunray-v4-pasajeros", cuota: 6533.2, preEntrega: 6533.2 },
  { vehicleId: "sunray-v4-carga", cuota: 6080.6, preEntrega: 6080.6 },
  { vehicleId: "sunray-v6-pasajeros", cuota: 6904.9, preEntrega: 6904.9 },
  { vehicleId: "sunray-v6-carga", cuota: 6552.5, preEntrega: 6552.5 },
  { vehicleId: "sunray-v6-motorhome", cuota: 15591.2, preEntrega: 15591.2 },
  { vehicleId: "sunray-v6-van-escolar", cuota: 7867.7, preEntrega: 7867.7 },
  { vehicleId: "sunray-v4-ambulancia", cuota: 8554.2, preEntrega: 8554.2 },
  { vehicleId: "autobus-28-6-1-puestos", cuota: 12123.5, preEntrega: 12123.5 },
  { vehicleId: "compactador-5-ton", cuota: 10397.2, preEntrega: 10397.2 },
  { vehicleId: "compactador-10m3", cuota: 14622.2, preEntrega: 14622.2 },
  { vehicleId: "x100-cava-seca", cuota: 3515.1, preEntrega: 3515.1 },
  { vehicleId: "x100-cava-de-conservacion", cuota: 3831.4, preEntrega: 3831.4 },
  { vehicleId: "urban-cava-seca", cuota: 4761.4, preEntrega: 4761.4 },
  { vehicleId: "urban-cava-de-conservacion", cuota: 5154.4, preEntrega: 5154.4 },
  { vehicleId: "urban-cava-refrigerada", cuota: 6644.6, preEntrega: 6644.6 },
  { vehicleId: "6t-cava-seca", cuota: 6880.6, preEntrega: 6880.6 },
  { vehicleId: "6t-cava-de-conservacion", cuota: 7696.4, preEntrega: 7696.5 },
  { vehicleId: "6t-cava-refrigerada", cuota: 9802.5, preEntrega: 9802.5 },
  { vehicleId: "6t-brazo-hidraulico", cuota: 11476.4, preEntrega: 11476.4 },
  { vehicleId: "bufalo-cava-seca", cuota: 10673.6, preEntrega: 10673.6 },
  { vehicleId: "bufalo-cava-de-conservacion", cuota: 11488.8, preEntrega: 11488.8 },
  { vehicleId: "bufalo-cava-refrigerada", cuota: 14151.4, preEntrega: 14151.4 },
  { vehicleId: "bufalo-brazo-hidraulico", cuota: 17277.2, preEntrega: 17277.2 },
  { vehicleId: "leyenda-cava-seca", cuota: 15374.6, preEntrega: 15374.6 },
  { vehicleId: "leyenda-cava-refrigerada", cuota: 17962.7, preEntrega: 17962.7 },
  { vehicleId: "leyenda-brazo-hidraulico", cuota: 23615.9, preEntrega: 23615.9 },
  { vehicleId: "doble-cabina-brazo-elevador-20m", cuota: 11629.9, preEntrega: 11629.9 },
  { vehicleId: "volkan-mezclador-9m3", cuota: 20080.2, preEntrega: 20080.2 },
];

const buildCompraDirectaSchedule = (q: { cuota: number; preEntrega: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: PAGO_FACIL_SIGNATURE, label: "Pago a la firma del contrato" },
  { type: "ORDINARY", count: 5, amount: q.cuota, label: "5 cuotas mensuales y consecutivas" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Pago previo a la entrega" },
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
    amountsSourceStatus: "VERIFIED_25_SEP" as SourceStatus,
    amountsSource: CATALOGO_PF_25_SEP,
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
    amountsSourceStatus: "VERIFIED_25_SEP" as SourceStatus,
    amountsSource: CATALOGO_CD_25_SEP,
    schedule: buildCompraDirectaSchedule(q),
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
        amountsSourceStatus: "VERIFIED_25_SEP" as SourceStatus,
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

/** Resumen del cronograma vigente (firma + cuotas + previo) de un plan para un modelo. */
export const planScheduleSummary = (vehicleKey: string, planId: string): string | null => {
  const vehicle = findVehicle(vehicleKey);
  if (!vehicle) return null;
  const row = activeFinancingRows().find((f) => f.vehicleId === vehicle.id && f.planId === planId);
  if (!row) return null;
  const firma = row.schedule.find((s) => s.type === "SIGNATURE");
  const cuotas = row.schedule.find((s) => s.type === "ORDINARY");
  const previo = row.schedule.find((s) => s.type === "PRE_DELIVERY");
  if (firma?.amount == null || cuotas?.amount == null || previo?.amount == null) return null;
  return `${fmtUsd(firma.amount)} a la firma + ${cuotas.count} cuotas de ${fmtUsd(cuotas.amount)} + ${fmtUsd(previo.amount)} previo a la entrega`;
};
