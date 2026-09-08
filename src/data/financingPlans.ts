/* ══════════════════════════════════════════════════════════════
   FUENTE ÚNICA DE VERDAD — PLANES DE FINANCIAMIENTO
   ══════════════════════════════════════════════════════════════
   Reglas:
   - Ningún componente puede definir estructuras ni montos por su cuenta.
   - Un monto solo se publica si se puede trazar a un catálogo fuente.
   - Los planes sin documento vigente quedan en REVIEW_NOT_VERIFIED.
   ══════════════════════════════════════════════════════════════ */

export type SourceStatus =
  | "VERIFIED_17_AUG"
  | "VERIFIED_04_SEP"
  | "VERIFIED_PROMO_SEP"
  | "REVIEW_NOT_VERIFIED";

export type StageType =
  | "SIGNATURE"      // pago a la firma del contrato
  | "INITIAL"        // pagos que componen la inicial
  | "PRE_DELIVERY"   // cuota especial previa a la entrega
  | "ORDINARY"       // cuotas ordinarias mensuales
  | "FIXED"          // cuotas fijas mensuales
  | "SPECIAL";       // cuotas especiales en meses puntuales

export interface PaymentStage {
  type: StageType;
  /** Cantidad de pagos de esta etapa. */
  count: number;
  /** Monto por pago en USD. `null` = no verificado con el documento vigente. */
  amount: number | null;
  /** Meses puntuales cuando aplica (cuotas especiales). */
  months?: number[];
  label: string;
}

export type StageTemplate = Omit<PaymentStage, "amount">;

export interface FinancingPlan {
  id: string;
  name: string;
  effectiveDate: string;
  source: string;
  sourceStatus: SourceStatus;
  description: string;
  /** Estructura oficial del plan, en orden cronológico. */
  template: StageTemplate[];
}

/* Disclaimer comercial obligatorio, visible (nunca dentro de un tooltip). */
export const FINANCING_DISCLAIMER =
  "Los montos indicados en el cronograma de pago son referenciales ya que están sujetos a variación de sus valores como flete, seguro, impuesto al valor agregado (IVA), IGTF y gastos de Nacionalización, los cuales pueden variar en el proceso de compra de las unidades.";

export const NOT_VERIFIED_LABEL = "Consultar disponibilidad y condiciones";

/* ── Requisitos por tipo de plan ── */

/** Planes de pago programado sin evaluación crediticia. */
export const DIRECT_PLAN_REQUIREMENTS = [
  "Cédula de identidad vigente del comprador",
  "RIF vigente (persona natural o jurídica)",
  "Correo electrónico y número de teléfono de contacto",
  "Pago inicial según el cronograma del plan",
  "Firma del contrato de compra",
];

/** Planes con evaluación de crédito (CrediJAC y similares). */
export const CREDIT_PLAN_REQUIREMENTS = [
  "Cédula de identidad vigente",
  "RIF vigente",
  "Recibo de servicio público (dirección de habitación)",
  "Balance personal firmado por contador público",
  "Referencia bancaria",
  "Últimos 3 estados de cuenta bancarios",
  "2 referencias personales",
  "Constancia de trabajo o certificación de ingresos",
];

export const REQUIREMENTS_NOTE =
  "Recaudos referenciales. El asesor puede solicitar documentos adicionales según el plan y las condiciones vigentes.";

const CREDIT_PLAN_IDS = [
  "facilito",
  "llevatelo-fiao",
  "credijac-35x35",
  "credijac-ruta-48",
  "crediexpress",
];

/** Planes sin confirmación oficial sobre evaluación de crédito ni recaudos. */
const PENDING_REQUIREMENTS_PLAN_IDS = ["llevatelo-de-una"];

export const PENDING_REQUIREMENTS_NOTE =
  "Requisitos, aprobación y condiciones sujetos a validación con el asesor.";

export const requirementsStatusForPlan = (planId: string): "Por confirmar" | null =>
  PENDING_REQUIREMENTS_PLAN_IDS.includes(planId) ? "Por confirmar" : null;

export const requirementsForPlan = (planId: string): string[] => {
  if (PENDING_REQUIREMENTS_PLAN_IDS.includes(planId)) return [];
  return CREDIT_PLAN_IDS.includes(planId) ? CREDIT_PLAN_REQUIREMENTS : DIRECT_PLAN_REQUIREMENTS;
};

