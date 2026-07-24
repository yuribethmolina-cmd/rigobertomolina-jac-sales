import { useMemo, useState } from "react";
import {
  suvModels,
  pickupModels,
  commercialModels,
  truckModels,
  waLink,
  type CarModel,
} from "@/lib/constants";
import {
  Wand2,
  ArrowRight,
  ArrowLeft,
  Check,
  Car,
  CreditCard,
  Wallet,
  ClipboardList,
} from "lucide-react";
import CopyableMessage from "./CopyableMessage";

/* ── Parse "$X.XXX,X" or "desde $X.XXX/mes" → number (VE format) ── */
const parsePrice = (s?: string): number | null => {
  if (!s) return null;
  const m = s.replace(/desde\s*/i, "").match(/\$([\d.,]+)/);
  if (!m) return null;
  const parts = m[1].split(",");
  const intPart = parts[0].replace(/\./g, "");
  const decPart = parts[1] ?? "0";
  const n = parseFloat(`${intPart}.${decPart}`);
  return isNaN(n) ? null : n;
};

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

/* ── Flatten model catalog ── */
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
const categories = ["SUV", "Camioneta", "Comercial", "Camión"] as const;

type PlanKey = "directa" | "facil";

const steps = [
  { key: "modelo", label: "Modelo", icon: Car },
  { key: "plan", label: "Plan", icon: CreditCard },
  { key: "inicial", label: "Inicial", icon: Wallet },
  { key: "resumen", label: "Resumen", icon: ClipboardList },
] as const;

