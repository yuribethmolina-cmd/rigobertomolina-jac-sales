/* ══════════════════════════════════════════════════════════════
   FUENTE ÚNICA DE VERDAD — PLANES DE FINANCIAMIENTO
   ══════════════════════════════════════════════════════════════
   Reglas:
   - Ningún componente puede definir estructuras ni montos por su cuenta.
   - Un monto solo se publica si se puede trazar a un catálogo fuente.
   - Los planes sin documento vigente quedan en REVIEW_NOT_VERIFIED.
   ══════════════════════════════════════════════════════════════ */

export type SourceStatus = "VERIFIED_17_AUG" | "REVIEW_NOT_VERIFIED";

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

/* ── 6 planes verificados con los documentos del 17 de agosto ── */
export const financingPlans: FinancingPlan[] = [
  {
    id: "pago-facil",
    name: "Pago Fácil",
    effectiveDate: "2026-08-17",
    source: "PAGO FÁCIL 17 DE AGOSTO",
    sourceStatus: "VERIFIED_17_AUG",
    description:
      "US$ 999,90 a la firma del contrato, 12 cuotas consecutivas y mensuales y un pago adicional previo a la entrega.",
    template: [
      { type: "SIGNATURE", count: 1, label: "Pago a la firma del contrato" },
      { type: "ORDINARY", count: 12, label: "Cuotas consecutivas y mensuales" },
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

  /* ── Planes existentes SIN documento del 17 de agosto ──
     No se eliminan, no se mezclan con los verificados. ── */
  {
    id: "compra-directa",
    name: "Compra Directa",
    effectiveDate: "2026-08-17",
    source: "CATÁLOGO COMPRA DIRECTA 17 DE AGOSTO (pendiente de revalidación)",
    sourceStatus: "REVIEW_NOT_VERIFIED",
    description:
      "Pago a la firma, 5 cuotas mensuales y un pago previo a la entrega. Estructura pendiente de revalidación con documento vigente.",
    template: [
      { type: "SIGNATURE", count: 1, label: "Afiliación / pago a la firma" },
      { type: "ORDINARY", count: 5, label: "Cuotas mensuales" },
      { type: "PRE_DELIVERY", count: 1, label: "Pago previo a la entrega" },
    ],
  },
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
  .filter((p) => p.sourceStatus === "VERIFIED_17_AUG")
  .map((p) => p.id);

export const getPlan = (id: string) => financingPlans.find((p) => p.id === id);

export const fmtUsd = (n: number) =>
  "US$ " + n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtUsd0 = (n: number) =>
  "US$ " + n.toLocaleString("es-VE", { maximumFractionDigits: 0 });
