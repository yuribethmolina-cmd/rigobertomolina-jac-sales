/**
 * Modelo compartido del CRM: unifica en una sola lista los contactos que
 * llegan por el Asesor JAC, las cotizaciones, las solicitudes de crédito y
 * los mensajes del formulario de contacto.
 */

export type CrmSource =
  | "advisor_leads"
  | "quote_requests"
  | "credit_applications"
  | "contact_messages";

export const CRM_SOURCES: CrmSource[] = [
  "advisor_leads",
  "quote_requests",
  "credit_applications",
  "contact_messages",
];

export const SOURCE_LABEL: Record<CrmSource, string> = {
  advisor_leads: "Asesor",
  quote_requests: "Cotización",
  credit_applications: "Crédito",
  contact_messages: "Contacto",
};

/** Estados comerciales que el panel puede asignar a un contacto. */
export const CRM_STATUSES = [
  "nuevo",
  "contactado",
  "vendido",
  "descartado",
] as const;

export type CrmStatus = (typeof CRM_STATUSES)[number];

export const isCrmStatus = (value: string): value is CrmStatus =>
  (CRM_STATUSES as readonly string[]).includes(value);

export interface CrmRecord {
  id: string;
  source: CrmSource;
  sourceLabel: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  model: string | null;
  plan: string | null;
  detail: string | null;
  extra: string | null;
  status: string;
  score: string | null;
  documents: number;
  created_at: string;
}

export interface CrmPayloads {
  advisor_leads: unknown[];
  quote_requests: unknown[];
  credit_applications: unknown[];
  contact_messages: unknown[];
}

const text = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const docCount = (value: unknown): number => {
  if (!Array.isArray(value)) return 0;
  return value.filter((item) => item && typeof item === "object").length;
};

export function toCrmRecords(payloads: CrmPayloads): CrmRecord[] {
  const records: CrmRecord[] = [];

  for (const raw of payloads.advisor_leads) {
    const row = asRecord(raw);
    const parts = [
      text(row.use_case) ? `Uso: ${text(row.use_case)}` : null,
      text(row.purchase_method) ? `Pago: ${text(row.purchase_method)}` : null,
      text(row.initial_budget) ? `Inicial: ${text(row.initial_budget)}` : null,
      text(row.monthly_budget) ? `Cuota: ${text(row.monthly_budget)}` : null,
    ].filter(Boolean);
    records.push({
      id: String(row.id),
      source: "advisor_leads",
      sourceLabel: SOURCE_LABEL.advisor_leads,
      name: text(row.name) ?? "Sin nombre",
      phone: text(row.phone),
      email: null,
      city: text(row.city),
      model: text(row.model_interest),
      plan: text(row.purchase_method),
      detail: text(row.conversation_summary),
      extra: parts.length ? parts.join(" · ") : null,
      status: text(row.status) ?? "nuevo",
      score: text(row.lead_score),
      documents: 0,
      created_at: String(row.created_at ?? ""),
    });
  }

  for (const raw of payloads.quote_requests) {
    const row = asRecord(raw);
    records.push({
      id: String(row.id),
      source: "quote_requests",
      sourceLabel: SOURCE_LABEL.quote_requests,
      name: text(row.full_name) ?? "Sin nombre",
      phone: text(row.phone),
      email: text(row.email),
      city: text(row.city),
      model: text(row.vehicle_name),
      plan: text(row.plan_name),
      detail: text(row.message),
      extra: null,
      status: text(row.status) ?? "nuevo",
      score: null,
      documents: 0,
      created_at: String(row.created_at ?? ""),
    });
  }

  for (const raw of payloads.credit_applications) {
    const row = asRecord(raw);
    const parts = [
      text(row.id_number) ? `C.I. ${text(row.id_number)}` : null,
      text(row.occupation) ? `Ocupación: ${text(row.occupation)}` : null,
      text(row.monthly_income) ? `Ingreso: ${text(row.monthly_income)}` : null,
    ].filter(Boolean);
    records.push({
      id: String(row.id),
      source: "credit_applications",
      sourceLabel: SOURCE_LABEL.credit_applications,
      name: text(row.full_name) ?? "Sin nombre",
      phone: text(row.phone),
      email: text(row.email),
      city: null,
      model: text(row.vehicle_name),
      plan: text(row.plan_name),
      detail: text(row.message),
      extra: parts.length ? parts.join(" · ") : null,
      status: text(row.status) ?? "nuevo",
      score: null,
      documents: docCount(row.documents),
      created_at: String(row.created_at ?? ""),
    });
  }

  for (const raw of payloads.contact_messages) {
    const row = asRecord(raw);
    records.push({
      id: String(row.id),
      source: "contact_messages",
      sourceLabel: SOURCE_LABEL.contact_messages,
      name: text(row.full_name) ?? "Sin nombre",
      phone: text(row.phone),
      email: text(row.email),
      city: null,
      model: null,
      plan: null,
      detail: text(row.message),
      extra: null,
      status: text(row.status) ?? "nuevo",
      score: null,
      documents: 0,
      created_at: String(row.created_at ?? ""),
    });
  }

  return records.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export interface CrmFilters {
  source: CrmSource | "todos";
  status: CrmStatus | "todos";
  query: string;
}

export function filterCrmRecords(
  records: CrmRecord[],
  filters: CrmFilters,
): CrmRecord[] {
  const needle = filters.query.trim().toLowerCase();
  return records.filter((record) => {
    if (filters.source !== "todos" && record.source !== filters.source) {
      return false;
    }
    if (filters.status !== "todos" && record.status !== filters.status) {
      return false;
    }
    if (!needle) return true;
    return [
      record.name,
      record.phone,
      record.email,
      record.city,
      record.model,
      record.plan,
      record.detail,
      record.extra,
    ]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(needle));
  });
}

export function countByStatus(records: CrmRecord[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const status of CRM_STATUSES) counts[status] = 0;
  for (const record of records) {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
  }
  return counts;
}

/** Mensaje de WhatsApp: siempre identifica el modelo del contacto. */
export function crmWhatsAppMessage(record: CrmRecord): string {
  const model = record.model ?? "un modelo JAC";
  const plan = record.plan ? ` por ${record.plan}` : "";
  return `Hola ${record.name}, soy Rigoberto Molina. Sobre el ${model}${plan}: ¿en qué puedo ayudarte?`;
}

export function crmToCsv(records: CrmRecord[]): string {
  const header = [
    "fecha",
    "fuente",
    "nombre",
    "telefono",
    "correo",
    "ciudad",
    "modelo",
    "plan",
    "estado",
    "documentos",
    "nota",
  ];
  const escape = (value: unknown) => {
    const raw = value === null || value === undefined ? "" : String(value);
    return `"${raw.replace(/"/g, '""')}"`;
  };
  const rows = records.map((record) =>
    [
      record.created_at,
      record.sourceLabel,
      record.name,
      record.phone,
      record.email,
      record.city,
      record.model,
      record.plan,
      record.status,
      record.documents,
      record.detail,
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