const GuidedSimulator = () => {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<(typeof categories)[number]>("SUV");
  const [modelName, setModelName] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanKey | null>(null);
  const [inicialPct, setInicialPct] = useState(20);

  const filteredModels = useMemo(
    () => allModels.filter((m) => m.category === category),
    [category]
  );

  const model = useMemo(
    () => allModels.find((m) => m.name === modelName) ?? null,
    [modelName]
  );

  const cuota = useMemo(() => {
    if (!model || !plan) return null;
    return plan === "directa" ? model.cuotaDirecta : model.cuotaFacil;
  }, [model, plan]);

  /* Estimated totals (referential):
     Compra Directa = 7 pagos iguales
     Pago Fácil     = 11 cuotas iguales + 1 última ≈ 2.254× */
  const totales = useMemo(() => {
    if (!cuota || !plan) return null;
    if (plan === "directa") {
      const total = cuota * 7;
      const inicial = Math.round((total * inicialPct) / 100);
      return { total, inicial, pagos: 7, ultima: null as number | null };
    }
    const ultima = Math.round(cuota * 2.254 * 10) / 10;
    const total = cuota * 11 + ultima;
    const inicial = Math.round((total * inicialPct) / 100);
    return { total, inicial, pagos: 12, ultima };
  }, [cuota, plan, inicialPct]);

  /* Amortization schedule (per-cuota breakdown with running total) */
  type ScheduleRow = { label: string; amount: number; cumulative: number; highlight?: boolean };
  const schedule = useMemo<ScheduleRow[] | null>(() => {
    if (!cuota || !plan || !totales) return null;
    const rows: ScheduleRow[] = [];
    let cum = 0;
    if (totales.inicial > 0) {
      cum += totales.inicial;
      rows.push({ label: `Inicial (${inicialPct}%)`, amount: totales.inicial, cumulative: cum, highlight: true });
    }
    if (plan === "directa") {
      const labels = ["Afiliación", "Cuota 1", "Cuota 2", "Cuota 3", "Cuota 4", "Cuota 5", "Previo a entrega"];
      labels.forEach((label) => {
        cum += cuota;
        rows.push({ label, amount: cuota, cumulative: cum });
      });
    } else {
      rows.push({ label: "Afiliación", amount: cuota, cumulative: (cum += cuota) });
      for (let i = 1; i <= 10; i++) {
        cum += cuota;
        rows.push({ label: `Cuota ${i}`, amount: cuota, cumulative: cum });
      }
      const ultima = totales.ultima ?? cuota;
      cum += ultima;
      rows.push({ label: "Última cuota", amount: ultima, cumulative: cum, highlight: true });
    }
    return rows;
  }, [cuota, plan, totales, inicialPct]);

  const canNext =
    (step === 0 && !!modelName) ||
    (step === 1 && !!plan) ||
    step === 2 ||
    step === 3;

  const reset = () => {
    setStep(0);
    setModelName(null);
    setPlan(null);
    setInicialPct(20);
  };

  const waMessage = useMemo(() => {
    if (!model || !plan || !totales) return "";
    const planName = plan === "directa" ? "Compra Directa" : "Pago Fácil";
    const lines = [
      `Hola Rigoberto, usé el simulador guiado y quiero avanzar con esta configuración:`,
      ``,
      `Modelo: ${model.name} (${model.category})`,
      `Plan: ${planName}`,
      `Cuota mensual estimada: ${fmt(cuota!)}`,
      `Inicial deseada: ${inicialPct}% (${fmt(totales.inicial)})`,
      `Total estimado del plan: ${fmt(totales.total)}`,
      plan === "facil" && totales.ultima
        ? `Última cuota estimada: ${fmt(totales.ultima)}`
        : "",
      ``,
      `¿Me confirmas disponibilidad y el cronograma actualizado?`,
    ].filter(Boolean);
    return lines.join("\n");
  }, [model, plan, cuota, inicialPct, totales]);

  return (
    <section id="simulador-guiado" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Wand2 size={16} /> Simulador guiado paso a paso
          </div>
          <h2 className="section-title">Arma tu plan en 4 pasos</h2>
          <p className="section-subtitle">
            Elige modelo, plan e inicial. Verás el total estimado antes de contactar por WhatsApp.
          </p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Stepper */}
        <div className="mt-10 max-w-3xl mx-auto">
          <ol className="flex items-center justify-between gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.key} className="flex-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => i <= step && setStep(i)}
                    disabled={i > step}
                    className={`flex flex-col items-center gap-1 flex-1 group ${
                      i > step ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full grid place-items-center border-2 transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : done
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {done ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span
                      className={`text-xs font-heading font-bold ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-border"}`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Panel */}
        <div className="mt-8 max-w-3xl mx-auto card-glow p-6 md:p-8">
          {/* STEP 0: MODEL */}
          {step === 0 && (
            <div>
              <h3 className="font-heading text-xl font-bold mb-1">Paso 1 — Elige tu modelo</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Filtra por categoría y selecciona el vehículo que te interesa.
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                      category === c
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredModels.map((m) => {
                  const selected = modelName === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setModelName(m.name)}
                      className={`text-left p-4 rounded-xl border-2 transition-colors ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-heading font-bold text-sm">{m.name}</span>
                        {selected && <Check size={16} className="text-primary shrink-0" />}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                        {m.cuotaDirecta && <div>CD: {fmt(m.cuotaDirecta)}/mes</div>}
                        {m.cuotaFacil && <div>PF: {fmt(m.cuotaFacil)}/mes</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1: PLAN */}
          {step === 1 && model && (
            <div>
              <h3 className="font-heading text-xl font-bold mb-1">Paso 2 — Elige el plan</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Modelo seleccionado: <strong className="text-foreground">{model.name}</strong>
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={!model.cuotaDirecta}
                  onClick={() => setPlan("directa")}
                  className={`text-left p-5 rounded-xl border-2 transition-colors ${
                    plan === "directa"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary hover:border-primary/50"
                  } ${!model.cuotaDirecta ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold">Compra Directa</span>
                    {plan === "directa" && <Check size={18} className="text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">7 pagos iguales</p>
                  <p className="mt-3 font-heading font-bold text-primary text-lg">
                    {model.cuotaDirecta ? `${fmt(model.cuotaDirecta)}/mes` : "No disponible"}
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!model.cuotaFacil}
                  onClick={() => setPlan("facil")}
                  className={`text-left p-5 rounded-xl border-2 transition-colors ${
                    plan === "facil"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary hover:border-primary/50"
                  } ${!model.cuotaFacil ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold">Pago Fácil</span>
                    {plan === "facil" && <Check size={18} className="text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    12 pagos · última cuota mayor
                  </p>
                  <p className="mt-3 font-heading font-bold text-primary text-lg">
                    {model.cuotaFacil ? `${fmt(model.cuotaFacil)}/mes` : "No disponible"}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: INICIAL */}
          {step === 2 && model && plan && totales && (
            <div>
              <h3 className="font-heading text-xl font-bold mb-1">Paso 3 — Ajusta tu inicial</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Define qué porcentaje del total estás dispuesto a aportar como inicial.
              </p>

              <div className="p-5 rounded-xl bg-secondary border border-border">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Inicial deseada</span>
                  <span className="font-heading font-bold text-2xl text-primary">
                    {inicialPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={inicialPct}
                  onChange={(e) => setInicialPct(Number(e.target.value))}
                  className="w-full mt-4 accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>30%</span>
                  <span>60%</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">Monto inicial</p>
                    <p className="font-heading font-bold text-lg">{fmt(totales.inicial)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">Total estimado</p>
                    <p className="font-heading font-bold text-lg text-primary">
                      {fmt(totales.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESUMEN */}
          {step === 3 && model && plan && totales && (
            <div>
              <h3 className="font-heading text-xl font-bold mb-1">Paso 4 — Resumen</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Revisa tu configuración y envíala por WhatsApp para confirmar disponibilidad.
              </p>

              <div className="rounded-xl border border-border overflow-hidden">
                <div className="divide-y divide-border text-sm">
                  {[
                    ["Modelo", `${model.name} (${model.category})`],
                    ["Plan", plan === "directa" ? "Compra Directa (7 pagos)" : "Pago Fácil (12 pagos)"],
                    ["Cuota mensual", `${fmt(cuota!)}/mes`],
                    ["Inicial", `${inicialPct}% — ${fmt(totales.inicial)}`],
                    ...(plan === "facil" && totales.ultima
                      ? [["Última cuota estimada", fmt(totales.ultima)] as [string, string]]
                      : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between px-5 py-3">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-heading font-bold text-right">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-5 py-4 bg-primary/10">
                    <span className="font-heading font-bold">TOTAL ESTIMADO</span>
                    <span className="font-heading font-bold text-lg text-primary">
                      {fmt(totales.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Desglose de cuotas
                </p>
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-4 py-2 bg-secondary text-[11px] font-heading font-bold uppercase tracking-wide text-muted-foreground">
                    <span>#</span>
                    <span>Concepto</span>
                    <span className="text-right">Monto</span>
                    <span className="text-right">Acumulado</span>
                  </div>
                  <div className="divide-y divide-border max-h-72 overflow-y-auto">
                    {schedule?.map((row, i) => (
                      <div
                        key={`${row.label}-${i}`}
                        className={`grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-4 py-2.5 text-sm ${
                          row.highlight ? "bg-primary/5" : ""
                        }`}
                      >
                        <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                        <span className={row.highlight ? "font-semibold" : ""}>{row.label}</span>
                        <span className="font-heading font-bold text-right">{fmt(row.amount)}</span>
                        <span className="text-right text-xs text-muted-foreground">
                          {fmt(row.cumulative)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/10">
                    <span className="font-heading font-bold text-sm">TOTAL</span>
                    <span className="font-heading font-bold text-lg text-primary">
                      {schedule ? fmt(schedule[schedule.length - 1].cumulative) : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Vista previa del mensaje
                </p>
                <CopyableMessage message={waMessage} />
              </div>

              <a
                href={waLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-heading font-bold hover:bg-primary/90 transition-colors"
              >
                Enviar por WhatsApp <ArrowRight size={18} />
              </a>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Montos referenciales. Sujetos a variación · La última cuota de Pago Fácil es estimada
              </p>
            </div>
          )}

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (step === 0 ? reset() : setStep(step - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-border bg-secondary hover:border-primary/50 transition-colors"
            >
              <ArrowLeft size={14} /> {step === 0 ? "Reiniciar" : "Atrás"}
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => canNext && setStep(step + 1)}
                disabled={!canNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-heading font-bold bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                Continuar <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-heading font-bold bg-secondary border border-border hover:border-primary/50 transition-colors"
              >
                Empezar de nuevo
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuidedSimulator;
