import { useState, useMemo } from "react";
import { suvModels, pickupModels, commercialModels, truckModels, waLink, type CarModel } from "@/lib/constants";
import { Calculator, ArrowRight, ChevronDown } from "lucide-react";

/* ── Parse "$X.XXX" or "desde $X.XXX/mes" → number ── */
const parsePrice = (s?: string): number | null => {
  if (!s) return null;
  const m = s.replace(/desde\s*/i, "").match(/\$([\d.,]+)/);
  if (!m) return null;
  // Handle "3.018,6" → 3018.6 (Venezuelan/Spanish number format: dot=thousands, comma=decimal)
  const raw = m[1];
  const parts = raw.split(",");
  const intPart = parts[0].replace(/\./g, "");
  const decPart = parts[1] ?? "0";
  return parseFloat(`${intPart}.${decPart}`);
};

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-VE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* ── Build selectable list ── */
interface SimModel {
  name: string;
  category: string;
  cuotaDirecta: number | null;
  cuotaFacil: number | null;
}

const buildList = (): SimModel[] => {
  const cats: [string, CarModel[]][] = [
    ["SUV", suvModels],
    ["Camioneta", pickupModels],
    ["Comercial", commercialModels],
    ["Camión", truckModels],
  ];
  const list: SimModel[] = [];
  for (const [cat, models] of cats) {
    for (const m of models) {
      const directa = parsePrice(m.priceDirecta) ?? parsePrice(m.price);
      const facil = parsePrice(m.priceFacil);
      if (directa || facil) {
        list.push({ name: m.name, category: cat, cuotaDirecta: directa, cuotaFacil: facil });
      }
    }
  }
  return list;
};

const allModels = buildList();

/* ── Schedule builders ── */
type Row = { label: string; amount: number; cumulative: number };

const buildDirecta = (cuota: number): Row[] => {
  const rows: Row[] = [];
  const labels = [
    "Afiliación",
    "Cuota 1", "Cuota 2", "Cuota 3", "Cuota 4", "Cuota 5",
    "Previo a entrega",
  ];
  labels.forEach((label, i) => {
    rows.push({ label, amount: cuota, cumulative: cuota * (i + 1) });
  });
  return rows;
};

const buildFacil = (cuota: number): Row[] => {
  const rows: Row[] = [];
  // Final payment ≈ 2.25× monthly (based on catalog patterns)
  const finalPayment = Math.round(cuota * 2.254 * 10) / 10;
  const labels = [
    "Afiliación",
    ...Array.from({ length: 10 }, (_, i) => `Cuota ${i + 1}`),
    "Última cuota",
  ];
  let cumulative = 0;
  labels.forEach((label, i) => {
    const amount = i < 11 ? cuota : finalPayment;
    cumulative += amount;
    rows.push({ label, amount, cumulative });
  });
  return rows;
};

const PaymentSimulator = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const model = allModels[selectedIdx];

  const directaRows = useMemo(
    () => (model.cuotaDirecta ? buildDirecta(model.cuotaDirecta) : null),
    [model]
  );
  const facilRows = useMemo(
    () => (model.cuotaFacil ? buildFacil(model.cuotaFacil) : null),
    [model]
  );

  return (
    <section id="simulador" className="py-20 bg-secondary/30 section-divider">
      <div className="section-container">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Calculator size={16} /> Herramienta interactiva
          </div>
          <h2 className="section-title">Simulador de pagos</h2>
          <p className="section-subtitle">Selecciona un modelo y visualiza el cronograma completo mes a mes</p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Model selector */}
        <div className="mt-10 max-w-md mx-auto relative">
          <label className="block text-sm font-semibold text-muted-foreground mb-2">Elige tu modelo</label>
          <div className="relative">
            <select
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              className="w-full appearance-none bg-card border-2 border-border rounded-xl px-5 py-3.5 pr-12 font-heading font-bold text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
            >
              {allModels.map((m, i) => (
                <option key={m.name} value={i}>
                  {m.name} — {m.category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
          </div>
        </div>

        {/* Schedules side by side */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {/* Directa */}
          <div className={`rounded-2xl border overflow-hidden ${directaRows ? "border-border" : "border-border/50 opacity-60"}`}>
            <div className="bg-primary text-primary-foreground p-4 text-center">
              <h3 className="font-heading font-bold text-lg">💳 Compra Directa</h3>
              <p className="text-xs text-primary-foreground/70 mt-1">7 pagos iguales</p>
            </div>
            {directaRows ? (
              <div className="divide-y divide-border">
                {directaRows.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-5 py-3 text-sm ${
                      i === 0 || i === directaRows.length - 1 ? "bg-primary/5 font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                      <span>{row.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-heading font-bold">{fmt(row.amount)}</span>
                      <span className="block text-[10px] text-muted-foreground">Acum: {fmt(row.cumulative)}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-4 bg-primary/10">
                  <span className="font-heading font-bold">TOTAL ESTIMADO</span>
                  <span className="font-heading font-bold text-lg text-primary">
                    {fmt(directaRows[directaRows.length - 1].cumulative)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Precio de Compra Directa no disponible para este modelo.
                <br />Consultar por WhatsApp.
              </div>
            )}
          </div>

          {/* Fácil */}
          <div className={`rounded-2xl border overflow-hidden ${facilRows ? "border-border" : "border-border/50 opacity-60"}`}>
            <div className="bg-primary text-primary-foreground p-4 text-center">
              <h3 className="font-heading font-bold text-lg">📅 Pago Fácil</h3>
              <p className="text-xs text-primary-foreground/70 mt-1">12 pagos · cuotas más bajas</p>
            </div>
            {facilRows ? (
              <div className="divide-y divide-border">
                {facilRows.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-5 py-3 text-sm ${
                      i === 0 || i === facilRows.length - 1 ? "bg-primary/5 font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                      <span>{row.label}</span>
                      {i === facilRows.length - 1 && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Mayor</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-heading font-bold">{fmt(row.amount)}</span>
                      <span className="block text-[10px] text-muted-foreground">Acum: {fmt(row.cumulative)}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-4 bg-primary/10">
                  <span className="font-heading font-bold">TOTAL ESTIMADO</span>
                  <span className="font-heading font-bold text-lg text-primary">
                    {fmt(facilRows[facilRows.length - 1].cumulative)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Precio de Pago Fácil no disponible para este modelo.
                <br />Consultar por WhatsApp.
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            ¿Te interesa el <strong>{model.name}</strong>? Pide tu cronograma actualizado.
          </p>
          <a
            href={waLink(`Hola Rigoberto, acabo de ver el simulador de pagos del ${model.name}. ¿Me puedes enviar el cronograma actualizado?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-heading font-bold text-lg hover:bg-primary/90 transition-colors"
          >
            Pedir cronograma por WhatsApp <ArrowRight size={18} />
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          ⚠ Montos referenciales Feb 2026 · Sujetos a cambio · La última cuota de Pago Fácil es estimada
        </p>
      </div>
    </section>
  );
};

export default PaymentSimulator;
