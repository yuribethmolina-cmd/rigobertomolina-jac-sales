import { jsPDF } from "jspdf";
import { WHATSAPP_DISPLAY, EMAIL } from "@/lib/constants";

const TEAL: [number, number, number] = [0, 181, 200];
const NAVY: [number, number, number] = [15, 27, 43];
const GRAY: [number, number, number] = [110, 122, 138];

interface FormOptions {
  modelo?: string;
  plan?: string;
}

/** Planilla imprimible que el cliente llena a mano y envía junto con sus recaudos. */
export const generateApplicationFormPdf = ({ modelo, plan }: FormOptions = {}) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;

  const header = () => {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, W, 96, "F");
    doc.setTextColor(...TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("RM", M, 48);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text("Planilla de solicitud de financiamiento JAC", M + 44, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(180, 195, 210);
    doc.text(
      `Rigoberto Molina - Vendedor independiente - WhatsApp ${WHATSAPP_DISPLAY} - ${EMAIL}`,
      M,
      72,
    );
    y = 128;
  };

  const sectionTitle = (t: string) => {
    if (y > H - 120) {
      doc.addPage();
      header();
    }
    doc.setFillColor(...TEAL);
    doc.rect(M, y - 12, 4, 14, "F");
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.text(t.toUpperCase(), M + 12, y);
    y += 18;
  };

  const field = (label: string, cols = 1, colIndex = 0) => {
    const usable = W - M * 2;
    const gap = 14;
    const w = (usable - gap * (cols - 1)) / cols;
    const x = M + colIndex * (w + gap);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(label, x, y);
    doc.setDrawColor(200, 208, 218);
    doc.line(x, y + 16, x + w, y + 16);
    if (colIndex === cols - 1) y += 36;
  };

  const checkline = (label: string) => {
    if (y > H - 70) {
      doc.addPage();
      header();
    }
    doc.setDrawColor(150, 160, 172);
    doc.rect(M, y - 8, 10, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(40, 50, 62);
    doc.text(label, M + 18, y);
    y += 18;
  };

  header();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...GRAY);
  doc.text(
    doc.splitTextToSize(
      "Completa esta planilla, firmala y enviala junto con tus recaudos por el formulario en linea (rigobertomolina.com/enviar-documentos), por correo o por WhatsApp.",
      W - M * 2,
    ),
    M,
    y - 18,
  );
  y += 18;

  sectionTitle("Vehiculo y plan de interes");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  if (modelo) {
    doc.text(`Modelo: ${modelo}`, M, y);
    y += 16;
  }
  if (plan) {
    doc.text(`Plan: ${plan}`, M, y);
    y += 16;
  }
  if (!modelo) field("Modelo de interes", 2, 0);
  if (!plan) field("Plan de financiamiento", 2, modelo ? 0 : 1);
  if ((!modelo && plan) || (modelo && !plan)) y += 36;

  sectionTitle("Datos personales");
  field("Nombre y apellido", 2, 0);
  field("Cedula / RIF", 2, 1);
  field("Fecha de nacimiento", 2, 0);
  field("Estado civil", 2, 1);
  field("Telefono", 2, 0);
  field("Correo electronico", 2, 1);
  field("Direccion de habitacion", 1, 0);
  field("Ciudad / Estado", 2, 0);
  field("Anos viviendo en la direccion", 2, 1);

  sectionTitle("Datos laborales / ingresos");
  field("Empresa o negocio propio", 2, 0);
  field("Cargo u ocupacion", 2, 1);
  field("Antiguedad", 2, 0);
  field("Ingreso mensual (USD)", 2, 1);
  field("Telefono de la empresa", 2, 0);
  field("Otros ingresos (detalle)", 2, 1);

  sectionTitle("Referencias");
  field("Referencia bancaria (banco y cuenta)", 1, 0);
  field("Referencia personal 1 - nombre y telefono", 1, 0);
  field("Referencia personal 2 - nombre y telefono", 1, 0);

  sectionTitle("Recaudos que anexo");
  [
    "Cedula de identidad (ampliada)",
    "RIF vigente",
    "Recibo de servicio publico",
    "Balance personal firmado por contador",
    "Referencia bancaria",
    "Estados de cuenta (ultimos 3 meses)",
    "Referencias personales",
    "Constancia de trabajo o ingresos",
  ].forEach(checkline);

  y += 10;
  if (y > H - 120) {
    doc.addPage();
    header();
  }
  sectionTitle("Declaracion y firma");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    doc.splitTextToSize(
      "Declaro que la informacion suministrada es veraz y autorizo su verificacion para fines de evaluacion del financiamiento. Montos, requisitos y aprobacion estan sujetos a validacion y disponibilidad.",
      W - M * 2,
    ),
    M,
    y,
  );
  y += 46;
  field("Firma", 2, 0);
  field("Fecha", 2, 1);

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(
    `Enviar a: ${EMAIL}  |  WhatsApp ${WHATSAPP_DISPLAY}`,
    M,
    H - 30,
  );

  doc.save("Planilla-solicitud-financiamiento-JAC.pdf");
};
