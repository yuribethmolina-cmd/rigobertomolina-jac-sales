import { waLink, waModelMessage } from "@/lib/constants";
import { ArrowRight, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { findVehicle } from "@/data/vehicles";
import { pagoFacilMonthly } from "@/data/vehicleFinancing";
import { NOT_VERIFIED_LABEL, fmtUsd0, FINANCING_DISCLAIMER } from "@/data/financingPlans";

/* Comparativa de SUV — los montos provienen de la fuente única. */
const COMPARE_IDS = [
  "arena-sport-manual",
  "arena-sport-automatico",
  "nevado-manual",
  "nevado-automatico",
];

const models = COMPARE_IDS.map((id) => findVehicle(id)).filter(
  (v): v is NonNullable<ReturnType<typeof findVehicle>> => Boolean(v)
);

const cuotaLabel = (id: string) => {
  const v = pagoFacilMonthly(id);
  return v ? `${fmtUsd0(v)}/mes` : NOT_VERIFIED_LABEL;
};

const rows: { label: string; value: (id: string) => string; isTotal?: boolean }[] = [
  {
    label: "Transmisión",
    value: (id) => (findVehicle(id)?.displayName.toLowerCase().includes("autom") ? "Automática" : "Manual"),
  },
  { label: "Categoría", value: (id) => findVehicle(id)?.category ?? "—" },
  { label: "Cuota Pago Fácil", value: cuotaLabel, isTotal: true },
];

/* ── Mobile: card-per-model ── */
const MobileCards = () => (
  <div className="flex flex-col gap-5 md:hidden mt-10">
    {models.map((m) => (
      <div
        key={m.id}
        className={`rounded-2xl overflow-hidden border ${m.featured ? "border-primary" : "border-border"}`}
      >
        {m.featured && (
          <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1.5 tracking-wide uppercase">
            Recomendado
          </div>
        )}
        <div className="bg-gradient-to-b from-secondary to-background p-5">
          <h3 className="font-heading text-lg font-bold text-center">{m.displayName}</h3>
          <div className="mt-4 space-y-3">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between gap-3 text-sm px-3 py-2 rounded-lg ${i % 2 === 0 ? "bg-secondary" : ""}`}
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-semibold text-right ${row.isTotal ? "text-primary font-bold" : ""}`}>
                  {row.value(m.id)}
                </span>
              </div>
            ))}
          </div>
          <a
            href={waLink(waModelMessage(m.displayName))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Consultar este modelo <ArrowRight size={16} />
          </a>
          <Link
            to={`/modelo/${m.id}`}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-5 py-3 font-heading text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            Ver planes y cronogramas
          </Link>
        </div>
      </div>
    ))}
  </div>
);

/* ── Desktop table ── */
const DesktopTable = () => (
  <div className="hidden md:block mt-10 overflow-x-auto">
    <table className="w-full min-w-[640px] text-sm">
      <thead>
        <tr className="bg-primary text-primary-foreground">
          <th className="p-3 text-left rounded-tl-lg font-heading font-bold">Característica</th>
          {models.map((m, i) => (
            <th
              key={m.id}
              className={`p-3 text-center font-heading font-bold ${i === models.length - 1 ? "rounded-tr-lg" : ""}`}
            >
              {m.displayName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.label} className={i % 2 === 0 ? "bg-card" : "bg-secondary/50"}>
            <td className="p-3 font-semibold text-muted-foreground">{row.label}</td>
            {models.map((m) => (
              <td
                key={m.id}
                className={`p-3 text-center ${row.isTotal ? "text-primary font-bold" : "font-semibold"}`}
              >
                {row.value(m.id)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ComparisonSection = () => (
  <section id="comparar" className="py-20 section-divider">
    <div className="section-container">
      <div className="text-center">
        <h2 className="section-title">Compara los SUV más buscados</h2>
        <p className="section-subtitle">Cuota mensual documentada del plan Pago Fácil</p>
        <div className="teal-underline mx-auto" />
      </div>

      <MobileCards />
      <DesktopTable />

      <p className="mt-6 text-xs text-muted-foreground max-w-3xl mx-auto text-center">
        {FINANCING_DISCLAIMER}
      </p>

      <div className="mt-8 text-center">
        <a
          href="#simulador"
          className="inline-flex items-center gap-2 rounded-lg border border-primary px-6 py-3 font-heading text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
        >
          <Calculator size={16} /> Ver todos los planes
        </a>
      </div>
    </div>
  </section>
);

export default ComparisonSection;
