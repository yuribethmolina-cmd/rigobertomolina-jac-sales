import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Check, MessageCircle, ClipboardList, Car, BadgeCheck, Shield, Banknote, ArrowRight } from "lucide-react";
import { waLink } from "@/lib/constants";
import {
  financingPlans,
  FINANCING_DISCLAIMER,
  requirementsForPlan,
  requiresCreditEvaluation,
  REQUIREMENTS_NOTE,
  fmtUsd,
  type FinancingPlan,
} from "@/data/financingPlans";
import { vehicleFinancing } from "@/data/vehicleFinancing";
import FooterSection from "@/components/FooterSection";

const WA_MSG_CREDITO =
  "Hola Rigoberto, vi la página de financiamiento y quiero saber qué plan me conviene más. ¿Puedes asesorarme?";

const verifiedPlans = financingPlans.filter((p) => p.sourceStatus !== "REVIEW_NOT_VERIFIED");

/* ── Datos para el comparador ── */

interface PlanCompareRow {
  plan: FinancingPlan;
  firma: string;
  preEntrega: string;
  cuotasIniciales: number;
  cuotasMensuales: number;
  cuotaRange: { min: number; max: number } | null;
}

/** Rango de cuota mensual documentada para un plan, calculado desde
 *  los cronogramas trazables de vehicleFinancing. */
const cuotaRangeForPlan = (planId: string): { min: number; max: number } | null => {
  const rows = vehicleFinancing.filter((f) => f.planId === planId);
  const amounts: number[] = [];
  for (const row of rows) {
    for (const s of row.schedule) {
      if ((s.type === "ORDINARY" || s.type === "FIXED") && s.amount !== null) {
        amounts.push(s.amount);
      }
    }
  }
  if (amounts.length === 0) return null;
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
};

const planCompareRows: PlanCompareRow[] = verifiedPlans.map((plan) => {
  const firmaStage = plan.template.find((s) => s.type === "SIGNATURE");
  const preEntregaStage = plan.template.find((s) => s.type === "PRE_DELIVERY");
  const iniciales = plan.template.filter((s) => s.type === "INITIAL");
  const mensuales = plan.template.filter(
    (s) => s.type === "ORDINARY" || s.type === "FIXED" || s.type === "SPECIAL"
  );
  return {
    plan,
    firma: firmaStage ? `${firmaStage.count} pago` : "No aplica",
    preEntrega: preEntregaStage ? `${preEntregaStage.count} pago` : "No aplica",
    cuotasIniciales: iniciales.reduce((sum, s) => sum + s.count, 0),
    cuotasMensuales: mensuales.reduce((sum, s) => sum + s.count, 0),
    cuotaRange: cuotaRangeForPlan(plan.id),
  };
});

const benefits = [
  {
    icon: Banknote,
    title: "Sin banco de por medio",
    desc: "El crédito es directo con JAC Motors. Sin trámites bancarios ni historial crediticio requerido.",
  },
  {
    icon: BadgeCheck,
    title: "Montos fijos desde el inicio",
    desc: "Ni el precio ni las cuotas varían desde el momento en que firmas el contrato.",
  },
  {
    icon: Shield,
    title: "Seguro incluido el primer año",
    desc: "Todos los planes de crédito incluyen póliza de cobertura amplia sin costo adicional durante el primer año.",
  },
];

const credijacSteps = [
  { icon: MessageCircle, label: "Escríbele a Rigoberto por WhatsApp" },
  { icon: ClipboardList, label: "Proporciona tus datos básicos: nombre, cédula, teléfono, estado y correo" },
  { icon: BadgeCheck, label: "JAC analiza tu solicitud y responde en aprox. 1 hora" },
  { icon: Banknote, label: "Pagas la inicial fraccionada (5 o 6 cuotas según el modelo)" },
  { icon: Car, label: "Recibes tu vehículo y continúas con las cuotas restantes" },
];