/** `null` = sin confirmación oficial: no afirmar ni negar evaluación de crédito. */
export const requiresCreditEvaluation = (planId: string): boolean | null =>
  PENDING_REQUIREMENTS_PLAN_IDS.includes(planId) ? null : CREDIT_PLAN_IDS.includes(planId);

/** Aviso comercial de la promoción Llévatelo de Una, visible en todos los modelos. */
export const DE_UNA_DISCLAIMER =
  "Montos referenciales, sujetos a cambios y disponibilidad. Confirma requisitos, impuestos, seguro, placa y condiciones directamente con Rigoberto Molina.";

/* ── Planes vigentes: Compra Directa y Pago Fácil (04 sep) y catálogos del 17 de agosto ── */
export const financingPlans: FinancingPlan[] = [
  {
    id: "compra-directa",
    name: "Compra Directa",
    effectiveDate: "04 de septiembre",
    source: "COMPRA DIRECTA — 04 DE SEPTIEMBRE",
    sourceStatus: "VERIFIED_04_SEP",
    description:
      "Pago a la firma del contrato, 5 cuotas mensuales y consecutivas y un pago previo a la entrega.",
    template: [
      { type: "SIGNATURE", count: 1, label: "Pago a la firma del contrato" },
      { type: "ORDINARY", count: 5, label: "5 cuotas mensuales y consecutivas" },
      { type: "PRE_DELIVERY", count: 1, label: "Pago previo a la entrega" },
    ],
  },
  {
    id: "pago-facil",
    name: "Pago Fácil",
    effectiveDate: "04 de septiembre",
    source: "PAGO FÁCIL — 04 DE SEPTIEMBRE",
    sourceStatus: "VERIFIED_04_SEP",
    description:
      "US$ 999,90 a la firma del contrato, 12 cuotas consecutivas y mensuales y un pago adicional previo a la entrega.",
    template: [
      { type: "SIGNATURE", count: 1, label: "Pago a la firma del contrato" },
      { type: "ORDINARY", count: 12, label: "12 cuotas consecutivas y mensuales" },
      { type: "PRE_DELIVERY", count: 1, label: "Pago previo a la entrega" },
    ],
  },
  {
    id: "facilito",
    name: "Facilito de JAC",
    effectiveDate: "2026-08-17",
    source: "FACILITO DE JAC 17 DE AGOSTO",
    sourceStatus: "VERIFIED_17_AUG",
    description:
      "Pago a la firma, 6 pagos mensuales, cuota especial previa a la entrega y 20 cuotas fijas mensuales.",
    template: [
      { type: "SIGNATURE", count: 1, label: "Pago a la firma del contrato" },
      { type: "INITIAL", count: 6, label: "Pagos mensuales de inicial" },
      { type: "PRE_DELIVERY", count: 1, label: "Cuota especial previa a la entrega" },
      { type: "FIXED", count: 20, label: "Cuotas fijas mensuales" },
    ],
  },
  {
    id: "llevatelo-fiao",
    name: "Llévatelo Fiao",
    effectiveDate: "2026-08-17",
    source: "LLÉVATELO FIAO 17 DE AGOSTO",
    sourceStatus: "VERIFIED_17_AUG",
    description:
      "Pago a la firma, 5 pagos adicionales para completar una inicial del 30%, cuota especial previa a la entrega y 15 cuotas ordinarias mensuales.",
    template: [
      { type: "SIGNATURE", count: 1, label: "Pago a la firma del contrato" },
      { type: "INITIAL", count: 5, label: "Pagos para completar la inicial del 30%" },
      { type: "PRE_DELIVERY", count: 1, label: "Cuota especial previa a la entrega" },
      { type: "ORDINARY", count: 15, label: "Cuotas ordinarias mensuales" },
    ],
  },
  {
    id: "credijac-35x35",
    name: "CrediJAC 35x35",
    effectiveDate: "2026-08-17",
    source: "CREDIJAC 35X35 17 DE AGOSTO",
    sourceStatus: "VERIFIED_17_AUG",
    description:
      "6 cuotas correspondientes a la inicial del 35%, cuota especial previa a la entrega, 30 cuotas ordinarias mensuales y 6 cuotas especiales adicionales.",
    template: [
      { type: "INITIAL", count: 6, label: "Cuotas de inicial (35%)" },
      { type: "PRE_DELIVERY", count: 1, label: "Cuota especial previa a la entrega" },
      { type: "ORDINARY", count: 30, label: "Cuotas ordinarias mensuales" },
      {
        type: "SPECIAL",
        count: 6,
        months: [9, 12, 15, 18, 21, 24],
        label: "Cuotas especiales (meses 9, 12, 15, 18, 21 y 24)",
      },
    ],
  },
  {
    id: "credijac-ruta-48",
    name: "CrediJAC Ruta 48",
    effectiveDate: "2026-08-17",
    source: "CREDIJAC RUTA 48 17 DE AGOSTO",
    sourceStatus: "VERIFIED_17_AUG",
    description:
      "Pago 1 con la firma del contrato, 15 pagos adicionales de inicial, cuota especial previa a la entrega y 32 pagos fijos mensuales.",
    template: [
      { type: "SIGNATURE", count: 1, label: "Pago 1 con la firma del contrato" },
      { type: "INITIAL", count: 15, label: "Pagos adicionales de inicial" },
      { type: "PRE_DELIVERY", count: 1, label: "Cuota especial previa a la entrega" },
      { type: "FIXED", count: 32, label: "Pagos fijos mensuales" },
    ],
  },
  {
    id: "crediexpress",
    name: "CrediExpress de JAC",
    effectiveDate: "2026-08-17",
    source: "CREDIEXPRESS DE JAC 17 DE AGOSTO",
    sourceStatus: "VERIFIED_17_AUG",
    description:
      "3 pagos de inicial fraccionada, cuota especial previa a la entrega y 6 cuotas ordinarias mensuales.",
    template: [
      { type: "INITIAL", count: 3, label: "Pagos de inicial fraccionada" },
      { type: "PRE_DELIVERY", count: 1, label: "Cuota especial previa a la entrega" },
      { type: "ORDINARY", count: 6, label: "Cuotas ordinarias mensuales" },
    ],
  },

  {
    id: "llevatelo-de-una",
    name: "Llévatelo de Una",
    effectiveDate: "08 de septiembre",
    source: "PROMOCIÓN LLÉVATELO DE UNA — 08 DE SEPTIEMBRE",
    sourceStatus: "VERIFIED_PROMO_SEP",
    description:
      "Pagas la primera cuota y te llevas el vehículo, sujeto a confirmación y disponibilidad. Completas la inicial con 2 cuotas adicionales del mismo monto y el saldo restante se paga en 27 cuotas mensuales.",
    template: [
      { type: "SIGNATURE", count: 1, label: "Primera cuota: te llevas el vehículo" },
      { type: "INITIAL", count: 2, label: "Cuotas adicionales del mismo monto para completar la inicial" },
      { type: "FIXED", count: 27, label: "Cuotas mensuales del saldo restante" },
    ],
  },

  /* ── Planes existentes SIN documento vigente ──
     No se eliminan, no se mezclan con los verificados. ── */
  {
    id: "credito-bel",
    name: "Crédito Bel",
    effectiveDate: "—",
    source: "Sin documento vigente",
    sourceStatus: "REVIEW_NOT_VERIFIED",
    description: "Plan existente sin documentación vigente que permita publicar su cronograma.",
    template: [],
  },
  {
    id: "travesia",
    name: "Travesía",
    effectiveDate: "—",
    source: "Sin documento vigente",
    sourceStatus: "REVIEW_NOT_VERIFIED",
    description: "Plan existente sin documentación vigente que permita publicar su cronograma.",
    template: [],
  },
  {
    id: "travesia-3-pagos",
    name: "Travesía 3 Pagos",
    effectiveDate: "—",
    source: "Sin documento vigente",
    sourceStatus: "REVIEW_NOT_VERIFIED",
    description: "Plan existente sin documentación vigente que permita publicar su cronograma.",
    template: [],
  },
];

export const VERIFIED_PLAN_IDS = financingPlans
  .filter((p) => p.sourceStatus !== "REVIEW_NOT_VERIFIED")
  .map((p) => p.id);

export const getPlan = (id: string) => financingPlans.find((p) => p.id === id);

export const fmtUsd = (n: number) =>
  "US$ " + n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtUsd0 = (n: number) =>
  "US$ " + n.toLocaleString("es-VE", { maximumFractionDigits: 0 });
