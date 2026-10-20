/* ══════════════════════════════════════════════════════════════
   FUENTE ÚNICA DE VERDAD — FINANCIAMIENTO POR VEHÍCULO
   ══════════════════════════════════════════════════════════════
   Un importe solo aparece aquí si puede trazarse a un catálogo.
   Si no hay documento vigente, el monto es `null` y la UI muestra
   "Consultar disponibilidad y condiciones". Nunca se estima.
   ══════════════════════════════════════════════════════════════ */

import {
  financingPlans,
  fmtUsd,
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

const CATALOGO_FIAO_12_OCT = "LLÉVATELO FIAO — 12 DE OCTUBRE";

/* Cronogramas Llévatelo Fiao trazables al catálogo del 28 de septiembre.
   Estructura: pago a la firma + 5 pagos de igual monto (inicial)
   + pre-entrega + 15 cuotas ordinarias. */
const fiaoQuotas: {
  vehicleId: string;
  firma: number;
  preEntrega: number;
  cuota: number;
}[] = [
  { vehicleId: "arena-sport-manual", firma: 994.0, preEntrega: 3621.0, cuota: 927.7 }, // pág. 2
  { vehicleId: "arena-sport-automatico", firma: 1097.8, preEntrega: 3943.7, cuota: 1024.6 }, // pág. 4
  { vehicleId: "arena-pro", firma: 1227.6, preEntrega: 4347.1, cuota: 1145.8 }, // pág. 6
  { vehicleId: "nevado-manual", firma: 1318.5, preEntrega: 4629.4, cuota: 1230.6 }, // pág. 8
  { vehicleId: "tepuy-pro", firma: 1924.0, preEntrega: 6510.5, cuota: 1795.7 }, // pág. 10
  { vehicleId: "savanna", firma: 1924.0, preEntrega: 6510.5, cuota: 1795.7 }, // pág. 12
  { vehicleId: "rf8", firma: 3008.1, preEntrega: 9878.5, cuota: 2807.5 }, // pág. 14
  { vehicleId: "gx7", firma: 1692.5, preEntrega: 5791.2, cuota: 1579.6 }, // pág. 16
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", firma: 1273.2, preEntrega: 4535.6, cuota: 1188.3 }, // pág. 18
  { vehicleId: "la-venezolana-a-gasolina-4x2", firma: 1402.6, preEntrega: 4937.7, cuota: 1309.1 }, // pág. 20
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", firma: 1503.9, preEntrega: 5252.2, cuota: 1403.6 }, // pág. 22
  { vehicleId: "la-venezolana-a-diesel-4x2", firma: 1445.9, preEntrega: 5072.1, cuota: 1349.5 }, // pág. 24
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", firma: 1546.0, preEntrega: 5383.2, cuota: 1442.9 }, // pág. 26
  { vehicleId: "la-venezolana-a-diesel-4x4", firma: 1619.0, preEntrega: 5609.9, cuota: 1511.0 }, // pág. 28
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", firma: 1737.9, preEntrega: 5979.2, cuota: 1622.0 }, // pág. 30
  { vehicleId: "la-venezolana-pro-4x4", firma: 1835.4, preEntrega: 6282.2, cuota: 1713.0 }, // pág. 32
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", firma: 2015.4, preEntrega: 6841.5, cuota: 1881.0 }, // pág. 34
  { vehicleId: "limited", firma: 2188.1, preEntrega: 7378.1, cuota: 2042.2 }, // pág. 36
  { vehicleId: "aventura-a-gasolina", firma: 2181.6, preEntrega: 7357.9, cuota: 2036.1 }, // pág. 38
  { vehicleId: "aventura-pro-a-gasolina", firma: 2614.4, preEntrega: 8702.4, cuota: 2440.1 }, // pág. 40
  { vehicleId: "x100-ferretero", firma: 1186.7, preEntrega: 4266.7, cuota: 1107.5 }, // pág. 42
  { vehicleId: "urban-chasis-largo-3-ton", firma: 1446.3, preEntrega: 5073.4, cuota: 1349.9 }, // pág. 44
  { vehicleId: "urban-3-ton", firma: 1576.2, preEntrega: 5476.8, cuota: 1471.1 }, // pág. 46
  { vehicleId: "pionero-ferretero-4x4", firma: 2525.1, preEntrega: 8425.1, cuota: 2356.8 }, // pág. 52
  { vehicleId: "c-3500-ferretero-4x4", firma: 2044.2, preEntrega: 6930.8, cuota: 1907.9 }, // pág. 54
  { vehicleId: "doble-cabina-ferretero", firma: 1749.3, preEntrega: 6014.6, cuota: 1632.6 }, // pág. 56
  { vehicleId: "6t-chasis", firma: 2134.4, preEntrega: 7211.3, cuota: 1992.1 }, // pág. 58
  { vehicleId: "6t-ferretero", firma: 2268.6, preEntrega: 7628.1, cuota: 2117.3 }, // pág. 60
  { vehicleId: "bufalo-12-ton", firma: 3134.1, preEntrega: 10317.1, cuota: 2925.2 }, // pág. 62
  { vehicleId: "bufalo-xl", firma: 3350.5, preEntrega: 10989.4, cuota: 3127.1 }, // pág. 64
  { vehicleId: "leyenda-20-ton", firma: 4519.0, preEntrega: 14619.7, cuota: 4217.7 }, // pág. 66
  { vehicleId: "leyenda-380-hp", firma: 5347.3, preEntrega: 17193.1, cuota: 4990.8 }, // pág. 68
  { vehicleId: "minero-20m3", firma: 6039.4, preEntrega: 19343.1, cuota: 5636.7 }, // pág. 70
  { vehicleId: "minero-14m3", firma: 4222.2, preEntrega: 13697.4, cuota: 3940.6 }, // pág. 72
  { vehicleId: "cavalino", firma: 3220.7, preEntrega: 10586.1, cuota: 3005.9 }, // pág. 74
  { vehicleId: "bachaco-400-hp", firma: 4086.2, preEntrega: 13275.1, cuota: 3813.8 }, // pág. 76
  { vehicleId: "chuto-4251-430-hp", firma: 4644.5, preEntrega: 15009.6, cuota: 4334.8 }, // pág. 78
  { vehicleId: "sunray-v4-pasajeros", firma: 2224.9, preEntrega: 7492.3, cuota: 2076.5 }, // pág. 80
  { vehicleId: "sunray-v4-carga", firma: 2134.4, preEntrega: 7211.3, cuota: 1992.1 }, // pág. 82
  { vehicleId: "sunray-v6-pasajeros", firma: 2744.2, preEntrega: 9105.7, cuota: 2561.2 }, // pág. 84
  { vehicleId: "sunray-v6-carga", firma: 2441.7, preEntrega: 8165.9, cuota: 2278.9 }, // pág. 86
  { vehicleId: "sunray-v6-motorhome", firma: 4953.6, preEntrega: 15922.9, cuota: 4623.3 }, // pág. 88
  { vehicleId: "sunray-v6-van-escolar", firma: 2707.4, preEntrega: 8991.4, cuota: 2526.9 }, // pág. 90
  { vehicleId: "sunray-v4-ambulancia", firma: 3135.7, preEntrega: 10275.1, cuota: 2926.7 }, // pág. 92
  { vehicleId: "autobus-28-6-1-puestos", firma: 4265.4, preEntrega: 13831.8, cuota: 3981.0 }, // pág. 94
  { vehicleId: "compactador-5-ton", firma: 3789.4, preEntrega: 12352.9, cuota: 3536.7 }, // pág. 96
  { vehicleId: "compactador-10m3", firma: 5188.5, preEntrega: 16699.8, cuota: 4842.6 }, // pág. 98
  { vehicleId: "x100-cava-de-conservacion", firma: 1279.3, preEntrega: 4554.5, cuota: 1194.0 }, // pág. 100
  { vehicleId: "urban-cava-seca", firma: 1704.8, preEntrega: 4914.6, cuota: 1657.1 }, // pág. 102
  { vehicleId: "urban-cava-refrigerada", firma: 2528.3, preEntrega: 8434.8, cuota: 2359.7 }, // pág. 104
  { vehicleId: "6t-cava-seca", firma: 2567.2, preEntrega: 8555.8, cuota: 2396.0 }, // pág. 106
  { vehicleId: "6t-cava-refrigerada", firma: 3631.8, preEntrega: 11863.4, cuota: 3389.7 }, // pág. 108
  { vehicleId: "6t-brazo-hidraulico", firma: 4135.6, preEntrega: 13428.5, cuota: 3859.8 }, // pág. 110
  { vehicleId: "bufalo-brazo-hidraulico", firma: 6358.3, preEntrega: 20334.0, cuota: 5934.4 }, // pág. 112
  { vehicleId: "leyenda-cava-seca", firma: 5433.9, preEntrega: 17462.1, cuota: 5071.6 }, // pág. 114
  { vehicleId: "leyenda-brazo-hidraulico", firma: 8694.0, preEntrega: 27590.6, cuota: 8114.3 }, // pág. 116
  { vehicleId: "doble-cabina-brazo-elevador-20m", firma: 4104.7, preEntrega: 13332.5, cuota: 3831.0 }, // pág. 118
  { vehicleId: "volkan-mezclador-9m3", firma: 6732.2, preEntrega: 21495.7, cuota: 6283.3 }, // pág. 120
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
  { type: "ORDINARY", count: 15, amount: q.cuota, label: "15 cuotas ordinarias mensuales" },
];

const CATALOGO_RUTA48_28_SEP = "CREDIJAC RUTA 48 28 DE SEPTIEMBRE";

/* Cronogramas CrediJAC Ruta 48 trazables al catálogo del 28 de septiembre.
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
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", firma: 831.7, preEntrega: 4454.4, fija: 1093.5 },
  { vehicleId: "la-venezolana-pro-4x4", firma: 886.2, preEntrega: 4760.3, fija: 1163.6 },
  { vehicleId: "limited", firma: 1100.6, preEntrega: 5771.5, fija: 1445.1 },
  { vehicleId: "aventura-a-gasolina", firma: 1082.5, preEntrega: 5686.1, fija: 1421.3 },
  { vehicleId: "aventura-pro-a-gasolina", firma: 1341.5, preEntrega: 6907.8, fija: 1761.4 },
  { vehicleId: "x100-ferretero", firma: 482.2, preEntrega: 2855.3, fija: 633.0 },
  { vehicleId: "urban-chasis-largo-3-ton", firma: 668.6, preEntrega: 3733.8, fija: 877.9 },
  { vehicleId: "urban-3-ton", firma: 708.9, preEntrega: 3923.8, fija: 930.8 },
];

const buildRuta48Schedule = (q: { firma: number; preEntrega: number; fija: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: q.firma, label: "Pago 1 con la firma del contrato" },
  { type: "INITIAL", count: 15, amount: q.firma, label: "15 pagos adicionales de inicial" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Cuota especial previa a la entrega" },
  { type: "FIXED", count: 32, amount: q.fija, label: "32 pagos fijos mensuales" },
];

const CATALOGO_FACILITO_12_OCT = "FACILITO DE JAC — 12 DE OCTUBRE";

/* Cronogramas Facilito de JAC trazables al catálogo del 12 de octubre (137 páginas).
   Estructura: 1 pago a la firma + 6 pagos mensuales + pre-entrega + 20 cuotas fijas.
   Pionero Chasis 5 Ton y Pionero Ferretero 5 Ton (págs. 48 y 50) no tienen ficha en el sitio. */
const facilitoQuotas: {
  vehicleId: string;
  cuota: number;
  preEntrega: number;
}[] = [
  { vehicleId: "arena-sport-manual", cuota: 799.2, preEntrega: 2887.9 }, // pág. 2
  { vehicleId: "arena-sport-automatico", cuota: 899.1, preEntrega: 3082.0 }, // pág. 4
  { vehicleId: "arena-pro", cuota: 999.1, preEntrega: 3330.5 }, // pág. 6
  { vehicleId: "nevado-manual", cuota: 1099.1, preEntrega: 3622.1 }, // pág. 8
  { vehicleId: "tepuy-pro", cuota: 1499.0, preEntrega: 4787.3 }, // pág. 10
  { vehicleId: "savanna", cuota: 1599.3, preEntrega: 5096.2 }, // pág. 12
  { vehicleId: "rf8", cuota: 2799.4, preEntrega: 7665.6 }, // pág. 14
  { vehicleId: "gx7", cuota: 1599.7, preEntrega: 4612.3 }, // pág. 16
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", cuota: 1199.8, preEntrega: 3697.7 }, // pág. 18
  { vehicleId: "la-venezolana-a-gasolina-4x2", cuota: 1119.1, preEntrega: 3633.2 }, // pág. 20
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", cuota: 1248.7, preEntrega: 4040.9 }, // pág. 22
  { vehicleId: "la-venezolana-a-diesel-4x2", cuota: 1149.8, preEntrega: 3730.2 }, // pág. 24
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", cuota: 1259.1, preEntrega: 4137.9 }, // pág. 26
  { vehicleId: "la-venezolana-a-diesel-4x4", cuota: 1299.6, preEntrega: 4109.6 }, // pág. 28
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", cuota: 1473.1, preEntrega: 4454.6 }, // pág. 30
  { vehicleId: "la-venezolana-pro-4x4", cuota: 1629.6, preEntrega: 4760.3 }, // pág. 32
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", cuota: 1643.3, preEntrega: 5218.2 }, // pág. 34
  { vehicleId: "limited", cuota: 1999.5, preEntrega: 5771.5 }, // pág. 36
  { vehicleId: "aventura-a-gasolina", cuota: 1899.2, preEntrega: 5686.1 }, // pág. 38
  { vehicleId: "aventura-pro-a-gasolina", cuota: 2199.5, preEntrega: 6907.8 }, // pág. 40
  { vehicleId: "x100-ferretero", cuota: 1049.4, preEntrega: 2854.3 }, // pág. 42
  { vehicleId: "urban-chasis-largo-3-ton", cuota: 1199.1, preEntrega: 3733.8 }, // pág. 44
  { vehicleId: "urban-3-ton", cuota: 1299.1, preEntrega: 3923.8 }, // pág. 46
  { vehicleId: "pionero-ferretero-4x4", cuota: 2078.2, preEntrega: 6459.2 }, // pág. 52
  { vehicleId: "c-3500-ferretero-4x4", cuota: 1817.6, preEntrega: 5273.2 }, // pág. 54
  { vehicleId: "doble-cabina-ferretero", cuota: 1499.4, preEntrega: 4323.5 }, // pág. 56
  { vehicleId: "6t-chasis", cuota: 1719.8, preEntrega: 5119.3 }, // pág. 58
  { vehicleId: "6t-ferretero", cuota: 1809.8, preEntrega: 5461.3 }, // pág. 60
  { vehicleId: "bufalo-12-ton", cuota: 2779.1, preEntrega: 7591.4 }, // pág. 62
  { vehicleId: "bufalo-xl", cuota: 2999.3, preEntrega: 7957.3 }, // pág. 64
  { vehicleId: "leyenda-20-ton", cuota: 3549.1, preEntrega: 10694.9 }, // pág. 66
  { vehicleId: "leyenda-380-hp", cuota: 4299.1, preEntrega: 11772.6 }, // pág. 68
  { vehicleId: "minero-20m3", cuota: 5399.2, preEntrega: 13747.4 }, // pág. 70
  { vehicleId: "minero-28m3", cuota: 5989.1, preEntrega: 17537.2 }, // pág. 72
  { vehicleId: "minero-14m3", cuota: 3899.2, preEntrega: 10522.2 }, // pág. 74
  { vehicleId: "cavalino", cuota: 2769.4, preEntrega: 7651.1 }, // pág. 76
  { vehicleId: "bachaco-400-hp", cuota: 3529.3, preEntrega: 10128.8 }, // pág. 78
  { vehicleId: "chuto-4251-430-hp", cuota: 3859.3, preEntrega: 11732.9 }, // pág. 80
  { vehicleId: "sunray-v4-pasajeros", cuota: 2029.3, preEntrega: 5795.1 }, // pág. 82
  { vehicleId: "sunray-v4-carga", cuota: 1899.2, preEntrega: 5431.5 }, // pág. 84
  { vehicleId: "sunray-v6-pasajeros", cuota: 2279.7, preEntrega: 6093.8 }, // pág. 86
  { vehicleId: "sunray-v6-carga", cuota: 2059.0, preEntrega: 5810.6 }, // pág. 88
  { vehicleId: "sunray-v6-motorhome", cuota: 4499.3, preEntrega: 13135.3 }, // pág. 90
  { vehicleId: "sunray-v6-van-escolar", cuota: 2499.2, preEntrega: 6867.4 }, // pág. 92
  { vehicleId: "sunray-v4-ambulancia", cuota: 2699.8, preEntrega: 7378.2 }, // pág. 94
  { vehicleId: "autobus-28-6-1-puestos", cuota: 3799.7, preEntrega: 10621.0 }, // pág. 96
  { vehicleId: "compactador-5-ton", cuota: 3499.4, preEntrega: 9148.0 }, // pág. 98
  { vehicleId: "compactador-10m3", cuota: 4769.5, preEntrega: 12625.5 }, // pág. 100
  { vehicleId: "x100-cava-seca", cuota: 1119.3, preEntrega: 3406.8 }, // pág. 102
  { vehicleId: "x100-cava-de-conservacion", cuota: 1259.7, preEntrega: 3652.0 }, // pág. 104
  { vehicleId: "urban-cava-seca", cuota: 1559.0, preEntrega: 4390.0 }, // pág. 106
  { vehicleId: "urban-cava-de-conservacion", cuota: 1599.1, preEntrega: 4696.8 }, // pág. 108
  { vehicleId: "urban-cava-refrigerada", cuota: 2232.9, preEntrega: 5000.2 }, // pág. 110
  { vehicleId: "6t-cava-seca", cuota: 2009.1, preEntrega: 6047.4 }, // pág. 112
  { vehicleId: "6t-cava-de-conservacion", cuota: 2309.1, preEntrega: 6694.0 }, // pág. 114
  { vehicleId: "6t-cava-refrigerada", cuota: 3109.1, preEntrega: 8367.3 }, // pág. 116
  { vehicleId: "6t-brazo-hidraulico", cuota: 3499.1, preEntrega: 9766.8 }, // pág. 118
  { vehicleId: "bufalo-cava-seca", cuota: 3399.1, preEntrega: 9078.9 }, // pág. 120
  { vehicleId: "bufalo-cava-de-conservacion", cuota: 3499.1, preEntrega: 9723.2 }, // pág. 122
  { vehicleId: "bufalo-cava-refrigerada", cuota: 4299.0, preEntrega: 11844.6 }, // pág. 124
  { vehicleId: "bufalo-brazo-hidraulico", cuota: 5460.2, preEntrega: 15839.6 }, // pág. 126
  { vehicleId: "leyenda-cava-seca", cuota: 4697.2, preEntrega: 13872.5 }, // pág. 128
  { vehicleId: "leyenda-cava-refrigerada", cuota: 4999.1, preEntrega: 14855.0 }, // pág. 130
  { vehicleId: "leyenda-brazo-hidraulico", cuota: 7539.2, preEntrega: 21125.0 }, // pág. 132
  { vehicleId: "doble-cabina-brazo-elevador-20m", cuota: 3789.2, preEntrega: 10271.7 }, // pág. 134
  { vehicleId: "volkan-mezclador-9m3", cuota: 6049.6, preEntrega: 17165.6 }, // pág. 136
];

const buildFacilitoSchedule = (q: { cuota: number; preEntrega: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: q.cuota, label: "Pago a la firma del contrato" },
  { type: "INITIAL", count: 6, amount: q.cuota, label: "Pagos mensuales de inicial" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Cuota especial previa a la entrega" },
  { type: "FIXED", count: 20, amount: q.cuota, label: "Cuotas fijas mensuales" },
];

const CATALOGO_35X35_12_OCT = "CREDIJAC 35X35 PASAJEROS Y CAMIONES — 12 DE OCTUBRE";

/* Cronogramas CrediJAC 35x35 trazables al catálogo del 12 de octubre (126 páginas,
   24 pasajeros + 38 camiones). Estructura: 6 cuotas de inicial + pre-entrega +
   30 cuotas ordinarias + 6 cuotas especiales. Importes copiados tal cual del PDF. */
const credijac35x35Quotas: {
  vehicleId: string;
  inicial: number;
  preEntrega: number;
  ordinaria: number;
  especial: number;
}[] = [
  { vehicleId: "arena-sport-manual", inicial: 1442.3, preEntrega: 2887.9, ordinaria: 499.2, especial: 437.9 }, // pág. 2
  { vehicleId: "arena-sport-automatico", inicial: 1561.2, preEntrega: 3204.4, ordinaria: 536.1, especial: 473.9 }, // pág. 4
  { vehicleId: "arena-pro", inicial: 1713.4, preEntrega: 3330.5, ordinaria: 593.0, especial: 520.2 }, // pág. 6
  { vehicleId: "nevado-manual", inicial: 1892.0, preEntrega: 3622.1, ordinaria: 654.8, especial: 574.4 }, // pág. 8
  { vehicleId: "tepuy-pro", inicial: 2605.6, preEntrega: 4787.3, ordinaria: 901.8, especial: 791.0 }, // pág. 10
  { vehicleId: "savanna", inicial: 2794.9, preEntrega: 5096.2, ordinaria: 967.3, especial: 848.5 }, // pág. 12
  { vehicleId: "rf8", inicial: 4368.5, preEntrega: 7665.6, ordinaria: 1511.9, especial: 1326.2 }, // pág. 14
  { vehicleId: "gx7", inicial: 2498.4, preEntrega: 4612.3, ordinaria: 864.7, especial: 758.5 }, // pág. 16
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", inicial: 1909.4, preEntrega: 3697.6, ordinaria: 660.8, especial: 579.7 }, // pág. 18
  { vehicleId: "la-venezolana-a-gasolina-4x2", inicial: 1870.0, preEntrega: 3633.2, ordinaria: 647.2, especial: 567.7 }, // pág. 20
  { vehicleId: "la-venezolana-a-diesel-4x2", inicial: 1929.4, preEntrega: 3730.2, ordinaria: 667.7, especial: 585.7 }, // pág. 22
  { vehicleId: "la-venezolana-a-diesel-4x4", inicial: 2161.7, preEntrega: 4109.5, ordinaria: 748.1, especial: 656.3 }, // pág. 24
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", inicial: 2399.1, preEntrega: 4454.4, ordinaria: 831.8, especial: 728.3 }, // pág. 26
  { vehicleId: "la-venezolana-pro-4x4", inicial: 2560.3, preEntrega: 4760.3, ordinaria: 886.1, especial: 777.3 }, // pág. 28
  { vehicleId: "limited", inicial: 3179.6, preEntrega: 5771.5, ordinaria: 1100.4, especial: 965.3 }, // pág. 30
  { vehicleId: "aventura-a-gasolina", inicial: 3127.3, preEntrega: 5686.1, ordinaria: 1082.3, especial: 949.4 }, // pág. 32
  { vehicleId: "aventura-pro-a-gasolina", inicial: 3875.6, preEntrega: 6907.8, ordinaria: 1341.3, especial: 1176.6 }, // pág. 34
  { vehicleId: "sunray-v4-pasajeros", inicial: 3194.1, preEntrega: 5795.1, ordinaria: 1105.4, especial: 969.7 }, // pág. 36
  { vehicleId: "sunray-v4-carga", inicial: 2971.4, preEntrega: 5431.5, ordinaria: 1028.4, especial: 902.1 }, // pág. 38
  { vehicleId: "sunray-v6-pasajeros", inicial: 3377.0, preEntrega: 6093.8, ordinaria: 1168.7, especial: 1025.2 }, // pág. 40
  { vehicleId: "sunray-v6-carga", inicial: 3203.6, preEntrega: 5810.6, ordinaria: 1108.7, especial: 972.6 }, // pág. 42
  { vehicleId: "sunray-v6-motorhome", inicial: 7718.5, preEntrega: 13135.3, ordinaria: 2671.3, especial: 2343.2 }, // pág. 44
  { vehicleId: "sunray-v6-van-escolar", inicial: 3850.8, preEntrega: 6867.4, ordinaria: 1332.7, especial: 1169.1 }, // pág. 46
  { vehicleId: "sunray-v4-ambulancia", inicial: 4192.5, preEntrega: 7378.2, ordinaria: 1451.0, especial: 1272.8 }, // pág. 48
  { vehicleId: "x100-ferretero", inicial: 1393.0, preEntrega: 2854.3, ordinaria: 385.6, especial: 905.4 }, // pág. 51
  { vehicleId: "urban-chasis-largo-3-ton", inicial: 1931.6, preEntrega: 3733.8, ordinaria: 534.7, especial: 1255.5 }, // pág. 53
  { vehicleId: "urban-3-ton", inicial: 2048.0, preEntrega: 3923.8, ordinaria: 566.9, especial: 1331.2 }, // pág. 55
  { vehicleId: "c-3500-ferretero-4x4", inicial: 2849.8, preEntrega: 5273.2, ordinaria: 787.4, especial: 1852.4 }, // pág. 57
  { vehicleId: "doble-cabina-ferretero", inicial: 2292.8, preEntrega: 4323.5, ordinaria: 634.6, especial: 1490.3 }, // pág. 59
  { vehicleId: "6t-chasis", inicial: 2780.2, preEntrega: 5119.3, ordinaria: 769.5, especial: 1807.1 }, // pág. 61
  { vehicleId: "6t-ferretero", inicial: 2989.7, preEntrega: 5461.3, ordinaria: 827.5, especial: 1943.3 }, // pág. 63
  { vehicleId: "bufalo-12-ton", inicial: 4293.8, preEntrega: 7590.6, ordinaria: 1188.5, especial: 2790.9 }, // pág. 65
  { vehicleId: "bufalo-xl", inicial: 4518.4, preEntrega: 7957.3, ordinaria: 1250.7, especial: 2936.9 }, // pág. 67
  { vehicleId: "leyenda-20-ton", inicial: 6195.1, preEntrega: 10694.9, ordinaria: 1714.8, especial: 4026.8 }, // pág. 69
  { vehicleId: "leyenda-380-hp", inicial: 6855.1, preEntrega: 11772.6, ordinaria: 1897.5, especial: 4455.8 }, // pág. 71
  { vehicleId: "minero-20m3", inicial: 8064.6, preEntrega: 13747.4, ordinaria: 2232.3, especial: 5242.0 }, // pág. 73
  { vehicleId: "minero-28m3", inicial: 10385.8, preEntrega: 17537.2, ordinaria: 2874.7, especial: 6750.7 }, // pág. 75
  { vehicleId: "minero-14m3", inicial: 6089.3, preEntrega: 10522.2, ordinaria: 1685.5, especial: 3958.0 }, // pág. 77
  { vehicleId: "cavalino", inicial: 4330.8, preEntrega: 7651.1, ordinaria: 1198.8, especial: 2815.0 }, // pág. 79
  { vehicleId: "bachaco-400-hp", inicial: 5848.3, preEntrega: 10128.8, ordinaria: 1618.8, especial: 3801.4 }, // pág. 81
  { vehicleId: "chuto-4251-430-hp", inicial: 6617.2, preEntrega: 11732.9, ordinaria: 1819.6, especial: 4301.2 }, // pág. 83
  { vehicleId: "autobus-28-6-1-puestos", inicial: 6149.8, preEntrega: 10621.0, ordinaria: 1702.2, especial: 3997.3 }, // pág. 85
  { vehicleId: "compactador-5-ton", inicial: 5308.8, preEntrega: 9148.0, ordinaria: 1472.9, especial: 3450.7 }, // pág. 87
  { vehicleId: "compactador-10m3", inicial: 7377.5, preEntrega: 12625.5, ordinaria: 2042.1, especial: 4795.3 }, // pág. 89
  { vehicleId: "x100-cava-seca", inicial: 1742.0, preEntrega: 3406.8, ordinaria: 482.8, especial: 1132.3 }, // pág. 91
  { vehicleId: "x100-cava-de-conservacion", inicial: 1950.7, preEntrega: 3652.0, ordinaria: 543.8, especial: 1267.9 }, // pág. 93
  { vehicleId: "urban-cava-seca", inicial: 2419.4, preEntrega: 4390.0, ordinaria: 674.5, especial: 1572.6 }, // pág. 95
  { vehicleId: "urban-cava-de-conservacion", inicial: 2521.4, preEntrega: 4696.8, ordinaria: 697.9, especial: 1638.9 }, // pág. 97
  { vehicleId: "urban-cava-refrigerada", inicial: 3386.7, preEntrega: 5885.2, ordinaria: 945.1, especial: 2201.3 }, // pág. 99
  { vehicleId: "6t-cava-seca", inicial: 3348.6, preEntrega: 6047.4, ordinaria: 926.9, especial: 2176.6 }, // pág. 101
  { vehicleId: "6t-cava-de-conservacion", inicial: 3744.6, preEntrega: 6694.0, ordinaria: 1036.5, especial: 2434.0 }, // pág. 103
  { vehicleId: "6t-cava-refrigerada", inicial: 4942.0, preEntrega: 8367.3, ordinaria: 1377.6, especial: 3212.3 }, // pág. 105
  { vehicleId: "6t-brazo-hidraulico", inicial: 5626.7, preEntrega: 9766.8, ordinaria: 1557.4, especial: 3657.3 }, // pág. 107
  { vehicleId: "bufalo-cava-seca", inicial: 5317.0, preEntrega: 9078.9, ordinaria: 1478.0, especial: 3456.0 }, // pág. 109
  { vehicleId: "bufalo-cava-de-conservacion", inicial: 5599.9, preEntrega: 9723.2, ordinaria: 1550.0, especial: 3639.9 }, // pág. 111
  { vehicleId: "bufalo-cava-refrigerada", inicial: 6899.2, preEntrega: 11844.6, ordinaria: 1909.7, especial: 4484.5 }, // pág. 113
  { vehicleId: "bufalo-brazo-hidraulico", inicial: 9573.5, preEntrega: 15839.6, ordinaria: 2662.7, especial: 6222.7 }, // pág. 115
  { vehicleId: "leyenda-cava-seca", inicial: 7467.6, preEntrega: 12772.5, ordinaria: 2067.0, especial: 4853.9 }, // pág. 117
  { vehicleId: "leyenda-cava-refrigerada", inicial: 8743.1, preEntrega: 14855.1, ordinaria: 2420.0, especial: 5682.9 }, // pág. 119
  { vehicleId: "leyenda-brazo-hidraulico", inicial: 12583.2, preEntrega: 21125.0, ordinaria: 3483.0, especial: 8179.0 }, // pág. 121
  { vehicleId: "doble-cabina-brazo-elevador-20m", inicial: 5935.9, preEntrega: 10271.7, ordinaria: 1643.0, especial: 3858.3 }, // pág. 123
  { vehicleId: "volkan-mezclador-9m3", inicial: 10158.2, preEntrega: 17165.6, ordinaria: 2811.7, especial: 6602.7 }, // pág. 125
];

const buildCredijac35x35Schedule = (q: { inicial: number; preEntrega: number; ordinaria: number; especial: number }): PaymentStage[] => [
  { type: "INITIAL", count: 6, amount: q.inicial, label: "Cuotas de inicial (35%)" },
  { type: "PRE_DELIVERY", count: 1, amount: q.preEntrega, label: "Cuota especial previa a la entrega" },
  { type: "ORDINARY", count: 30, amount: q.ordinaria, label: "Cuotas ordinarias mensuales" },
  { type: "SPECIAL", count: 6, months: [9, 12, 15, 18, 21, 24], amount: q.especial, label: "Cuotas especiales (meses 9, 12, 15, 18, 21 y 24)" },
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
    amountsSourceStatus: "VERIFIED_12_OCT" as SourceStatus,
    amountsSource: CATALOGO_FIAO_12_OCT,
    schedule: buildFiaoSchedule(q),
  })),
  ...ruta48Quotas.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "credijac-ruta-48",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_28_SEP" as SourceStatus,
    amountsSource: CATALOGO_RUTA48_28_SEP,
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
  ...facilitoQuotas.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "facilito",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_12_OCT" as SourceStatus,
    amountsSource: CATALOGO_FACILITO_12_OCT,
    schedule: buildFacilitoSchedule(q),
  })),
  ...credijac35x35Quotas.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "credijac-35x35",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_12_OCT" as SourceStatus,
    amountsSource: CATALOGO_35X35_12_OCT,
    schedule: buildCredijac35x35Schedule(q),
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
