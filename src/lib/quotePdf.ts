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

  let y = 140;

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
  const boxH = lines.length * 14 + 20;
  doc.setDrawColor(220, 227, 235);
  doc.setFillColor(250, 252, 253);
  doc.roundedRect(M, y, W - M * 2, boxH, 6, 6, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(40, 52, 66);
  doc.text(lines, M + 12, y + 20, { lineHeightFactor: 1.33 });
  y += boxH + 18;

  /* Link (salta de página si no cabe sobre el pie) */
  const pageH = doc.internal.pageSize.getHeight();
  if (y > pageH - 72) {
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

/* ── Cotización formal con datos del cliente ── */

export interface QuoteRequestPdfData {
  nombre: string;
  telefono: string;
  email?: string;
  ciudad?: string;
  modelo: string;
  categoria?: string;
  plan: string;
  planDescripcion?: string;
  /** Cronograma [concepto, monto] del plan elegido. */
  cronograma?: [string, string][];
  /** Monto destacado (cuota mensual estimada o total). */
  montoDestacado?: string;
  montoEtiqueta?: string;
  mensaje?: string;
  disclaimer?: string;
}

export const generateQuoteRequestPdf = (d: QuoteRequestPdfData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const CW = W - M * 2;

  const ensure = (needed: number, y: number) => {
    if (y + needed > H - 80) {
      doc.addPage();
      return 80;
    }
    return y;
  };

  /* Header */
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 110, "F");
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("RM", M, 52);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Cotizacion JAC", M + 46, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 195, 210);
  doc.text("Rigoberto Molina - Vendedor independiente en Caracas", M, 76);
  doc.text(`${WHATSAPP_DISPLAY}  |  ${EMAIL}  |  ${INSTAGRAM_HANDLE}`, M, 92);

  let y = 142;

  const sectionTitle = (t: string) => {
    y = ensure(40, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    doc.text(t, M, y);
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(2);
    doc.line(M, y + 6, M + 34, y + 6);
    y += 24;
  };

  const rowList = (rows: [string, string][], highlightLast = false) => {
    rows.forEach(([k, v], i) => {
      y = ensure(32, y);
      const last = highlightLast && i === rows.length - 1;
      if (last) {
        doc.setFillColor(232, 249, 251);
        doc.rect(M, y - 14, CW, 28, "F");
      } else if (i % 2 === 0) {
        doc.setFillColor(244, 247, 250);
        doc.rect(M, y - 14, CW, 28, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...(last ? NAVY : GRAY));
      doc.text(k, M + 12, y + 4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      const value = doc.splitTextToSize(v, CW - 200)[0] as string;
      doc.text(value, W - M - 12, y + 4, { align: "right" });
      y += 28;
    });
    y += 16;
  };

  /* Cliente */
  sectionTitle("Datos del cliente");
  const cliente: [string, string][] = [
    ["Nombre", d.nombre],
    ["Telefono / WhatsApp", d.telefono],
  ];
  if (d.email) cliente.push(["Correo", d.email]);
  if (d.ciudad) cliente.push(["Ciudad", d.ciudad]);
  cliente.push(["Fecha", new Date().toLocaleDateString("es-VE")]);
  rowList(cliente);

  /* Vehiculo y plan */
  sectionTitle("Vehiculo y plan de pago");
  rowList([
    ["Modelo", d.categoria ? `${d.modelo} (${d.categoria})` : d.modelo],
    ["Plan de pago", d.plan],
  ]);

  if (d.planDescripcion) {
    y = ensure(60, y) - 8;
    const dl = doc.splitTextToSize(d.planDescripcion, CW - 24) as string[];
    const bh = dl.length * 13 + 20;
    doc.setDrawColor(220, 227, 235);
    doc.setLineWidth(1);
    doc.setFillColor(250, 252, 253);
    doc.roundedRect(M, y, CW, bh, 6, 6, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 72, 88);
    doc.text(dl, M + 12, y + 18, { lineHeightFactor: 1.3 });
    y += bh + 24;
  }

  /* Monto destacado */
  if (d.montoDestacado) {
    y = ensure(70, y);
    doc.setFillColor(...TEAL);
    doc.roundedRect(M, y, CW, 56, 8, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text((d.montoEtiqueta || "MONTO ESTIMADO").toUpperCase(), M + 16, y + 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(d.montoDestacado, W - M - 16, y + 36, { align: "right" });
    y += 80;
  }

  /* Cronograma */
  if (d.cronograma?.length) {
    sectionTitle("Cronograma de pago");
    rowList(d.cronograma);
  }

  /* Mensaje */
  if (d.mensaje) {
    sectionTitle("Comentarios del cliente");
    const ml = doc.splitTextToSize(d.mensaje, CW - 24) as string[];
    y = ensure(ml.length * 14 + 30, y);
    const bh = ml.length * 14 + 20;
    doc.setDrawColor(220, 227, 235);
    doc.setFillColor(250, 252, 253);
    doc.roundedRect(M, y - 12, CW, bh, 6, 6, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(40, 52, 66);
    doc.text(ml, M + 12, y + 6, { lineHeightFactor: 1.33 });
    y += bh + 12;
  }

  /* Disclaimer + footer en todas las paginas */
  if (d.disclaimer) {
    const dl = doc.splitTextToSize(d.disclaimer, CW) as string[];
    y = ensure(dl.length * 11 + 20, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(dl, M, y + 8, { lineHeightFactor: 1.3 });
  }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(
      `Rigoberto Molina - rigobertomolina.com - ${WHATSAPP_DISPLAY}`,
      M,
      H - 36
    );
    doc.text(`Pagina ${p} de ${pages}`, W - M, H - 36, { align: "right" });
  }

  const slug = `${d.modelo}-${d.nombre}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  doc.save(`cotizacion-${slug}.pdf`);
};
