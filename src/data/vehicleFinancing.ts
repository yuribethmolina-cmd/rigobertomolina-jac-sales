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

const CATALOGO_PF_05_NOV = "PAGO FÁCIL — 05 DE NOVIEMBRE";
const PAGO_FACIL_SIGNATURE_NOV = 999.99;

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

/* ── PAGO FÁCIL — catálogo del 05 de noviembre ──
   Estructura: US$ 999,99 a la firma + 12 cuotas consecutivas y mensuales +
   1 pago previo a la entrega. 72 configuraciones, importes exactos del PDF. */
const pagoFacilNov: { vehicleId: string; cuota: number; preEntrega: number }[] = [
  { vehicleId: "arena-sport-manual", cuota: 1278.18, preEntrega: 3007.1 },
  { vehicleId: "arena-sport-automatico", cuota: 1396.84, preEntrega: 3234.92 },
  { vehicleId: "nevado-pro", cuota: 2025.64, preEntrega: 4442.23 },
  { vehicleId: "arena-pro", cuota: 1538.27, preEntrega: 3506.48 },
  { vehicleId: "titanio", cuota: 3466.18, preEntrega: 7255.08 },
  { vehicleId: "nevado-manual", cuota: 1714.58, preEntrega: 3844.99 },
  { vehicleId: "tepuy-pro", cuota: 2388.47, preEntrega: 5138.86 },
  { vehicleId: "savanna", cuota: 2548.82, preEntrega: 5446.74 },
  { vehicleId: "rf8", cuota: 3967.32, preEntrega: 8170.25 },
  { vehicleId: "gx7", cuota: 2310.38, preEntrega: 4988.93 },
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", cuota: 1758.27, preEntrega: 3975.88 },
  { vehicleId: "la-venezolana-a-gasolina-4x2", cuota: 1812.53, preEntrega: 4080.05 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", cuota: 2079.18, preEntrega: 4592.02 },
  { vehicleId: "la-venezolana-a-diesel-4x2", cuota: 1740.87, preEntrega: 3942.47 },
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", cuota: 2003.46, preEntrega: 4446.64 },
  { vehicleId: "la-venezolana-a-diesel-4x4", cuota: 1942.74, preEntrega: 4330.05 },
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", cuota: 2205.58, preEntrega: 4834.72 },
  { vehicleId: "la-venezolana-pro-4x4", cuota: 2311.89, preEntrega: 5038.84 },
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", cuota: 2545.39, preEntrega: 5487.15 },
  { vehicleId: "limited", cuota: 2836.43, preEntrega: 6045.95 },
  { vehicleId: "aventura-a-gasolina", cuota: 2838.45, preEntrega: 6049.82 },
  { vehicleId: "aventura-pro-a-gasolina", cuota: 3525.23, preEntrega: 7368.45 },
  { vehicleId: "x100-ferretero", cuota: 1286.61, preEntrega: 3070.29 },
  { vehicleId: "urban-chasis-largo-3-ton", cuota: 1733.85, preEntrega: 3928.98 },
  { vehicleId: "urban-3-ton", cuota: 1872.53, preEntrega: 4195.25 },
  { vehicleId: "pionero-chasis-5-ton", cuota: 2241.64, preEntrega: 4903.95 },
  { vehicleId: "pionero-ferretero-5-ton", cuota: 2462.79, preEntrega: 5328.57 },
  { vehicleId: "pionero-ferretero-4x4", cuota: 3112.86, preEntrega: 6576.69 },
  { vehicleId: "c-3500-ferretero-4x4", cuota: 2540.15, preEntrega: 5477.09 },
  { vehicleId: "doble-cabina-ferretero", cuota: 2086.23, preEntrega: 4605.57 },
  { vehicleId: "6t-chasis", cuota: 2526.92, preEntrega: 5451.69 },
  { vehicleId: "6t-ferretero", cuota: 2735.23, preEntrega: 5851.64 },
  { vehicleId: "bufalo-12-ton", cuota: 3999.67, preEntrega: 8279.38 },
  { vehicleId: "bufalo-xl", cuota: 4211.68, preEntrega: 8686.43 },
  { vehicleId: "leyenda-20-ton", cuota: 5694.61, preEntrega: 11533.66 },
  { vehicleId: "leyenda-380-hp", cuota: 6217.49, preEntrega: 12537.6 },
  { vehicleId: "minero-20m3", cuota: 7223.39, preEntrega: 14468.92 },
  { vehicleId: "minero-28m3", cuota: 9258.5, preEntrega: 18376.35 },
  { vehicleId: "minero-14m3", cuota: 5311.09, preEntrega: 10797.31 },
  { vehicleId: "cavalino", cuota: 3906.69, preEntrega: 8100.85 },
  { vehicleId: "bachaco-400-hp", cuota: 5531.37, preEntrega: 11220.25 },
  { vehicleId: "chuto-4251-430-hp", cuota: 6321.52, preEntrega: 12737.33 },
  { vehicleId: "sunray-v4-pasajeros", cuota: 2888.62, preEntrega: 6146.16 },
  { vehicleId: "sunray-v4-carga", cuota: 2687.96, preEntrega: 5760.88 },
  { vehicleId: "sunray-v6-pasajeros", cuota: 3092.45, preEntrega: 6537.52 },
  { vehicleId: "sunray-v6-carga", cuota: 2935.03, preEntrega: 6235.25 },
  { vehicleId: "sunray-v6-motorhome", cuota: 7279.45, preEntrega: 14576.55 },
  { vehicleId: "sunray-v6-van-escolar", cuota: 3536.71, preEntrega: 7390.48 },
  { vehicleId: "sunray-v4-ambulancia", cuota: 3817.02, preEntrega: 7881.69 },
  { vehicleId: "autobus-28-6-1-puestos", cuota: 5428.05, preEntrega: 11021.86 },
  { vehicleId: "compactador-5-ton", cuota: 4704.21, preEntrega: 9632.1 },
  { vehicleId: "compactador-10m3", cuota: 6639.2, preEntrega: 13347.28 },
  { vehicleId: "x100-cava-seca", cuota: 1520.12, preEntrega: 3518.63 },
  { vehicleId: "x100-cava-de-conservacion", cuota: 1635.6, preEntrega: 3740.35 },
  { vehicleId: "urban-cava-seca", cuota: 2109.47, preEntrega: 4650.18 },
  { vehicleId: "urban-cava-de-conservacion", cuota: 2230.56, preEntrega: 4882.68 },
  { vehicleId: "urban-cava-refrigerada", cuota: 2799.82, preEntrega: 5975.66 },
  { vehicleId: "pionero-transporte-pollito-bebe", cuota: 4689.29, preEntrega: 9603.44 },
  { vehicleId: "6t-cava-seca", cuota: 3032.77, preEntrega: 6422.92 },
  { vehicleId: "6t-cava-de-conservacion", cuota: 3374.02, preEntrega: 7078.11 },
  { vehicleId: "6t-cava-refrigerada", cuota: 4172.85, preEntrega: 8611.88 },
  { vehicleId: "bufalo-cava-seca", cuota: 4820.53, preEntrega: 9855.42 },
  { vehicleId: "bufalo-cava-de-conservacion", cuota: 5171.99, preEntrega: 10530.23 },
  { vehicleId: "bufalo-cava-refrigerada", cuota: 6197.22, preEntrega: 12498.67 },
  { vehicleId: "bufalo-brazo-hidraulico", cuota: 7922.44, preEntrega: 15811.11 },
  { vehicleId: "bufalo-transporte-pollito-bebe", cuota: 8113.12, preEntrega: 16177.21 },
  { vehicleId: "leyenda-cava-seca", cuota: 6853.11, preEntrega: 13757.99 },
  { vehicleId: "leyenda-cava-refrigerada", cuota: 8249.52, preEntrega: 16439.09 },
  { vehicleId: "leyenda-brazo-hidraulico", cuota: 10894.41, preEntrega: 21517.29 },
  { vehicleId: "doble-cabina-brazo-elevador-20m", cuota: 5289.8, preEntrega: 10756.43 },
  { vehicleId: "volkan-mezclador-9m3", cuota: 8907.2, preEntrega: 17701.83 },
  { vehicleId: "contenedor-refrigerado-40-pies", cuota: 9848.53, preEntrega: 19509.19 },
];

const CATALOGO_FIAO_05_NOV = "LLÉVATELO FIAO — 05 DE NOVIEMBRE";

/* Cronogramas Llévatelo Fiao trazables al catálogo del 05 de noviembre (129 páginas).
   Estructura: pago a la firma + 5 pagos de igual monto (inicial)
   + pre-entrega + 15 cuotas ordinarias. */
const fiaoQuotas: {
  vehicleId: string;
  firma: number;
  preEntrega: number;
  cuota: number;
}[] = [
  { vehicleId: "arena-sport-manual", firma: 993.95, preEntrega: 3621.00, cuota: 927.67 }, // pág. 2
  { vehicleId: "arena-sport-automatico", firma: 1097.82, preEntrega: 3943.69, cuota: 1024.61 }, // pág. 4
  { vehicleId: "nevado-pro", firma: 1599.81, preEntrega: 5503.28, cuota: 1493.13 }, // pág. 6
  { vehicleId: "arena-pro", firma: 1227.65, preEntrega: 4347.05, cuota: 1145.79 }, // pág. 8
  { vehicleId: "titanio", firma: 2684.04, preEntrega: 8918.76, cuota: 2505.07 }, // pág. 10
  { vehicleId: "nevado-manual", firma: 1318.53, preEntrega: 4629.40, cuota: 1230.61 }, // pág. 12
  { vehicleId: "tepuy-pro", firma: 1924.02, preEntrega: 6510.52, cuota: 1795.72 }, // pág. 14
  { vehicleId: "savanna", firma: 1924.00, preEntrega: 6510.49, cuota: 1795.71 }, // pág. 16
  { vehicleId: "rf8", firma: 3008.08, preEntrega: 9878.48, cuota: 2807.50 }, // pág. 18
  { vehicleId: "gx7", firma: 1692.48, preEntrega: 5791.18, cuota: 1579.62 }, // pág. 20
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", firma: 1273.21, preEntrega: 4535.61, cuota: 1188.32 }, // pág. 22
  { vehicleId: "la-venezolana-a-gasolina-4x2", firma: 1402.62, preEntrega: 4937.65, cuota: 1309.09 }, // pág. 24
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", firma: 1503.87, preEntrega: 5252.22, cuota: 1403.59 }, // pág. 26
  { vehicleId: "la-venezolana-a-diesel-4x2", firma: 1445.89, preEntrega: 5072.10, cuota: 1349.48 }, // pág. 28
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", firma: 1546.03, preEntrega: 5383.20, cuota: 1442.94 }, // pág. 30
  { vehicleId: "la-venezolana-a-diesel-4x4", firma: 1619.00, preEntrega: 5609.92, cuota: 1511.05 }, // pág. 32
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", firma: 1737.88, preEntrega: 5979.22, cuota: 1621.99 }, // pág. 34
  { vehicleId: "la-venezolana-pro-4x4", firma: 1835.39, preEntrega: 6282.19, cuota: 1713.01 }, // pág. 36
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", firma: 2015.43, preEntrega: 6841.52, cuota: 1881.04 }, // pág. 38
  { vehicleId: "limited", firma: 2188.13, preEntrega: 7378.07, cuota: 2042.22 }, // pág. 40
  { vehicleId: "aventura-a-gasolina", firma: 2181.62, preEntrega: 7357.85, cuota: 2036.15 }, // pág. 42
  { vehicleId: "aventura-pro-a-gasolina", firma: 2614.38, preEntrega: 8702.35, cuota: 2440.06 }, // pág. 44
  { vehicleId: "x100-ferretero", firma: 1186.66, preEntrega: 4266.72, cuota: 1107.54 }, // pág. 46
  { vehicleId: "urban-chasis-largo-3-ton", firma: 1446.33, preEntrega: 5073.44, cuota: 1349.89 }, // pág. 48
  { vehicleId: "urban-3-ton", firma: 1576.16, preEntrega: 5476.81, cuota: 1471.06 }, // pág. 50
  { vehicleId: "pionero-chasis-5-ton", firma: 1936.50, preEntrega: 6596.32, cuota: 1807.38 }, // pág. 52
  { vehicleId: "pionero-ferretero-5-ton", firma: 2071.12, preEntrega: 7014.56, cuota: 1933.02 }, // pág. 54
  { vehicleId: "pionero-ferretero-4x4", firma: 2525.15, preEntrega: 8425.12, cuota: 2356.77 }, // pág. 56
  { vehicleId: "c-3500-ferretero-4x4", firma: 2044.16, preEntrega: 6930.79, cuota: 1907.86 }, // pág. 58
  { vehicleId: "doble-cabina-ferretero", firma: 1749.27, preEntrega: 6014.62, cuota: 1632.63 }, // pág. 60
  { vehicleId: "6t-chasis", firma: 2134.44, preEntrega: 7211.26, cuota: 1992.11 }, // pág. 62
  { vehicleId: "6t-ferretero", firma: 2268.60, preEntrega: 7628.07, cuota: 2117.33 }, // pág. 64
  { vehicleId: "bufalo-12-ton", firma: 3134.14, preEntrega: 10317.14, cuota: 2925.16 }, // pág. 66
  { vehicleId: "bufalo-xl", firma: 3350.53, preEntrega: 10989.41, cuota: 3127.12 }, // pág. 68
  { vehicleId: "leyenda-20-ton", firma: 4519.02, preEntrega: 14619.68, cuota: 4217.69 }, // pág. 70
  { vehicleId: "leyenda-380-hp", firma: 5347.35, preEntrega: 17193.11, cuota: 4990.78 }, // pág. 72
  { vehicleId: "minero-20m3", firma: 6039.38, preEntrega: 19343.13, cuota: 5636.68 }, // pág. 74
  { vehicleId: "minero-14m3", firma: 4222.16, preEntrega: 13697.39, cuota: 3940.62 }, // pág. 76
  { vehicleId: "cavalino", firma: 3220.70, preEntrega: 10586.05, cuota: 3005.94 }, // pág. 78
  { vehicleId: "bachaco-400-hp", firma: 4086.24, preEntrega: 13275.13, cuota: 3813.77 }, // pág. 80
  { vehicleId: "chuto-4251-430-hp", firma: 4644.52, preEntrega: 15009.58, cuota: 4334.82 }, // pág. 82
  { vehicleId: "sunray-v4-pasajeros", firma: 2224.89, preEntrega: 7492.27, cuota: 2076.53 }, // pág. 84
  { vehicleId: "sunray-v4-carga", firma: 2134.44, preEntrega: 7211.26, cuota: 1992.11 }, // pág. 86
  { vehicleId: "sunray-v6-pasajeros", firma: 2744.22, preEntrega: 9105.73, cuota: 2561.23 }, // pág. 88
  { vehicleId: "sunray-v6-carga", firma: 2441.71, preEntrega: 8165.88, cuota: 2278.89 }, // pág. 90
  { vehicleId: "sunray-v6-motorhome", firma: 4953.61, preEntrega: 15922.86, cuota: 4623.31 }, // pág. 92
  { vehicleId: "sunray-v6-van-escolar", firma: 2707.43, preEntrega: 8991.43, cuota: 2526.90 }, // pág. 94
  { vehicleId: "sunray-v4-ambulancia", firma: 3135.74, preEntrega: 10275.12, cuota: 2926.65 }, // pág. 96
  { vehicleId: "autobus-28-6-1-puestos", firma: 4265.42, preEntrega: 13831.78, cuota: 3981.00 }, // pág. 98
  { vehicleId: "compactador-5-ton", firma: 3789.39, preEntrega: 12352.85, cuota: 3536.71 }, // pág. 100
  { vehicleId: "compactador-10m3", firma: 5188.55, preEntrega: 16699.76, cuota: 4842.57 }, // pág. 102
  { vehicleId: "x100-cava-de-conservacion", firma: 1279.28, preEntrega: 4554.47, cuota: 1193.98 }, // pág. 104
  { vehicleId: "urban-cava-seca", firma: 1704.76, preEntrega: 4914.56, cuota: 1657.12 }, // pág. 106
  { vehicleId: "urban-cava-refrigerada", firma: 2528.26, preEntrega: 8434.79, cuota: 2359.68 }, // pág. 108
  { vehicleId: "pionero-transporte-pollito-bebe", firma: 3611.24, preEntrega: 11799.40, cuota: 3370.45 }, // pág. 110
  { vehicleId: "6t-cava-seca", firma: 2567.21, preEntrega: 8555.80, cuota: 2396.03 }, // pág. 112
  { vehicleId: "6t-cava-refrigerada", firma: 3631.83, preEntrega: 11863.36, cuota: 3389.66 }, // pág. 114
  { vehicleId: "bufalo-brazo-hidraulico", firma: 6358.33, preEntrega: 20334.04, cuota: 5934.36 }, // pág. 116
  { vehicleId: "bufalo-transporte-pollito-bebe", firma: 6203.12, preEntrega: 19851.84, cuota: 5789.50 }, // pág. 118
  { vehicleId: "leyenda-cava-seca", firma: 5433.91, preEntrega: 17462.07, cuota: 5071.58 }, // pág. 120
  { vehicleId: "leyenda-brazo-hidraulico", firma: 8694.04, preEntrega: 27590.62, cuota: 8114.32 }, // pág. 122
  { vehicleId: "doble-cabina-brazo-elevador-20m", firma: 4104.69, preEntrega: 13332.45, cuota: 3830.99 }, // pág. 124
  { vehicleId: "volkan-mezclador-9m3", firma: 6732.23, preEntrega: 21495.67, cuota: 6283.33 }, // pág. 126
  { vehicleId: "contenedor-refrigerado-40-pies", firma: 7242.46, preEntrega: 23080.85, cuota: 6759.53 }, // pág. 128
];

/** Cronograma de Pago Fácil con los importes del catálogo del 05 de noviembre. */
const buildPagoFacilSchedule = (q: { cuota: number; preEntrega: number }): PaymentStage[] => [
  { type: "SIGNATURE", count: 1, amount: PAGO_FACIL_SIGNATURE_NOV, label: "Pago a la firma del contrato" },
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

const CATALOGO_FACILITO_05_NOV = "FACILITO DE JAC — 05 DE NOVIEMBRE";

/* Cronogramas Facilito de JAC trazables al catálogo del 05 de noviembre.
   Estructura: 1 pago a la firma + 6 pagos mensuales + pre-entrega + 20 cuotas fijas.
   6T Brazo Hidráulico ya no aparece en este catálogo. */
const facilitoQuotas: {
  vehicleId: string;
  cuota: number;
  preEntrega: number;
}[] = [
  { vehicleId: "arena-sport-manual", cuota: 799.18, preEntrega: 2887.92 }, // pág. 2
  { vehicleId: "arena-sport-automatico", cuota: 899.05, preEntrega: 3081.96 }, // pág. 4
  { vehicleId: "nevado-pro", cuota: 1323.12, preEntrega: 4203.67 }, // pág. 6
  { vehicleId: "arena-pro", cuota: 999.08, preEntrega: 3330.5 }, // pág. 8
  { vehicleId: "titanio", cuota: 2159.05, preEntrega: 6760.57 }, // pág. 10
  { vehicleId: "nevado-manual", cuota: 1099.09, preEntrega: 3622.14 }, // pág. 12
  { vehicleId: "tepuy-pro", cuota: 1499.01, preEntrega: 4787.28 }, // pág. 14
  { vehicleId: "savanna", cuota: 1599.31, preEntrega: 5096.24 }, // pág. 16
  { vehicleId: "rf8", cuota: 2799.38, preEntrega: 7665.61 }, // pág. 18
  { vehicleId: "gx7", cuota: 1599.67, preEntrega: 4612.29 }, // pág. 20
  { vehicleId: "t5-la-venezolana-4x2-diesel-2-8l", cuota: 1199.77, preEntrega: 3697.71 }, // pág. 22
  { vehicleId: "la-venezolana-a-gasolina-4x2", cuota: 1119.08, preEntrega: 3633.16 }, // pág. 24
  { vehicleId: "la-venezolana-pa-l-campo-4x2-gasolina", cuota: 1248.69, preEntrega: 4040.9 }, // pág. 26
  { vehicleId: "la-venezolana-a-diesel-4x2", cuota: 1149.81, preEntrega: 3730.19 }, // pág. 28
  { vehicleId: "la-venezolana-pa-l-campo-4x2-diesel", cuota: 1259.09, preEntrega: 4137.93 }, // pág. 30
  { vehicleId: "la-venezolana-a-diesel-4x4", cuota: 1299.55, preEntrega: 4109.62 }, // pág. 32
  { vehicleId: "la-venezolana-pa-l-campo-4x4-diesel", cuota: 1473.14, preEntrega: 4454.57 }, // pág. 34
  { vehicleId: "la-venezolana-pro-4x4", cuota: 1629.63, preEntrega: 4760.26 }, // pág. 36
  { vehicleId: "la-venezolana-pro-4x4-pa-l-campo", cuota: 1643.32, preEntrega: 5218.17 }, // pág. 38
  { vehicleId: "limited", cuota: 1999.45, preEntrega: 5771.5 }, // pág. 40
  { vehicleId: "aventura-a-gasolina", cuota: 1899.16, preEntrega: 5686.11 }, // pág. 42
  { vehicleId: "aventura-pro-a-gasolina", cuota: 2199.49, preEntrega: 6907.8 }, // pág. 44
  { vehicleId: "x100-ferretero", cuota: 1049.36, preEntrega: 2854.34 }, // pág. 46
  { vehicleId: "urban-chasis-largo-3-ton", cuota: 1199.06, preEntrega: 3733.78 }, // pág. 48
  { vehicleId: "urban-3-ton", cuota: 1299.12, preEntrega: 3923.8 }, // pág. 50
  { vehicleId: "pionero-chasis-5-ton", cuota: 1593.51, preEntrega: 5036.6 }, // pág. 52
  { vehicleId: "pionero-ferretero-5-ton", cuota: 1747.06, preEntrega: 5346.39 }, // pág. 54
  { vehicleId: "pionero-ferretero-4x4", cuota: 2078.23, preEntrega: 6459.18 }, // pág. 56
  { vehicleId: "c-3500-ferretero-4x4", cuota: 1817.56, preEntrega: 5273.2 }, // pág. 58
  { vehicleId: "doble-cabina-ferretero", cuota: 1499.38, preEntrega: 4323.53 }, // pág. 60
  { vehicleId: "6t-chasis", cuota: 1719.84, preEntrega: 5119.28 }, // pág. 62
  { vehicleId: "6t-ferretero", cuota: 1809.81, preEntrega: 5461.34 }, // pág. 64
  { vehicleId: "bufalo-12-ton", cuota: 2779.09, preEntrega: 7591.36 }, // pág. 66
  { vehicleId: "bufalo-xl", cuota: 2999.27, preEntrega: 7957.26 }, // pág. 68
  { vehicleId: "leyenda-20-ton", cuota: 3549.09, preEntrega: 10694.91 }, // pág. 70
  { vehicleId: "leyenda-380-hp", cuota: 4299.07, preEntrega: 11772.61 }, // pág. 72
  { vehicleId: "minero-20m3", cuota: 5399.15, preEntrega: 13747.38 }, // pág. 74
  { vehicleId: "minero-28m3", cuota: 5989.07, preEntrega: 17537.19 }, // pág. 76
  { vehicleId: "minero-14m3", cuota: 3899.16, preEntrega: 10522.22 }, // pág. 78
  { vehicleId: "cavalino", cuota: 2769.38, preEntrega: 7651.08 }, // pág. 80
  { vehicleId: "bachaco-400-hp", cuota: 3529.34, preEntrega: 10128.75 }, // pág. 82
  { vehicleId: "chuto-4251-430-hp", cuota: 3859.31, preEntrega: 11732.9 }, // pág. 84
  { vehicleId: "sunray-v4-pasajeros", cuota: 2029.31, preEntrega: 5795.06 }, // pág. 86
  { vehicleId: "sunray-v4-carga", cuota: 1899.23, preEntrega: 5431.45 }, // pág. 88
  { vehicleId: "sunray-v6-pasajeros", cuota: 2279.71, preEntrega: 6093.78 }, // pág. 90
  { vehicleId: "sunray-v6-carga", cuota: 2059.03, preEntrega: 5810.59 }, // pág. 92
  { vehicleId: "sunray-v6-motorhome", cuota: 4499.35, preEntrega: 13135.27 }, // pág. 94
  { vehicleId: "sunray-v6-van-escolar", cuota: 2499.2, preEntrega: 6867.38 }, // pág. 96
  { vehicleId: "sunray-v4-ambulancia", cuota: 2699.76, preEntrega: 7378.23 }, // pág. 98
  { vehicleId: "autobus-28-6-1-puestos", cuota: 3799.73, preEntrega: 10620.96 }, // pág. 100
  { vehicleId: "compactador-5-ton", cuota: 3499.38, preEntrega: 9148.04 }, // pág. 102
  { vehicleId: "compactador-10m3", cuota: 4769.54, preEntrega: 12625.53 }, // pág. 104
  { vehicleId: "x100-cava-seca", cuota: 1119.27, preEntrega: 3406.8 }, // pág. 106
  { vehicleId: "x100-cava-de-conservacion", cuota: 1259.71, preEntrega: 3651.96 }, // pág. 108
  { vehicleId: "urban-cava-seca", cuota: 1559.01, preEntrega: 4389.99 }, // pág. 110
  { vehicleId: "urban-cava-de-conservacion", cuota: 1599.08, preEntrega: 4696.81 }, // pág. 112
  { vehicleId: "urban-cava-refrigerada", cuota: 2232.88, preEntrega: 5000.22 }, // pág. 114
  { vehicleId: "pionero-transporte-pollito-bebe", cuota: 2918.7, preEntrega: 8890.67 }, // pág. 116
  { vehicleId: "6t-cava-seca", cuota: 2009.11, preEntrega: 6047.37 }, // pág. 118
  { vehicleId: "6t-cava-de-conservacion", cuota: 2309.12, preEntrega: 6693.95 }, // pág. 120
  { vehicleId: "6t-cava-refrigerada", cuota: 3109.12, preEntrega: 8367.31 }, // pág. 122
  { vehicleId: "bufalo-cava-seca", cuota: 3399.13, preEntrega: 9078.92 }, // pág. 124
  { vehicleId: "bufalo-cava-de-conservacion", cuota: 3499.08, preEntrega: 9723.17 }, // pág. 126
  { vehicleId: "bufalo-cava-refrigerada", cuota: 4299.02, preEntrega: 11844.6 }, // pág. 128
  { vehicleId: "bufalo-brazo-hidraulico", cuota: 5460.24, preEntrega: 15839.57 }, // pág. 130
  { vehicleId: "bufalo-transporte-pollito-bebe", cuota: 5038.32, preEntrega: 14855.44 }, // pág. 132
  { vehicleId: "leyenda-cava-seca", cuota: 4697.15, preEntrega: 13872.5 }, // pág. 134
  { vehicleId: "leyenda-cava-refrigerada", cuota: 4999.08, preEntrega: 14855.04 }, // pág. 136
  { vehicleId: "leyenda-brazo-hidraulico", cuota: 7539.17, preEntrega: 21125.02 }, // pág. 138
  { vehicleId: "doble-cabina-brazo-elevador-20m", cuota: 3789.2, preEntrega: 10271.65 }, // pág. 140
  { vehicleId: "volkan-mezclador-9m3", cuota: 6049.62, preEntrega: 17165.58 }, // pág. 142
  { vehicleId: "contenedor-refrigerado-40-pies", cuota: 5695.94, preEntrega: 17878.75 }, // pág. 144
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
  ...pagoFacilNov.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "pago-facil",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_05_NOV" as SourceStatus,
    amountsSource: CATALOGO_PF_05_NOV,
    schedule: buildPagoFacilSchedule(q),
  })),
  ...fiaoQuotas.map((q) => ({
    vehicleId: q.vehicleId,
    planId: "llevatelo-fiao",
    currency: "USD" as const,
    amountsSourceStatus: "VERIFIED_05_NOV" as SourceStatus,
    amountsSource: CATALOGO_FIAO_05_NOV,
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
    amountsSourceStatus: "VERIFIED_05_NOV" as SourceStatus,
    amountsSource: CATALOGO_FACILITO_05_NOV,
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
