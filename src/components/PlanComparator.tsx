import { useMemo, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import CopyableMessage from "@/components/CopyableMessage";
import {
  waLink,
  commercialModels,
  truckModels,
  pickupModels,
  suvModels,
} from "@/lib/constants";

const modelOptions: { group: string; name: string }[] = [
  { group: "Sin preferencia", name: "Sin preferencia" },
  ...suvModels.map((m) => ({ group: "SUV / Pasajeros", name: m.name })),
  ...pickupModels.map((m) => ({ group: "Pick-Up", name: m.name })),
  ...commercialModels.map((m) => ({ group: "Comerciales", name: m.name })),
  ...truckModels.map((m) => ({ group: "Camiones", name: m.name })),
];

type PlanRow = {
  id: string;
  name: string;
  // Cuotas mensuales típicas (rango USD)
  cuotaMin: number;
  cuotaMax: number;
  // Plazo total en meses
  plazoMin: number;
  plazoMax: number;
  // Necesita garante / requisitos extra
  requisitosExtra: boolean;
  // Entrega anticipada
  entregaAnticipada: boolean;
  pros: string;
  contras: string;
  href: string;
};

const plans: PlanRow[] = [
  {
    id: "directa",
    name: "Compra Directa",
    cuotaMin: 1454,
    cuotaMax: 9000,
    plazoMin: 7,
    plazoMax: 7,
    requisitosExtra: false,
    entregaAnticipada: false,
    pros: "Plazo más corto, cero requisitos extra",
    contras: "Cuotas mensuales más altas",
    href: "#planes",
  },
  {
    id: "facil",
    name: "Pago Fácil",
    cuotaMin: 800,
    cuotaMax: 5000,
    plazoMin: 12,
    plazoMax: 12,
    requisitosExtra: false,
    entregaAnticipada: false,
    pros: "Cuotas reducidas y sin papeleo",
    contras: "Plazo más largo que Compra Directa",
    href: "#planes",
  },
  {
    id: "credijac",
    name: "Credijac 35×35",
    cuotaMin: 399,
    cuotaMax: 3540,
    plazoMin: 36,
    plazoMax: 36,
    requisitosExtra: false,
    entregaAnticipada: false,
    pros: "Cuota mensual más baja del mercado JAC",
    contras: "Inicial 35% + 6 cuotas extra programadas",
    href: "#mas-planes",
  },
  {
    id: "fiao",
    name: "Llévatelo Fiao",
    cuotaMin: 974,
    cuotaMax: 6670,
    plazoMin: 18,
    plazoMax: 24,
    requisitosExtra: false,
    entregaAnticipada: true,
    pros: "Te llevas el vehículo antes de pagar todo",
    contras: "Cuotas medias-altas",
    href: "#mas-planes",
  },
  {
    id: "ruta66",
    name: "Credijac Ruta 66",
    cuotaMin: 495,
    cuotaMax: 3540,
    plazoMin: 36,
    plazoMax: 36,
    requisitosExtra: false,
    entregaAnticipada: false,
    pros: "Hecho para flotas y operadores logísticos",
    contras: "Cronograma extendido con cuotas extra",
    href: "#mas-planes",
  },
  {
    id: "travesia",
    name: "Travesía Eléctricos",
    cuotaMin: 2888,
    cuotaMax: 18000,
    plazoMin: 24,
    plazoMax: 36,
    requisitosExtra: false,
    entregaAnticipada: false,
    pros: "Único plan dedicado a línea EV",
    contras: "Solo aplica a modelos eléctricos",
    href: "#mas-planes",
  },
  {
    id: "bel",
    name: "Crédito Bel",
    cuotaMin: 300,
    cuotaMax: 4000,
    plazoMin: 24,
    plazoMax: 60,
    requisitosExtra: true,
    entregaAnticipada: true,
    pros: "Financiamiento bancario a largo plazo",
    contras: "Requiere cédula, RIF, balance, referencias y aprobación",
    href: "#planes",
  },
];

const budgetOptions = [
  { label: "Hasta $500/mes", value: 500 },
  { label: "Hasta $1.000/mes", value: 1000 },
  { label: "Hasta $2.000/mes", value: 2000 },
  { label: "Hasta $5.000/mes", value: 5000 },
  { label: "Sin límite", value: Infinity },
];

const plazoOptions = [
  { label: "Lo más rápido posible", value: 12 },
  { label: "Hasta 1 año", value: 18 },
  { label: "Hasta 2 años", value: 24 },
  { label: "No me importa el plazo", value: 999 },
];

const PlanComparator = () => {
  const [budget, setBudget] = useState<number>(2000);
  const [maxPlazo, setMaxPlazo] = useState<number>(24);
  const [model, setModel] = useState<string>("Sin preferencia");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const matches = useMemo(() => {
    return plans
      .map((p) => {
        const fitsBudget = p.cuotaMin <= budget;
        const fitsPlazo = p.plazoMin <= maxPlazo;
        let score = 0;
        if (fitsBudget) score += 2;
        if (fitsPlazo) score += 2;
        if (fitsBudget && p.cuotaMin <= budget * 0.7) score += 1;
        if (fitsPlazo && p.plazoMin <= maxPlazo - 6) score += 1;
        return { ...p, score, fitsBudget, fitsPlazo };
      })
      .sort((a, b) => b.score - a.score);
  }, [budget, maxPlazo]);

  const top = matches.filter((m) => m.fitsBudget && m.fitsPlazo);
  const others = matches.filter((m) => !(m.fitsBudget && m.fitsPlazo));

  const formatRange = (min: number, max: number) =>
    min === max ? `$${min.toLocaleString("es-VE")}` : `$${min.toLocaleString("es-VE")} – $${max.toLocaleString("es-VE")}`;

  const buildMessage = (planName: string) => {
    const parts: string[] = [
      `Hola Rigoberto, quiero información sobre el plan ${planName}.`,
    ];
    if (model !== "Sin preferencia") {
      parts.push(`Me interesa el modelo ${model}.`);
    }
    const constraints: string[] = [];
    if (budget !== Infinity) {
      constraints.push(
        `presupuesto de hasta $${budget.toLocaleString("es-VE")}/mes`,
      );
    }
    if (maxPlazo !== 999) {
      constraints.push(`plazo máximo de ${maxPlazo} meses`);
    }
    if (constraints.length > 0) {
      parts.push(
        `Busco un ${constraints.join(" y ")}.`.replace("un presupuesto", "presupuesto"),
      );
    }
    return parts.join(" ");
  };

  return (
    <section id="comparador" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">Comparador rápido de planes</h2>
          <p className="section-subtitle">
            Ajusta tu presupuesto mensual y plazo deseado. Te mostramos qué
            planes encajan con tu situación.
          </p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Controles */}
        <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Presupuesto mensual
            </label>
            <div className="grid grid-cols-2 gap-2">
              {budgetOptions.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setBudget(b.value)}
                  className={`rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                    budget === b.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Plazo máximo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {plazoOptions.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setMaxPlazo(p.value)}
                  className={`rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                    maxPlazo === p.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="model-select"
              className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
            >
              Modelo de interés (opcional)
            </label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
            >
              {(() => {
                const groups = Array.from(
                  new Set(modelOptions.map((m) => m.group)),
                );
                return groups.map((g) =>
                  g === "Sin preferencia" ? (
                    <option key={g} value="Sin preferencia">
                      Sin preferencia
                    </option>
                  ) : (
                    <optgroup key={g} label={g}>
                      {modelOptions
                        .filter((m) => m.group === g)
                        .map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                    </optgroup>
                  ),
                );
              })()}
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-10">
          <h3 className="font-heading text-lg font-bold mb-4">
            {top.length > 0
              ? `${top.length} plan${top.length === 1 ? "" : "es"} encaja${top.length === 1 ? "" : "n"} con tu perfil`
              : "Ningún plan encaja perfectamente — ajusta los filtros"}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {top.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border-2 border-primary/60 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.35)] card-glow p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-heading text-lg font-bold">{p.name}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Recomendado
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Cuota</p>
                    <p className="font-heading font-bold text-primary">
                      {formatRange(p.cuotaMin, p.cuotaMax)}/mes
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Plazo</p>
                    <p className="font-heading font-bold">
                      {p.plazoMin === p.plazoMax
                        ? `${p.plazoMin} meses`
                        : `${p.plazoMin}-${p.plazoMax} meses`}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="flex items-start gap-2">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>{p.pros}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <X size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{p.contras}</span>
                  </p>
                </div>
                <a
                  href={waLink(buildMessage(p.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Consultar este plan <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>

          {others.length > 0 && (
            <div className="mt-8">
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Otros planes (no encajan con tus filtros)
              </h4>
              <div className="grid md:grid-cols-3 gap-3">
                {others.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border p-4 opacity-70"
                  >
                    <h5 className="font-heading font-bold">{p.name}</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cuota desde ${p.cuotaMin.toLocaleString("es-VE")}/mes ·{" "}
                      {p.plazoMin === p.plazoMax
                        ? `${p.plazoMin} meses`
                        : `${p.plazoMin}-${p.plazoMax} meses`}
                    </p>
                    <p className="text-xs mt-2">
                      {!p.fitsBudget && (
                        <span className="text-amber-500">
                          Cuota mínima supera tu presupuesto.{" "}
                        </span>
                      )}
                      {!p.fitsPlazo && (
                        <span className="text-amber-500">
                          Plazo mayor al deseado.
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          * Rangos referenciales basados en catálogos JAC / Bel Feb 2026. La
          cuota final depende del modelo elegido y puede variar por flete,
          seguro, IVA, IGTF y nacionalización.
        </p>
      </div>
    </section>
  );
};

export default PlanComparator;
