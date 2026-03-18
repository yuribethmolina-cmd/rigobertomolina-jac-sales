import { waLink, waModelMessage } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

const data = [
  { label: "Transmisión", arena_mt: "Manual", arena_at: "Automática", nevado_mt: "Manual", nevado_at: "Automática" },
  { label: "Ideal para", arena_mt: "Ciudad", arena_at: "Ciudad", nevado_mt: "Ciudad y carretera", nevado_at: "Ciudad y carretera" },
  { label: "Cuota ref.", arena_mt: "$2.383", arena_at: "$2.586", nevado_mt: "$3.018", nevado_at: "$3.715" },
  { label: "Tamaño", arena_mt: "Compacto", arena_at: "Compacto", nevado_mt: "Mediano", nevado_at: "Mediano" },
];

const models = [
  { key: "arena_mt", name: "Arena MT", featured: false },
  { key: "arena_at", name: "Arena AT", featured: false },
  { key: "nevado_mt", name: "Nevado MT", featured: true },
  { key: "nevado_at", name: "Nevado AT", featured: false },
];

/* ── Mobile: card-per-model ── */
const MobileCards = () => (
  <div className="flex flex-col gap-5 md:hidden mt-10">
    {models.map((m) => (
      <div
        key={m.key}
        className={`rounded-2xl overflow-hidden border ${
          m.featured ? "border-primary" : "border-border"
        }`}
      >
        {m.featured && (
          <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1.5 tracking-wide uppercase">
            ⭐ Recomendado
          </div>
        )}
        <div className="bg-gradient-to-b from-secondary to-background p-5">
          <h3 className="font-heading text-lg font-bold text-center">{m.name}</h3>
          <div className="mt-4 space-y-3">
            {data.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between text-sm px-3 py-2 rounded-lg ${
                  i % 2 === 0 ? "bg-secondary" : ""
                }`}
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold">{(row as Record<string, string>)[m.key]}</span>
              </div>
            ))}
          </div>
          <a
            href={waLink(waModelMessage(m.name))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Consultar este modelo <ArrowRight size={16} />
          </a>
        </div>
      </div>
    ))}
  </div>
);

/* ── Desktop: enhanced table ── */
const DesktopTable = () => (
  <div className="hidden md:block mt-10 rounded-2xl overflow-hidden border border-border">
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="bg-secondary p-4 text-left" />
          {models.map((m) => (
            <th
              key={m.key}
              className={`p-4 text-center font-heading font-bold text-base relative ${
                m.featured
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {m.featured && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-t-lg uppercase tracking-wide">
                  ⭐ Recomendado
                </span>
              )}
              {m.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row.label}>
            <td className={`p-4 font-semibold text-muted-foreground ${i % 2 === 0 ? "bg-secondary" : ""}`}>
              {row.label}
            </td>
            {models.map((m) => (
              <td
                key={m.key}
                className={`p-4 text-center ${
                  m.featured
                    ? i % 2 === 0
                      ? "bg-primary/10"
                      : "bg-primary/5"
                    : i % 2 === 0
                      ? "bg-secondary"
                      : ""
                }`}
              >
                {(row as Record<string, string>)[m.key]}
              </td>
            ))}
          </tr>
        ))}
        {/* CTA row */}
        <tr>
          <td className="p-4 bg-secondary" />
          {models.map((m) => (
            <td
              key={m.key}
              className={`p-4 text-center ${m.featured ? "bg-primary/5" : "bg-secondary"}`}
            >
              <a
                href={waLink(waModelMessage(m.name))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                Consultar <ArrowRight size={14} />
              </a>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);

const ComparisonSection = () => (
  <section className="py-20 bg-secondary/30">
    <div className="container">
      <div className="text-center">
        <h2 className="section-title">¿Cuál Nevado o Arena es para ti?</h2>
        <p className="section-subtitle">Los modelos más consultados, lado a lado</p>
        <div className="teal-underline mx-auto" />
      </div>

      <DesktopTable />
      <MobileCards />

      <p className="text-center text-muted-foreground text-xs mt-6">
        * Cuotas referenciales del catálogo Feb 2026. Sujetas a cambios.
      </p>
    </div>
  </section>
);

export default ComparisonSection;
