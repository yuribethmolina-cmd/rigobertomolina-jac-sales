import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { waLink } from "@/lib/constants";

type VehicleType = "SUV" | "Camioneta" | "Comercial";
const vehicleTypes: VehicleType[] = ["SUV", "Camioneta", "Comercial"];

type Plan = {
  title: string;
  tagline: string;
  structure: string[];
  cuotaRange: string;
  inicialRange?: string;
  highlight: string;
  accent: "teal" | "amber" | "neutral";
};

// Datos extraídos de los catálogos oficiales JAC/Bel Feb 2026.
// Las cuotas mensuales reflejan el rango entre el modelo más económico
// y el más costoso dentro de cada plan.
const morePlans: Plan[] = [
  {
    title: "Credijac 35×35 Pasajeros / Camiones",
    tagline: "Inicial 35% + 30 cuotas + 6 cuotas extra",
    structure: [
      "6 cuotas iniciales (35%)",
      "Pre-entrega previo a la entrega",
      "30 cuotas ordinarias mensuales",
      "6 cuotas extra en meses 9, 12, 15, 18, 21 y 24",
    ],
    cuotaRange: "Cuota ordinaria desde $399 hasta $1.840/mes",
    inicialRange: "Cuota inicial desde $1.430 hasta $6.620/mes",
    highlight: "Plan más popular para financiamiento extendido",
    accent: "teal",
  },
  {
    title: "Llévatelo Fiao",
    tagline: "Plan flexible con entrega anticipada",
    structure: [
      "Cuotas iniciales reducidas",
      "Entrega del vehículo antes de finalizar el plan",
      "Cuotas posteriores hasta cierre del cronograma",
    ],
    cuotaRange: "Cuotas desde $974 hasta $3.770/mes",
    highlight: "Te llevas tu vehículo antes de pagar todo",
    accent: "amber",
  },
  {
    title: "Credijac Ruta 66",
    tagline: "Pensado para camiones de carga",
    structure: [
      "Cuotas iniciales",
      "Pre-entrega",
      "Cuotas ordinarias prolongadas",
      "Cuotas extra programadas",
    ],
    cuotaRange: "Cuota ordinaria desde $495 hasta $1.840/mes",
    highlight: "Ideal para flotas y operadores logísticos",
    accent: "neutral",
  },
  {
    title: "Travesía Eléctricos",
    tagline: "Financiamiento exclusivo para línea EV",
    structure: [
      "Estructura especial para vehículos eléctricos JAC",
      "Cronograma adaptado al ticket de los modelos EV",
      "Aplica para Sunray EV, E-Sei4, E-JS1 y otros",
    ],
    cuotaRange: "Cuotas desde $2.888 hasta $5.460/mes",
    highlight: "El único plan dedicado 100% a eléctricos",
    accent: "teal",
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

const MorePlansSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>(morePlans[0].title);
  const [vehicleType, setVehicleType] = useState<VehicleType>("SUV");

  const waMessage = `Hola Rigoberto, me interesa el plan ${selectedPlan} para un vehículo tipo ${vehicleType}. ¿Me puedes dar más información?`;

  return (
    <section id="mas-planes" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">Más planes de financiamiento</h2>
          <p className="section-subtitle">
            Además de Compra Directa y Pago Fácil, JAC ofrece cuatro planes
            adicionales para que encuentres la modalidad que mejor se adapta a
            tu presupuesto.
          </p>
          <div className="teal-underline mx-auto" />
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {morePlans.map((plan) => (
            <div
              key={plan.title}
              className={`relative rounded-2xl border-2 ${accentBorder[plan.accent]} card-glow flex flex-col p-6`}
            >
              <span
                className={`self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${accentBadge[plan.accent]}`}
              >
                {plan.highlight}
              </span>

              <h3 className="font-heading text-xl font-bold mt-4">{plan.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{plan.tagline}</p>

              <ul className="mt-5 space-y-2 text-sm">
                {plan.structure.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-5 border-t border-border space-y-1.5">
                {plan.inicialRange && (
                  <p className="text-sm">
                    <span className="font-heading font-bold text-primary">
                      {plan.inicialRange}
                    </span>
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-heading font-bold text-primary">
                    {plan.cuotaRange}
                  </span>
                </p>
              </div>

              <a
                href={waLink(
                  `Hola Rigoberto, quiero información sobre el plan ${plan.title}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Consultar este plan <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* Selector personalizado */}
        <div className="mt-14 rounded-2xl border-2 border-primary/40 bg-secondary/30 p-6 md:p-8 max-w-3xl mx-auto">
          <h3 className="font-heading text-lg md:text-xl font-bold text-center">
            Arma tu consulta personalizada
          </h3>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Elige un plan y el tipo de vehículo que buscas. Te llevamos a
            WhatsApp con el mensaje listo.
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Plan de financiamiento
              </label>
              <div className="flex flex-col gap-2">
                {morePlans.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => setSelectedPlan(p.title)}
                    className={`text-left rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                      selectedPlan === p.title
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Tipo de vehículo
              </label>
              <div className="flex flex-col gap-2">
                {vehicleTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setVehicleType(t)}
                    className={`text-left rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                      vehicleType === t
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-background border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Vista previa del mensaje
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {waMessage}
                </p>
              </div>
            </div>
          </div>

          <a
            href={waLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Enviar consulta por WhatsApp <ArrowRight size={16} />
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          * Montos referenciales de los catálogos oficiales JAC / Bel Feb 2026.
          Sujetos a variación según modelo, flete, seguro, IVA, IGTF y gastos
          de nacionalización. Confirma siempre con Rigoberto antes de cerrar
          tu plan.
        </p>
      </div>
    </section>
  );
};

export default MorePlansSection;
