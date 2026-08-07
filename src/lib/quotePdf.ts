import { jsPDF } from "jspdf";
import { WHATSAPP_DISPLAY, EMAIL, INSTAGRAM_HANDLE } from "@/lib/constants";

export interface QuoteData {
  modelo: string;
  categoria: string;
  plan: string;
  planDetalle: string;
  cuota: string;
  nombre?: string;
  /* Filas [concepto, monto] del desglose estimado */
  desglose?: [string, string][];
  mensaje: string;
  waUrl: string;
}

const TEAL: [number, number, number] = [0, 181, 200];
const NAVY: [number, number, number] = [15, 27, 43];
const GRAY: [number, number, number] = [110, 122, 138];

export const generateQuotePdf = (d: QuoteData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;

  /* Header */
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 110, "F");
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("RM", M, 52);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Cotizacion rapida JAC", M + 46, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 195, 210);
  doc.text("Rigoberto Molina - Vendedor independiente en Caracas", M, 76);
  doc.text(
    `${WHATSAPP_DISPLAY}  |  ${EMAIL}  |  ${INSTAGRAM_HANDLE}`,
    M,
    92
  );

  let y = 150;

  if (d.nombre) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(11);
    doc.text(`Preparada para: ${d.nombre}`, M, y);
    y += 26;
  }

  /* Detail rows */
  const rows: [string, string][] = [
    ["Modelo", `${d.modelo} (${d.categoria})`],
    ["Plan de pago", `${d.plan} - ${d.planDetalle}`],
    ["Cuota estimada", d.cuota],
  ];

  rows.forEach(([k, v], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(244, 247, 250);
      doc.rect(M, y - 14, W - M * 2, 30, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...GRAY);
    doc.text(k, M + 12, y + 5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(v, W - M - 12, y + 5, { align: "right" });
    y += 30;
  });

  /* Highlighted cuota */
  y += 22;
  doc.setFillColor(...TEAL);
  doc.roundedRect(M, y, W - M * 2, 56, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("CUOTA MENSUAL ESTIMADA", M + 16, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(d.cuota, W - M - 16, y + 34, { align: "right" });

  y += 78;

  /* Desglose */
  if (d.desglose?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text("Desglose estimado", M, y);
    y += 16;
    d.desglose.forEach(([k, v], i) => {
      const last = i === d.desglose!.length - 1;
      if (last) {
        doc.setFillColor(232, 249, 251);
        doc.rect(M, y - 13, W - M * 2, 26, "F");
      } else if (i % 2 === 0) {
        doc.setFillColor(244, 247, 250);
        doc.rect(M, y - 13, W - M * 2, 26, "F");
      }
      doc.setFont("helvetica", last ? "bold" : "normal");
      doc.setFontSize(11);
      doc.setTextColor(...(last ? NAVY : GRAY));
      doc.text(k, M + 12, y + 5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text(v, W - M - 12, y + 4, { align: "right" });
      y += 26;
    });
    y += 14;
  }

  /* WhatsApp message */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Mensaje listo para WhatsApp", M, y);
  y += 14;

  const lines = doc.splitTextToSize(d.mensaje, W - M * 2 - 24) as string[];
  const boxH = lines.length * 15 + 24;
  doc.setDrawColor(220, 227, 235);
  doc.setFillColor(250, 252, 253);
  doc.roundedRect(M, y, W - M * 2, boxH, 6, 6, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(40, 52, 66);
  doc.text(lines, M + 12, y + 22);
  y += boxH + 20;

  /* Link (salta de página si no cabe sobre el pie) */
  const pageH = doc.internal.pageSize.getHeight();
  if (y > pageH - 90) {
    doc.addPage();
    y = 90;
  }
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.textWithLink("Abrir chat de WhatsApp con este mensaje", M, y, {
    url: d.waUrl,
  });

  /* Footer */
  const H = pageH;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    "Montos referenciales Agosto 2026. Sujetos a variacion sin previo aviso.",
    M,
    H - 54
  );
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-VE")} - rigobertomolina.com`,
    M,
    H - 38
  );

  const slug = d.modelo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`cotizacion-jac-${slug}.pdf`);
};
