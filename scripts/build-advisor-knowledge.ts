/**
 * Genera la base comercial del asesor a partir de la fuente única de verdad
 * (src/data). El resultado se escribe en supabase/functions/asesor/knowledge.ts
 * para que la lógica del chat nunca contenga datos comerciales.
 *
 * Uso: bun run scripts/build-advisor-knowledge.ts
 */
import { writeFileSync } from "node:fs";
import { vehicles } from "../src/data/vehicles";
import { financingOptionsFor } from "../src/data/vehicleFinancing";
import {
  financingPlans,
  requirementsForPlan,
  requiresCreditEvaluation,
  FINANCING_DISCLAIMER,
  DE_UNA_DISCLAIMER,
  APPLICATION_FORM_NOTE,
  REQUIREMENTS_NOTE,
  NOT_VERIFIED_LABEL,
} from "../src/data/financingPlans";

const usd = (n: number) =>
  `US$ ${n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const lines: string[] = [];

lines.push("# PLANES DE FINANCIAMIENTO (estructura oficial)");
for (const plan of financingPlans) {
  const evalCredito = requiresCreditEvaluation(plan.id);
  const tipo =
    evalCredito === null
      ? "por confirmar"
      : evalCredito
        ? "requiere evaluación de crédito"
        : "pago programado, sin evaluación de crédito";
  lines.push(
    `\n## ${plan.name} (id: ${plan.id}) — ${tipo}\n` +
      `Vigencia: ${plan.effectiveDate}. Fuente: ${plan.source} [${plan.sourceStatus}]\n` +
      `${plan.description}\n` +
      (plan.template.length
        ? `Cronograma: ${plan.template.map((s) => `${s.count}x ${s.label}`).join(" | ")}\n`
        : "Sin cronograma publicable.\n") +
      `Recaudos: ${requirementsForPlan(plan.id).join("; ") || "por confirmar con el asesor"}`
  );
}

const planLines = [...lines];

lines.push("\n# MODELOS Y MONTOS POR PLAN");
for (const v of vehicles) {
  const opciones = financingOptionsFor(v.id)
    .filter((o) => o.hasAmounts)
    .map((o) => {
      const etapas = o.schedule
        .filter((s) => s.amount !== null)
        .map((s) => `${s.count}x ${usd(s.amount as number)} (${s.label})`)
        .join(" + ");
      return `  - ${o.plan.name}: ${etapas} [fuente: ${o.amountsSource}]`;
    });
  lines.push(
    `\n## ${v.displayName} — ${v.category}${v.unavailable ? " — NO DISPONIBLE POR LOS MOMENTOS" : ""}\n` +
      `Página: /modelo/${v.id}\n` +
      (v.tagline ? `${v.tagline}\n` : "") +
      (opciones.length
        ? opciones.join("\n")
        : `  - Sin montos documentados: ${NOT_VERIFIED_LABEL}`)
  );
}

lines.push(
  "\n# AVISOS OBLIGATORIOS\n" +
    `- ${FINANCING_DISCLAIMER}\n` +
    `- ${DE_UNA_DISCLAIMER}\n` +
    `- ${APPLICATION_FORM_NOTE}\n` +
    `- ${REQUIREMENTS_NOTE}`
);

lines.push(
  "\n# PÁGINAS DEL SITIO\n" +
    "- /financiamiento: todos los planes y requisitos\n" +
    "- /financiamiento/planes: detalle de cada plan\n" +
    "- /creditos: planes de pago programado, planes de crédito y recaudos por modelo\n" +
    "- /enviar-documentos: envío de la planilla y los recaudos al ejecutivo\n" +
    "- /contacto: correo, WhatsApp y horarios\n" +
    "- /resena: dejar una reseña"
);

const body = lines.join("\n");

/* Secciones sin montos: el asesor arma los montos con las versiones ACTIVAS. */
const tail = lines.slice(-2).join("\n");
const base = `${planLines.join("\n")}\n${tail}`;

const vehicleIndex = vehicles.map((v) => ({
  id: v.id,
  name: v.displayName,
  category: v.category,
  tagline: v.tagline ?? null,
  unavailable: !!v.unavailable,
}));

const planIndex = financingPlans.map((p) => ({ id: p.id, name: p.name }));

writeFileSync(
  new URL("../supabase/functions/asesor/knowledge.ts", import.meta.url),
  `/* GENERADO AUTOMÁTICAMENTE por scripts/build-advisor-knowledge.ts.\n   No editar a mano: los datos comerciales viven en src/data. */\n` +
    `export const KNOWLEDGE = ${JSON.stringify(body)};\n` +
    `export const KNOWLEDGE_BASE = ${JSON.stringify(base)};\n` +
    `export const VEHICLE_INDEX = ${JSON.stringify(vehicleIndex)};\n` +
    `export const PLAN_INDEX = ${JSON.stringify(planIndex)};\n`
);

console.log(`knowledge.ts generado (${body.length} caracteres)`);
