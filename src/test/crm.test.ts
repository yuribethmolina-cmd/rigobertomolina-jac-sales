import { describe, expect, it } from "vitest";
import {
  CRM_STATUSES,
  crmToCsv,
  crmWhatsAppMessage,
  filterCrmRecords,
  toCrmRecords,
} from "@/lib/crm";

const payloads = {
  advisor_leads: [
    {
      id: "a1",
      name: "Adrián Silva",
      phone: "04143200146",
      city: "Caracas",
      model_interest: "Arena Sport Manual",
      use_case: "Reparto",
      purchase_method: "Pago Fácil",
      initial_budget: "3000",
      monthly_budget: "250",
      conversation_summary: "Quiere arrancar esta semana",
      lead_score: "hot",
      status: "nuevo",
      created_at: "2026-11-13T10:00:00.000Z",
    },
  ],
  quote_requests: [
    {
      id: "q1",
      full_name: "Yuribeth Molina",
      phone: "04121112233",
      email: "yuribeth@example.com",
      city: "Valencia",
      vehicle_name: "Sunray V6 Motorhome",
      plan_name: "Compra Directa",
      message: "Cotización con envío",
      status: "contactado",
      created_at: "2026-11-12T10:00:00.000Z",
    },
  ],
  credit_applications: [
    {
      id: "c1",
      full_name: "Lourdes Cabello",
      id_number: "V-12345678",
      phone: "04161112233",
      email: null,
      occupation: "Comerciante",
      monthly_income: "900",
      vehicle_name: "Aventura 4x4 Automática",
      plan_id: "fiao",
      plan_name: "Llévatelo de Una",
      message: "Documentos enviados",
      documents: [{ label: "Cédula", path: "a/cedula.jpg" }, { label: "Recibo", path: "a/recibo.jpg" }],
      status: "nuevo",
      created_at: "2026-11-13T14:44:00.000Z",
    },
  ],
  contact_messages: [
    {
      id: "m1",
      full_name: "Pedro Pérez",
      phone: "04241113344",
      email: null,
      message: "¿Tienen el Kamaz disponible?",
      status: "nuevo",
      created_at: "2026-11-11T09:00:00.000Z",
    },
  ],
};

describe("CRM", () => {
  const records = toCrmRecords(payloads);

  it("une las cuatro fuentes en una sola lista, del más nuevo al más viejo", () => {
    expect(records).toHaveLength(4);
    expect(records.map((record) => record.name)).toEqual([
      "Lourdes Cabello",
      "Adrián Silva",
      "Yuribeth Molina",
      "Pedro Pérez",
    ]);
    expect(records.map((record) => record.sourceLabel)).toEqual([
      "Crédito",
      "Asesor",
      "Cotización",
      "Contacto",
    ]);
  });

  it("cuenta los archivos adjuntos de una solicitud de crédito", () => {
    const credit = records.find((record) => record.source === "credit_applications");
    expect(credit?.documents).toBe(2);
  });

  it("solo permite los cuatro estados comerciales", () => {
    expect(CRM_STATUSES).toEqual(["nuevo", "contactado", "vendido", "descartado"]);
  });

  it("filtra por estado y por fuente sin mezclarlas", () => {
    expect(
      filterCrmRecords(records, { source: "todos", status: "nuevo", query: "" }).map(
        (record) => record.name,
      ),
    ).toEqual(["Lourdes Cabello", "Adrián Silva", "Pedro Pérez"]);
    expect(
      filterCrmRecords(records, { source: "quote_requests", status: "todos", query: "" }),
    ).toHaveLength(1);
  });

  it("busca por teléfono, modelo o correo", () => {
    expect(
      filterCrmRecords(records, { source: "todos", status: "todos", query: "04143200146" }),
    ).toHaveLength(1);
    expect(
      filterCrmRecords(records, { source: "todos", status: "todos", query: "motorhome" }),
    ).toHaveLength(1);
  });

  it("escribe el modelo en el mensaje de WhatsApp", () => {
    const lead = records.find((record) => record.source === "advisor_leads");
    const message = crmWhatsAppMessage(lead!);
    expect(message).toContain("Arena Sport Manual");
    expect(message).toContain("Pago Fácil");
  });

  it("exporta un CSV con cabecera y comillas escapadas", () => {
    const csv = crmToCsv(records);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      'fecha,fuente,nombre,telefono,correo,ciudad,modelo,plan,estado,documentos,nota',
    );
    expect(lines).toHaveLength(5);
    expect(csv).toContain('"Cotización con envío"');
  });
});
