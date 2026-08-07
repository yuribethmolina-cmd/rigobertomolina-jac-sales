/* Fuente única de verdad para el simulador de pagos y la tabla comparativa.
   Montos referenciales Agosto 2026 (catálogos del 06 de agosto 2026). */

export interface PlanModel {
  modelo: string;
  featured?: boolean;
  /* Compra Directa: 7 pagos iguales */
  cuotaDirecta: number | null;
  totalDirecta: number | null;
  /* Pago Fácil: afiliación + 12 cuotas + pago previo a la entrega */
  afiliacionFacil?: number | null;
  cuotaFacil: number | null;
  finalFacil?: number | null;
  totalFacil: number | null;
}

const AFILIACION_FACIL = 999.9;

export const planModels: PlanModel[] = [
  {
    modelo: "Arena Sport MT",
    cuotaDirecta: 2568,
    totalDirecta: 17978,
    afiliacionFacil: AFILIACION_FACIL,
    cuotaFacil: 1241.9,
    finalFacil: 2937.5,
    totalFacil: 18840.2,
  },
  {
    modelo: "Arena Sport AT",
    cuotaDirecta: 2775,
    totalDirecta: 19427,
    afiliacionFacil: AFILIACION_FACIL,
    cuotaFacil: 1351.1,
    finalFacil: 3147.1,
    totalFacil: 20360.2,
  },
  {
    modelo: "Nevado MT",
    featured: true,
    cuotaDirecta: 3352,
    totalDirecta: 23461,
    afiliacionFacil: AFILIACION_FACIL,
    cuotaFacil: 1655.1,
    finalFacil: 3730.8,
    totalFacil: 24591.9,
  },
  {
    modelo: "La Venezolana 4x2",
    cuotaDirecta: 3267,
    totalDirecta: 22874,
    afiliacionFacil: AFILIACION_FACIL,
    cuotaFacil: 1634.9,
    finalFacil: 3738.9,
    totalFacil: 24357.6,
  },
];


const round1 = (n: number) => Math.round(n * 10) / 10;

export const fmtMoney = (n: number) =>
  "$" + n.toLocaleString("es-VE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtMoney0 = (n: number) =>
  "$" + n.toLocaleString("es-VE", { maximumFractionDigits: 0 });

export type ScheduleRow = { label: string; amount: number; cumulative: number };

/* Compra Directa: afiliación + 5 cuotas + previo a la entrega = 7 pagos.
   El último pago se ajusta para que el total coincida con la tabla comparativa. */
export const buildDirectaSchedule = (cuota: number, total: number): ScheduleRow[] => {
  const labels = [
    "Afiliación",
    "Cuota 1",
    "Cuota 2",
    "Cuota 3",
    "Cuota 4",
    "Cuota 5",
    "Previo a entrega",
  ];
  let cumulative = 0;
  return labels.map((label, i) => {
    const amount = i === labels.length - 1 ? round1(total - cumulative) : round1(cuota);
    cumulative = round1(cumulative + amount);
    return { label, amount, cumulative };
  });
};

/* Pago Fácil: afiliación a la firma + 12 cuotas mensuales + pago previo a la entrega.
   Los montos vienen del catálogo; el pago final se ajusta si hay redondeos. */
export const buildFacilSchedule = (
  cuota: number,
  total: number,
  afiliacion: number = 999.9,
  final?: number | null
): ScheduleRow[] => {
  const labels = [
    "Afiliación",
    ...Array.from({ length: 12 }, (_, i) => `Cuota ${i + 1}`),
    "Previo a entrega",
  ];
  let cumulative = 0;
  return labels.map((label, i) => {
    let amount: number;
    if (i === 0) amount = round1(afiliacion);
    else if (i === labels.length - 1) amount = round1(final ?? total - cumulative);
    else amount = round1(cuota);
    cumulative = round1(cumulative + amount);

    return { label, amount, cumulative };
  });
};
