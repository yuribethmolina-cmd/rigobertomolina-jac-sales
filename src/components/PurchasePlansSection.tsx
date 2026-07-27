import { Check, ArrowRight } from "lucide-react";
import { waLink } from "@/lib/constants";

const plans = [
  {
    icon: "💳",
    badge: null,
    title: "Compra Directa",
    tagline: "Rápido y sin complicaciones",
    accent: "neutral" as const,
    features: [
      "Afiliación inicial el Día 1",
      "5 cuotas mensuales iguales",
      "Pago final previo a entrega",
      "Total en ~7 meses",
      "Sin requisitos adicionales",
    ],
    cta: { label: "Ver cuotas por modelo", href: "#modelos" },
  },
  {
    icon: "📅",
    badge: "MÁS POPULAR",
    title: "Pago Fácil",
    tagline: "Cuotas más bajas, más tiempo",
    accent: "teal" as const,
    features: [
      "Afiliación inicial el Día 1",
      "10 cuotas mensuales reducidas",
      "Última cuota antes de la entrega",
      "Total en ~12 meses",
      "Sin requisitos adicionales",
    ],
    cta: { label: "Ver cuotas por modelo", href: "#modelos" },
  },
  {
    icon: "🏦",
    badge: null,
    title: "Crédito Bel",
    tagline: "Financiamiento a largo plazo",
    accent: "amber" as const,
    features: [
      "Financiamiento personalizado",
      "Para venezolanos mayores de 18 años",
      "Solicitud por correo o app appbel.com.ve",
      "Respuesta a tu correo electrónico",
      "Consulta requisitos con Rigoberto",
    ],
    cta: {
      label: "Consultar requisitos",
      href: waLink("Hola Rigoberto, quiero información sobre el crédito JAC de Bel"),
      external: true,
    },
  },
];

const tableRows = [
  { label: "Cuotas mensuales", directa: "5 iguales", facil: "10 reducidas", bel: "A convenir" },
  { label: "Plazo total", directa: "~7 meses", facil: "~12 meses", bel: "Largo plazo" },
  { label: "Requisitos extra", directa: "Ninguno", facil: "Ninguno", bel: "Sí (ver doc.)" },
  { label: "Ideal para", directa: "Pago rápido", facil: "Cuota baja", bel: "Financiamiento" },
  { label: "Gestión", directa: "Con Rigoberto", facil: "Con Rigoberto", bel: "App + correo" },
];

const accentBorder = {
  neutral: "border-border",
  teal: "border-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.4)]",
  amber: "border-amber-500/40",
};

const accentCtaBg = {
  neutral: "bg-primary hover:bg-primary/90 text-primary-foreground",
  teal: "bg-primary hover:bg-primary/90 text-primary-foreground",
  amber: "bg-amber-500 hover:bg-amber-600 text-white",
};

const PurchasePlansSection = () => (
  <section id="planes" className="py-20 section-divider">
    <div className="section-container">
      {/* Header */}
      <div className="text-center">
        <h2 className="section-title">¿Cuál es tu plan?</h2>
        <p className="section-subtitle">
          JAC tiene tres formas de llevarte tu carro — elige la que más te convenga
        </p>
        <div className="teal-underline mx-auto" />
      </div>

      {/* Cards */}
      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`relative rounded-2xl border-2 ${accentBorder[plan.accent]} card-glow flex flex-col p-6`}
          >
            {plan.badge && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                {plan.badge}
              </span>
            )}

            <span className="text-4xl">{plan.icon}</span>
            <h3 className="font-heading text-xl font-bold mt-3">{plan.title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{plan.tagline}</p>

            <ul className="mt-5 space-y-2.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={plan.cta.href}
              {...((plan.cta as any).external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={`mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-heading text-sm font-bold transition-colors ${accentCtaBg[plan.accent]}`}
            >
              {plan.cta.label} <ArrowRight size={16} />
            </a>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="mt-16">
        <h3 className="font-heading text-xl font-bold text-center mb-6">Compara los planes</h3>
        <div className="rounded-2xl overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-secondary p-4 text-left font-semibold">Característica</th>
                  <th className="bg-secondary p-4 text-center font-semibold">Compra Directa</th>
                  <th className="bg-primary text-primary-foreground p-4 text-center font-semibold">
                    Pago Fácil
                  </th>
                  <th className="bg-amber-500/20 text-amber-500 p-4 text-center font-semibold">
                    Crédito Bel
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={row.label}>
                    <td className={`p-4 font-semibold text-muted-foreground ${i % 2 === 0 ? "bg-secondary/50" : ""}`}>
                      {row.label}
                    </td>
                    <td className={`p-4 text-center ${i % 2 === 0 ? "bg-secondary/50" : ""}`}>
                      {row.directa}
                    </td>
                    <td className={`p-4 text-center ${i % 2 === 0 ? "bg-primary/10" : "bg-primary/5"}`}>
                      {row.facil}
                    </td>
                    <td className={`p-4 text-center ${i % 2 === 0 ? "bg-amber-500/10" : "bg-amber-500/5"}`}>
                      {row.bel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        * Compra Directa y Pago Fácil: montos referenciales del catálogo Julio 2026, sujetos a variación.
        Crédito Bel: sujeto a aprobación. ¿Tienes dudas sobre cuál plan es para ti? Escríbele a Rigoberto.
      </p>

      <div className="mt-6 text-center">
        <a
          href={waLink("Hola Rigoberto, quiero que me ayudes a elegir un plan de compra JAC")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Hablar con Rigoberto sobre planes <ArrowRight size={16} />
        </a>
      </div>
    </div>
  </section>
);

export default PurchasePlansSection;
