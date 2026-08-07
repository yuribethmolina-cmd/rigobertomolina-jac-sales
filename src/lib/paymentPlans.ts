/* Fuente única de verdad para el simulador de pagos y la tabla comparativa.
   Montos referenciales Agosto 2026. */

export interface PlanModel {
  modelo: string;
  featured?: boolean;
  /* Compra Directa: 7 pagos iguales */
  cuotaDirecta: number | null;
  totalDirecta: number | null;
  /* Pago Fácil: afiliación + 12 cuotas + última cuota mayor */
  cuotaFacil: number | null;
  totalFacil: number | null;
}

export const planModels: PlanModel[] = [
  {
    modelo: "Arena Sport MT",
    cuotaDirecta: 2568,
    totalDirecta: 17978,
    cuotaFacil: 1242,
    totalFacil: 18840,
  },
  {
    modelo: "Arena Sport AT",
    cuotaDirecta: 2775,
    totalDirecta: 19427,
    cuotaFacil: 1351,
    totalFacil: 20360,
  },
  {
    modelo: "Nevado MT",
    featured: true,
    cuotaDirecta: 3352,
    totalDirecta: 23461,
    cuotaFacil: 1655,
    totalFacil: 24592,
  },
  {
    modelo: "La Venezolana 4x2",
    cuotaDirecta: 3267,
    totalDirecta: 22874,
    cuotaFacil: null,
    totalFacil: null,
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

/* Pago Fácil: afiliación + 12 cuotas mensuales + última cuota mayor.
   La última cuota se ajusta para que el total coincida con la tabla comparativa. */
export const buildFacilSchedule = (cuota: number, total: number): ScheduleRow[] => {
  const labels = [
    "Afiliación",
    ...Array.from({ length: 12 }, (_, i) => `Cuota ${i + 1}`),
    "Última cuota",
  ];
  const afiliacion = round1(cuota * 0.604);
  let cumulative = 0;
  return labels.map((label, i) => {
    let amount: number;
    if (i === 0) amount = afiliacion;
    else if (i === labels.length - 1) amount = round1(total - cumulative);
    else amount = round1(cuota);
    cumulative = round1(cumulative + amount);
    return { label, amount, cumulative };
  });
};
