import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import CopyableMessage from "@/components/CopyableMessage";
import {
  waLink,
  commercialModels,
  truckModels,
  pickupModels,
  suvModels,
} from "@/lib/constants";

const MAX_NAME = 40;
const MAX_CITY = 40;
const sanitize = (s: string) =>
  s.replace(/[<>]/g, "").replace(/\s+/g, " ").trimStart();

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
    cuotaMin: 2612,
    cuotaMax: 16000,
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
    cuotaMin: 1455,
    cuotaMax: 9000,
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
    name: "Travesía",
    cuotaMin: 2974,
    cuotaMax: 49613,
    plazoMin: 2,
    plazoMax: 2,
    requisitosExtra: false,
    entregaAnticipada: false,
    pros: "Solo dos pagos: firma del contrato y previo a la entrega",
    contras: "Requiere alta disponibilidad de capital a corto plazo",
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
  const [models, setModels] = useState<string[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const MAX_MODELS = 3;

  // Personalización opcional (nombre y ciudad)
  const [personalizar, setPersonalizar] = useState<boolean>(false);
  const [nombre, setNombre] = useState<string>("");
  const [ciudad, setCiudad] = useState<string>("");

  // Cargar preferencias guardadas
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rm_personal");
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p?.nombre === "string") setNombre(p.nombre);
        if (typeof p?.ciudad === "string") setCiudad(p.ciudad);
        if (typeof p?.personalizar === "boolean")
          setPersonalizar(p.personalizar);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "rm_personal",
        JSON.stringify({ personalizar, nombre, ciudad }),
      );
    } catch {
      // ignore
    }
  }, [personalizar, nombre, ciudad]);

  const cleanNombre = sanitize(nombre).slice(0, MAX_NAME);
  const cleanCiudad = sanitize(ciudad).slice(0, MAX_CITY);

  const toggleModel = (name: string) => {
    setModels((prev) => {
      if (prev.includes(name)) return prev.filter((m) => m !== name);
      if (prev.length >= MAX_MODELS) return prev;
      return [...prev, name];
    });
  };

  const formatModelList = (list: string[]) => {
    if (list.length === 0) return "";
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]} y ${list[1]}`;
    return `${list.slice(0, -1).join(", ")} y ${list[list.length - 1]}`;
  };

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
    const usePersonal = personalizar;
    const greetingExtra =
      usePersonal && cleanNombre ? ` Soy ${cleanNombre}` : "";
    const greeting = `Hola Rigoberto,${greetingExtra ? `${greetingExtra}.` : ""} quiero información sobre el plan ${planName}.`;
    // Si agregamos "Soy X.", separamos en dos oraciones limpias
    const opening = greetingExtra
      ? `Hola Rigoberto.${greetingExtra}. Quiero información sobre el plan ${planName}.`
      : greeting;

    const lines: string[] = [opening];

    if (models.length > 0) {
      const list = formatModelList(models);
      lines.push(
        models.length === 1
          ? `Modelo de interés: ${list}.`
          : `Modelos de interés: ${list}.`,
      );
    }

    const budgetOpen = budget === Infinity;
    const plazoOpen = maxPlazo === 999;

    lines.push(
      `Presupuesto: ${
        budgetOpen
          ? "flexible, sin límite definido"
          : `hasta $${budget.toLocaleString("es-VE")}/mes`
      }.`,
    );
    lines.push(
      `Plazo: ${
        plazoOpen ? "flexible, sin tope" : `hasta ${maxPlazo} meses`
      }.`,
    );

    if (usePersonal && cleanCiudad) {
      lines.push(`Estoy en ${cleanCiudad}.`);
    }

    return lines.join("\n");
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
            <div className="flex items-baseline justify-between mb-2 gap-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Modelos de interés (hasta {MAX_MODELS}, opcional)
              </label>
              <span className="text-xs font-semibold text-muted-foreground">
                {models.length}/{MAX_MODELS}
                {models.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setModels([])}
                    className="ml-3 text-primary hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </span>
            </div>
            {models.length >= MAX_MODELS && (
              <div
                role="status"
                aria-live="polite"
                className="mb-2 flex items-center gap-2 rounded-lg border-2 border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-foreground"
              >
                <span className="text-amber-500">●</span>
                <span>
                  Llegaste al máximo de {MAX_MODELS} modelos. Quita uno para
                  agregar otro.
                </span>
              </div>
            )}
            <div className="rounded-lg border-2 border-border bg-background p-3 max-h-64 overflow-y-auto space-y-3">
              {Array.from(new Set(modelOptions.map((m) => m.group)))
                .filter((g) => g !== "Sin preferencia")
                .map((g) => (
                  <div key={g}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {g}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {modelOptions
                        .filter((m) => m.group === g)
                        .map((m) => {
                          const active = models.includes(m.name);
                          const disabled = !active && models.length >= MAX_MODELS;
                          return (
                            <button
                              key={m.name}
                              type="button"
                              onClick={() => toggleModel(m.name)}
                              disabled={disabled}
                              aria-pressed={active}
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-2 transition-colors ${
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : disabled
                                    ? "border-border bg-background text-muted-foreground/50 cursor-not-allowed"
                                    : "border-border bg-background hover:border-primary/50"
                              }`}
                            >
                              {active ? "✓ " : ""}
                              {m.name}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Personalización opcional */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={personalizar}
                onChange={(e) => setPersonalizar(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Personalizar mensaje con mi nombre y ciudad (opcional)
              </span>
            </label>

            {personalizar && (
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="nombre-input"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
                  >
                    Tu nombre
                  </label>
                  <input
                    id="nombre-input"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={MAX_NAME}
                    autoComplete="given-name"
                    placeholder="Ej: María"
                    className="w-full rounded-lg border-2 border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {cleanNombre.length}/{MAX_NAME}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="ciudad-input"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
                  >
                    Tu ciudad
                  </label>
                  <input
                    id="ciudad-input"
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    maxLength={MAX_CITY}
                    autoComplete="address-level2"
                    placeholder="Ej: Caracas"
                    className="w-full rounded-lg border-2 border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {cleanCiudad.length}/{MAX_CITY}
                  </p>
                </div>
              </div>
            )}
            {personalizar && !cleanNombre && !cleanCiudad && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Llena al menos un campo para que se incluya en el mensaje.
              </p>
            )}
          </div>
        </div>
        <div className="mt-10">
          <h3 className="font-heading text-lg font-bold mb-4">
            {top.length > 0
              ? `${top.length} plan${top.length === 1 ? "" : "es"} encaja${top.length === 1 ? "" : "n"} con tu perfil`
              : "Ningún plan encaja perfectamente — ajusta los filtros"}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {top.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanId(p.id)}
                  aria-pressed={isSelected}
                  className={`text-left rounded-2xl border-2 card-glow p-5 transition-all ${
                    isSelected
                      ? "border-primary shadow-[0_0_28px_-4px_hsl(var(--primary)/0.55)] bg-primary/5"
                      : "border-primary/60 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.35)] hover:border-primary"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-heading text-lg font-bold">{p.name}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/20 text-primary"
                      }`}
                    >
                      {isSelected ? "Seleccionado" : "Recomendado"}
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
                </button>
              );
            })}
          </div>

          {/* Vista previa del mensaje WhatsApp + CTA */}
          {top.length > 0 && (() => {
            const activePlan =
              top.find((p) => p.id === selectedPlanId) ?? top[0];
            return (
              <div className="mt-8 max-w-3xl mx-auto">
                {/* Resumen con chips clicables */}
                <div className="mb-3 rounded-lg border border-border bg-background/60 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Resumen de tu solicitud
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanId(null)}
                      title={
                        selectedPlanId
                          ? "Quitar selección de plan"
                          : "Plan recomendado por defecto"
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary bg-primary/15 px-3 py-1 text-xs font-bold text-foreground hover:bg-primary/25 transition-colors"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-primary">
                        Plan
                      </span>
                      {activePlan.name}
                      {selectedPlanId && <X size={11} />}
                    </button>

                    {models.length === 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <span className="text-[9px] uppercase tracking-wider">
                          Modelos
                        </span>
                        Sin preferencia
                      </span>
                    ) : (
                      models.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleModel(m)}
                          title={`Quitar ${m}`}
                          className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary bg-primary/15 px-3 py-1 text-xs font-bold text-foreground hover:bg-primary/25 transition-colors"
                        >
                          <span className="text-[9px] uppercase tracking-wider text-primary">
                            Modelo
                          </span>
                          {m}
                          <X size={11} />
                        </button>
                      ))
                    )}

                    <button
                      type="button"
                      onClick={() => setBudget(Infinity)}
                      title={
                        budget === Infinity
                          ? "Sin límite de presupuesto"
                          : "Liberar presupuesto (sin límite)"
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${
                        budget === Infinity
                          ? "border-dashed border-border text-muted-foreground"
                          : "border-primary bg-primary/15 text-foreground hover:bg-primary/25"
                      }`}
                    >
                      <span
                        className={`text-[9px] uppercase tracking-wider ${
                          budget === Infinity ? "" : "text-primary"
                        }`}
                      >
                        Presupuesto
                      </span>
                      {budget === Infinity
                        ? "Sin límite"
                        : `Hasta $${budget.toLocaleString("es-VE")}/mes`}
                      {budget !== Infinity && <X size={11} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaxPlazo(999)}
                      title={
                        maxPlazo === 999
                          ? "Sin tope de plazo"
                          : "Liberar plazo (sin tope)"
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${
                        maxPlazo === 999
                          ? "border-dashed border-border text-muted-foreground"
                          : "border-primary bg-primary/15 text-foreground hover:bg-primary/25"
                      }`}
                    >
                      <span
                        className={`text-[9px] uppercase tracking-wider ${
                          maxPlazo === 999 ? "" : "text-primary"
                        }`}
                      >
                        Plazo
                      </span>
                      {maxPlazo === 999
                        ? "Sin tope"
                        : `Hasta ${maxPlazo} meses`}
                      {maxPlazo !== 999 && <X size={11} />}
                    </button>
                  </div>
                </div>

                <CopyableMessage
                  message={buildMessage(activePlan.name)}
                  label={`Mensaje para ${activePlan.name}${
                    selectedPlanId ? "" : " (primer recomendado)"
                  }`}
                  className="bg-secondary/30"
                />
                <a
                  href={waLink(buildMessage(activePlan.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Consultar plan {activePlan.name} por WhatsApp{" "}
                  <ArrowRight size={14} />
                </a>
                {!selectedPlanId && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Toca una tarjeta arriba para personalizar el mensaje con
                    otro plan recomendado.
                  </p>
                )}
              </div>
            );
          })()}

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
          * Rangos referenciales basados en catálogos JAC / Bel Agosto 2026. La
          cuota final depende del modelo elegido y puede variar por flete,
          seguro, IVA, IGTF y nacionalización.
        </p>
      </div>
    </section>
  );
};

export default PlanComparator;
