import { useState } from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { waLink } from "@/lib/constants";
import CopyableMessage from "@/components/CopyableMessage";

const PRECIO_MIN = 5000;
const PRECIO_MAX = 300000;

type VehicleType = "SUV" | "Camioneta" | "Comercial";
const vehicleTypes: VehicleType[] = ["SUV", "Camioneta", "Comercial"];

type ModelQuota = { model: string; cuota: number; cuota2?: number };

type Plan = {
  id: string;
  title: string;
  tagline: string;
  structure: string[];
  cuotaLabel: string;
  inicialRange?: string;
  highlight: string;
  accent: "teal" | "amber" | "neutral";
  models: ModelQuota[];
  // Parámetros para el mini simulador
  inicialPct: number;        // % del precio que cubre la inicial total
  cuotasOrdinarias: number;  // número de cuotas mensuales típicas
  defaultPlazo: number;      // plazo total sugerido en meses
  plazoMin: number;
  plazoMax: number;
};

// Cuotas extraídas vía OCR de los catálogos oficiales JAC/Bel Feb 2026.
// Para Fiao/Ruta66/Travesía la secuencia de modelos es idéntica entre planes.
const morePlans: Plan[] = [
  {
    id: "credijac",
    title: "Credijac 35×35",
    tagline: "Inicial 35% + 30 cuotas + 6 cuotas extra",
    structure: [
      "6 cuotas iniciales (35%)",
      "Pre-entrega previo a la entrega",
      "30 cuotas ordinarias mensuales",
      "6 cuotas extra en meses 9, 12, 15, 18, 21 y 24",
    ],
    cuotaLabel: "Cuota ordinaria mensual",
    inicialRange: "Cuota inicial desde $1.430 hasta $6.620",
    highlight: "Plan más popular para financiamiento extendido",
    accent: "teal",
    models: [
      { model: "X100 Ferretero", cuota: 530.8 },
      { model: "Urban Chasis Largo 3 Ton", cuota: 654.5 },
      { model: "Urban Ferretero 2 Ton", cuota: 716.3 },
      { model: "C-3500 Doble Cabina", cuota: 963.7 },
      { model: "Búfalo Cava de Conservación", cuota: 2197.4 },
      { model: "Búfalo Brazo Hidráulico", cuota: 3538.2 },
      { model: "Sunray Pasajeros", cuota: 1078.7 },
      { model: "Sunlong / Bachaco", cuota: 1865.5 },
    ],
    inicialPct: 35,
    cuotasOrdinarias: 30,
    defaultPlazo: 36,
    plazoMin: 24,
    plazoMax: 48,
  },
  {
    id: "fiao",
    title: "Llévatelo Fiao",
    tagline: "Plan flexible con entrega anticipada",
    structure: [
      "Cuotas iniciales reducidas",
      "Entrega del vehículo antes de finalizar el plan",
      "Cuotas posteriores hasta cierre del cronograma",
    ],
    cuotaLabel: "Cuota mensual estimada",
    highlight: "Te llevas tu vehículo antes de pagar todo",
    accent: "amber",
    models: [
      { model: "X100 Ferretero", cuota: 1192.7 },
      { model: "Urban Chasis Largo 3 Ton", cuota: 1344.2 },
      { model: "Urban Ferretero 2 Ton", cuota: 1430.7 },
      { model: "C-3500 Doble Cabina", cuota: 2010.7 },
      { model: "Búfalo Cava de Conservación", cuota: 4221.7 },
      { model: "Búfalo Brazo Hidráulico", cuota: 6667.3 },
      { model: "Sunray Pasajeros", cuota: 2274.6 },
      { model: "Sunlong / Bachaco", cuota: 3789.4 },
    ],
    inicialPct: 25,
    cuotasOrdinarias: 18,
    defaultPlazo: 18,
    plazoMin: 12,
    plazoMax: 24,
  },
  {
    id: "ruta66",
    title: "Credijac Ruta 66",
    tagline: "Pensado para camiones de carga",
    structure: [
      "Cuotas iniciales",
      "Pre-entrega",
      "Cuotas ordinarias prolongadas",
      "Cuotas extra programadas",
    ],
    cuotaLabel: "Cuota ordinaria mensual",
    highlight: "Ideal para flotas y operadores logísticos",
    accent: "neutral",
    models: [
      { model: "X100 Ferretero", cuota: 530.8 },
      { model: "Urban Chasis Largo 3 Ton", cuota: 654.5 },
      { model: "Urban Ferretero 2 Ton", cuota: 716.3 },
      { model: "C-3500 Doble Cabina", cuota: 963.7 },
      { model: "Búfalo Cava de Conservación", cuota: 2197.4 },
      { model: "Búfalo Brazo Hidráulico", cuota: 3538.2 },
      { model: "Sunlong / Bachaco", cuota: 1865.5 },
    ],
    inicialPct: 30,
    cuotasOrdinarias: 30,
    defaultPlazo: 36,
    plazoMin: 24,
    plazoMax: 48,
  },
  {
    id: "travesia",
    title: "Travesía Eléctricos",
    tagline: "Estructura Pago Cuota 1 + Pago Cuota 2",
    structure: [
      "Pago Cuota 1 al firmar el contrato",
      "Pago Cuota 2 al momento de la entrega",
      "No tiene cuotas mensuales: solo dos pagos definidos",
    ],
    cuotaLabel: "Pago Cuota 1 / Pago Cuota 2",
    highlight: "Único plan dedicado 100% a eléctricos",
    accent: "teal",
    models: [
      { model: "Sunray EV", cuota: 6038.3, cuota2: 6038.3 },
      { model: "E-Sei4", cuota: 7154.3, cuota2: 7154.3 },
      { model: "E-JS1", cuota: 5564.0, cuota2: 5564.0 },
      { model: "E-JS4", cuota: 7752.5, cuota2: 7752.5 },
    ],
    inicialPct: 50,
    cuotasOrdinarias: 2,
    defaultPlazo: 2,
    plazoMin: 2,
    plazoMax: 2,
  },
];