const Financiamiento = () => (
  <>
    <Helmet>
      <title>Financiamiento JAC · Rigoberto Molina</title>
      <meta
        name="description"
        content="Planes de crédito JAC Venezuela: CrediJAC 35x35, Facilito, Pago Fácil y más. Sin banco, montos fijos, seguro incluido. Consulta con Rigoberto Molina."
      />
    </Helmet>

    {/* Hero */}
    <section className="pt-16 pb-10 bg-secondary/40 border-b border-border">
      <div className="section-container text-center max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
          Rigoberto Molina · Vendedor JAC Caracas
        </p>
        <h1 className="font-heading text-4xl font-bold leading-tight">
          Planes de crédito y financiamiento JAC
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Toda la información que necesitas para comprar tu JAC nuevo: planes disponibles, requisitos y cómo empezar.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={waLink(WA_MSG_CREDITO)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <MessageCircle size={18} /> Consultar con Rigoberto
          </a>
          <Link
            to="/creditos"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-6 py-3.5 font-heading font-bold text-primary hover:bg-primary/5 transition-colors"
          >
            <ClipboardList size={18} /> Ver créditos y requisitos
          </Link>
        </div>
      </div>
    </section>

    {/* Beneficios principales */}
    <section className="py-16 section-divider">
      <div className="section-container">
        <h2 className="section-title text-center">¿Por qué financiar con JAC?</h2>
        <div className="teal-underline mx-auto" />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-secondary/40 p-6 flex flex-col gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <b.icon size={22} className="text-primary" />
              </div>
              <h3 className="font-heading text-base font-bold">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Planes disponibles */}
    <section className="py-16 bg-secondary/30 section-divider">
      <div className="section-container">
        <h2 className="section-title text-center">Planes vigentes</h2>
        <p className="section-subtitle text-center">{verifiedPlans.length} planes disponibles — elige el que mejor se adapte a ti</p>
        <div className="teal-underline mx-auto" />

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {verifiedPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-primary/25 bg-background p-5 flex flex-col gap-3"
            >
              <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-2 space-y-1.5 flex-1">
                {plan.template.map((stage) => (
                  <li key={stage.label} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>
                      {stage.count > 1 ? `${stage.count} × ` : ""}
                      {stage.label}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={waLink(
                  `Hola Rigoberto, me interesa el plan ${plan.name}. ¿Me puedes dar más información y disponibilidad?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-4 py-2.5 font-heading text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
              >
                Preguntar por este plan <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Comparador de planes */}
    <section className="py-16 section-divider">
      <div className="section-container">
        <h2 className="section-title text-center">Comparador de planes</h2>
        <p className="section-subtitle text-center">
          Firma, cuota mensual, cuotas y pre-entrega lado a lado
        </p>
        <div className="teal-underline mx-auto" />

        {/* Tabla — solo escritorio */}
        <div className="mt-10 hidden md:block overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60">
                <th className="text-left px-4 py-3 font-heading font-bold text-foreground whitespace-nowrap">
                  Plan
                </th>
                <th className="text-center px-4 py-3 font-heading font-bold text-foreground whitespace-nowrap">
                  Firma
                </th>
                <th className="text-center px-4 py-3 font-heading font-bold text-foreground whitespace-nowrap">
                  Cuota mensual
                </th>
                <th className="text-center px-4 py-3 font-heading font-bold text-foreground whitespace-nowrap">
                  N.º de cuotas
                </th>
                <th className="text-center px-4 py-3 font-heading font-bold text-foreground whitespace-nowrap">
                  Pre-entrega
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {planCompareRows.map((row) => {
                const totalCuotas =
                  row.cuotasIniciales > 0
                    ? `${row.cuotasIniciales} iniciales + ${row.cuotasMensuales} mensuales`
                    : `${row.cuotasMensuales}`;
                return (
                  <tr key={row.plan.id} className="bg-background/40 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-heading font-bold text-foreground">{row.plan.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap text-foreground">
                      {row.firma}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap text-foreground">
                      {row.cuotaRange ? (
                        row.cuotaRange.min === row.cuotaRange.max ? (
                          fmtUsd(row.cuotaRange.min)
                        ) : (
                          <span>
                            {fmtUsd(row.cuotaRange.min)}
                            <span className="text-muted-foreground"> a </span>
                            {fmtUsd(row.cuotaRange.max)}
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground">Consultar</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap text-foreground">
                      {totalCuotas}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap text-foreground">
                      {row.preEntrega}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tarjetas — solo móvil */}
        <div className="mt-10 md:hidden space-y-4">
          {planCompareRows.map((row) => {
            const totalCuotas =
              row.cuotasIniciales > 0
                ? `${row.cuotasIniciales} iniciales + ${row.cuotasMensuales} mensuales`
                : `${row.cuotasMensuales}`;
            const cuotaText = row.cuotaRange
              ? row.cuotaRange.min === row.cuotaRange.max
                ? fmtUsd(row.cuotaRange.min)
                : `${fmtUsd(row.cuotaRange.min)} a ${fmtUsd(row.cuotaRange.max)}`
              : "Consultar";
            return (
              <div key={row.plan.id} className="rounded-2xl border border-border bg-secondary/40 p-4">
                <h3 className="font-heading text-base font-bold text-foreground mb-3">{row.plan.name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Firma</p>
                    <p className="text-foreground font-semibold mt-0.5">{row.firma}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Pre-entrega</p>
                    <p className="text-foreground font-semibold mt-0.5">{row.preEntrega}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Cuota mensual</p>
                    <p className="text-foreground font-semibold mt-0.5">{cuotaText}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">N.º de cuotas</p>
                    <p className="text-foreground font-semibold mt-0.5">{totalCuotas}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          La cuota mensual varía según el modelo y configuración. El rango mostrado corresponde a los cronogramas documentados. {FINANCING_DISCLAIMER}
        </p>
      </div>
    </section>

    {/* Requisitos por plan */}
    <section className="py-16 section-divider">
      <div className="section-container">
        <h2 className="section-title text-center">Requisitos por plan</h2>
        <p className="section-subtitle text-center">
          Documentos que debes tener listos según el plan que elijas
        </p>
        <div className="teal-underline mx-auto" />

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {verifiedPlans.map((plan) => {
            const reqs = requirementsForPlan(plan.id);
            const isCredit = requiresCreditEvaluation(plan.id);
            return (
              <div
                key={plan.id}
                className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-primary shrink-0" />
                  <h3 className="font-heading text-base font-bold">{plan.name}</h3>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border bg-background/60 border-border text-muted-foreground">
                  {isCredit ? "Evaluación de crédito" : "Pago programado"}
                </span>
                <ul className="mt-1 space-y-1.5 flex-1">
                  {reqs.map((req) => (
                    <li key={req} className="flex items-start gap-2 text-sm">
                      <Check size={14} className="text-primary mt-0.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={waLink(
                    `Hola Rigoberto, quiero aplicar al plan ${plan.name}. ¿Me confirmas los recaudos vigentes?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-4 py-2.5 font-heading text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                >
                  <MessageCircle size={14} /> Consultar recaudos
                </a>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {REQUIREMENTS_NOTE}
        </p>

        <div className="mt-6 text-center">
          <Link
            to="/creditos"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ver el detalle completo de cada crédito <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>

    {/* Proceso CrediJAC 35x35 */}
    <section className="py-16 section-divider">
      <div className="section-container max-w-2xl">
        <h2 className="section-title text-center">¿Cómo solicito un crédito?</h2>
        <p className="section-subtitle text-center">
          Proceso para CrediJAC — el plan más popular, sin banco ni papeleo
        </p>
        <div className="teal-underline mx-auto" />

        <ol className="mt-10 space-y-4">
          {credijacSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-4 rounded-xl border border-border bg-secondary/40 px-5 py-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-heading font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex items-center gap-3 flex-1">
                <step.icon size={18} className="text-primary shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">{step.label}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Datos que pide el asesor */}
        <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-6">
          <h3 className="font-heading font-bold text-base mb-3">
            Datos que debes tener listos
          </h3>
          <ul className="space-y-2">
            {[
              "Nombre y apellido",
              "Número de cédula de identidad",
              "Número de teléfono",
              "Estado donde resides",
              "Correo electrónico",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            El asesor podría solicitar recaudos adicionales dependiendo del plan elegido y las condiciones vigentes.
          </p>
        </div>
      </div>
    </section>

    {/* Garantía */}
    <section className="py-12 bg-secondary/30 section-divider">
      <div className="section-container max-w-2xl text-center">
        <h2 className="font-heading text-xl font-bold mb-2">Garantía de fábrica incluida</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Todos los vehículos JAC nuevos incluyen garantía oficial:
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "150.000 km", sub: "Motor y caja" },
            { label: "120.000 km", sub: "Sistema eléctrico" },
            { label: "40.000 km", sub: "Combustión" },
          ].map((g) => (
            <div key={g.label} className="rounded-xl border border-border bg-background py-4 px-2">
              <p className="font-heading text-lg font-bold text-primary">{g.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{g.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA final */}
    <section className="py-16">
      <div className="section-container max-w-xl text-center">
        <h2 className="font-heading text-2xl font-bold">¿Listo para empezar?</h2>
        <p className="text-muted-foreground mt-2 mb-6">
          Escríbele directamente a Rigoberto para recibir asesoría personalizada y el cronograma actualizado del plan que te interesa.
        </p>
        <a
          href={waLink(WA_MSG_CREDITO)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-colors text-base"
        >
          <MessageCircle size={20} /> Hablar con Rigoberto por WhatsApp
        </a>
        <p className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
          {FINANCING_DISCLAIMER}
        </p>
      </div>
    </section>

    <FooterSection />
  </>
);

export default Financiamiento;