const accentBorder = {
  neutral: "border-border",
  teal: "border-primary/60 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.35)]",
  amber: "border-amber-500/40",
};

const accentBadge = {
  neutral: "bg-secondary text-foreground",
  teal: "bg-primary text-primary-foreground",
  amber: "bg-amber-500 text-white",
};

const formatUSD = (n: number) =>
  `$${n.toLocaleString("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const MorePlansSection = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(morePlans[0].id);
  const [vehicleType, setVehicleType] = useState<VehicleType>("SUV");
  const [precio, setPrecio] = useState<number>(25000);
  const [precioRaw, setPrecioRaw] = useState<string>("25000");
  const [plazo, setPlazo] = useState<number>(morePlans[0].defaultPlazo);

  const selectedPlan =
    morePlans.find((p) => p.id === selectedPlanId) ?? morePlans[0];

  // Recalcular plazo dentro del rango cuando cambia el plan
  const effectivePlazo = Math.min(
    Math.max(plazo, selectedPlan.plazoMin),
    selectedPlan.plazoMax,
  );
  const plazoIsValid =
    Number.isFinite(plazo) &&
    plazo >= selectedPlan.plazoMin &&
    plazo <= selectedPlan.plazoMax;

  // Validación del precio
  let precioError: string | null = null;
  if (precioRaw.trim() === "" || !Number.isFinite(precio)) {
    precioError = "Ingresa un precio válido para simular tu cuota.";
  } else if (precio <= 0) {
    precioError = "El precio debe ser mayor que $0.";
  } else if (precio < PRECIO_MIN) {
    precioError = `El precio mínimo aceptado es ${formatUSD(PRECIO_MIN)}.`;
  } else if (precio > PRECIO_MAX) {
    precioError = `El precio máximo aceptado es ${formatUSD(PRECIO_MAX)}.`;
  }

  const isValid = !precioError && plazoIsValid;

  // Cálculo simplificado de la cuota mensual estimada
  const inicialMonto = isValid ? (precio * selectedPlan.inicialPct) / 100 : 0;
  const restante = isValid ? precio - inicialMonto : 0;
  const cuotaEstimada = isValid ? restante / effectivePlazo : 0;

  const waMessage = (() => {
    const parts: string[] = [
      `Hola Rigoberto, me interesa el plan ${selectedPlan.title} para un vehículo tipo ${vehicleType}.`,
    ];
    if (isValid) {
      parts.push(
        `Precio aproximado ${formatUSD(precio)}.`,
        `Según el simulador la cuota mensual sería ~${formatUSD(cuotaEstimada)} en ${effectivePlazo} meses (inicial estimada ${formatUSD(inicialMonto)}).`,
        `¿Me confirmas los números reales?`,
      );
    } else {
      parts.push(`¿Me puedes dar más información?`);
    }
    return parts.join(" ");
  })();


  return (
    <section id="mas-planes" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">Más planes de financiamiento</h2>
          <p className="section-subtitle">
            Además de Compra Directa y Pago Fácil, JAC ofrece cuatro planes
            adicionales. Selecciona un plan para ver la cuota estimada por
            modelo.
          </p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Tabs de planes */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {morePlans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlanId(p.id)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-heading font-bold transition-colors ${
                selectedPlanId === p.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Tarjeta del plan seleccionado */}
        <div
          className={`mt-8 rounded-2xl border-2 ${accentBorder[selectedPlan.accent]} card-glow p-6 md:p-8`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <span
                className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${accentBadge[selectedPlan.accent]}`}
              >
                {selectedPlan.highlight}
              </span>
              <h3 className="font-heading text-2xl font-bold mt-4">
                {selectedPlan.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedPlan.tagline}
              </p>

              <ul className="mt-5 space-y-2 text-sm">
                {selectedPlan.structure.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan.inicialRange && (
                <p className="mt-4 text-sm">
                  <span className="font-heading font-bold text-primary">
                    {selectedPlan.inicialRange}
                  </span>
                </p>
              )}
            </div>

            {/* Tabla de modelos */}
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {selectedPlan.cuotaLabel} por modelo
              </h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {selectedPlan.models.map((m, i) => (
                      <tr
                        key={m.model}
                        className={i % 2 === 0 ? "bg-secondary/40" : ""}
                      >
                        <td className="px-4 py-2.5 font-semibold">
                          {m.model}
                        </td>
                        <td className="px-4 py-2.5 text-right font-heading font-bold text-primary whitespace-nowrap">
                          {formatUSD(m.cuota)}
                          {m.cuota2 !== undefined ? (
                            <span className="text-muted-foreground font-normal">
                              {" / "}
                            </span>
                          ) : (
                            "/mes"
                          )}
                          {m.cuota2 !== undefined && (
                            <span className="text-primary">
                              {formatUSD(m.cuota2)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Mini simulador + consulta personalizada */}
        <div className="mt-10 rounded-2xl border-2 border-primary/40 bg-secondary/30 p-6 md:p-8 max-w-3xl mx-auto">
          <h3 className="font-heading text-lg md:text-xl font-bold text-center">
            Simula tu cuota y arma tu consulta
          </h3>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Ingresa el precio del vehículo y el plazo. Calculamos una cuota
            estimada según el plan seleccionado y armamos tu mensaje.
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="precio-input"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Precio del vehículo (USD)
              </label>
              <input
                id="precio-input"
                type="number"
                inputMode="numeric"
                min={PRECIO_MIN}
                max={PRECIO_MAX}
                step={500}
                value={precioRaw}
                aria-invalid={!!precioError}
                aria-describedby={precioError ? "precio-error" : undefined}
                onChange={(e) => {
                  const raw = e.target.value;
                  setPrecioRaw(raw);
                  const n = Number(raw);
                  setPrecio(Number.isFinite(n) ? n : NaN);
                }}
                className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-sm font-semibold text-foreground focus:outline-none transition-colors ${
                  precioError
                    ? "border-amber-500 focus:border-amber-500"
                    : "border-border focus:border-primary"
                }`}
              />
              {precioError && (
                <p
                  id="precio-error"
                  className="mt-1.5 text-xs font-semibold text-amber-500"
                >
                  {precioError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="plazo-input"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Plazo: {effectivePlazo} meses
                <span className="text-muted-foreground font-normal normal-case ml-1">
                  ({selectedPlan.plazoMin}–{selectedPlan.plazoMax})
                </span>
              </label>
              <input
                id="plazo-input"
                type="range"
                min={selectedPlan.plazoMin}
                max={selectedPlan.plazoMax}
                step={6}
                value={effectivePlazo}
                onChange={(e) => setPlazo(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          {/* Aviso de validación */}
          {!isValid && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-lg border-2 border-amber-500/60 bg-amber-500/10 p-3 text-sm"
            >
              <AlertTriangle
                size={16}
                className="text-amber-500 mt-0.5 shrink-0"
              />
              <p className="text-foreground">
                {precioError ??
                  `El plazo debe estar entre ${selectedPlan.plazoMin} y ${selectedPlan.plazoMax} meses.`}{" "}
                <span className="text-muted-foreground">
                  La simulación y el mensaje no se actualizarán hasta corregir
                  estos valores.
                </span>
              </p>
            </div>
          )}

          {/* Resultado del simulador */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-background border border-border p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Inicial ({selectedPlan.inicialPct}%)
              </p>
              <p className="font-heading font-bold text-foreground mt-1">
                {isValid ? formatUSD(inicialMonto) : "—"}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 text-center border-2 ${
                isValid
                  ? "bg-primary/10 border-primary"
                  : "bg-background border-dashed border-border"
              }`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isValid ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Cuota mensual
              </p>
              <p
                className={`font-heading font-bold mt-1 ${
                  isValid ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {isValid ? formatUSD(cuotaEstimada) : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-background border border-border p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total a financiar
              </p>
              <p className="font-heading font-bold text-foreground mt-1">
                {isValid ? formatUSD(restante) : "—"}
              </p>
            </div>
          </div>

          {/* Tipo de vehículo */}
          <div className="mt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Tipo de vehículo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {vehicleTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setVehicleType(t)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    vehicleType === t
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <CopyableMessage message={waMessage} className="mt-5" />

          {isValid ? (
            <a
              href={waLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enviar consulta por WhatsApp <ArrowRight size={16} />
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Corrige el precio o el plazo para enviar la consulta"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-muted px-5 py-3 font-heading text-sm font-bold text-muted-foreground cursor-not-allowed"
            >
              Corrige los datos para enviar la consulta
            </button>
          )}

          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Cuota calculada como (precio − inicial) ÷ plazo. Estimación
            referencial sin incluir cuotas extra, intereses, IVA, IGTF ni
            gastos de nacionalización.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          * Montos referenciales de los catálogos oficiales JAC / Bel Feb 2026.
          Sujetos a variación según flete, seguro, IVA, IGTF y gastos de
          nacionalización. Confirma siempre con Rigoberto antes de cerrar tu
          plan.
        </p>
      </div>
    </section>
  );
};

export default MorePlansSection;
