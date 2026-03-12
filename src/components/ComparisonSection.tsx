import { waLink, waModelMessage } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

const data = [
  { label: "Transmisión", arena_mt: "Manual", arena_at: "Automática", nevado_mt: "Manual", nevado_at: "Automática" },
  { label: "Ideal para", arena_mt: "Ciudad", arena_at: "Ciudad", nevado_mt: "Ciudad y carretera", nevado_at: "Ciudad y carretera" },
  { label: "Cuota ref.", arena_mt: "$2.383", arena_at: "$2.586", nevado_mt: "$3.018", nevado_at: "$3.715" },
  { label: "Tamaño", arena_mt: "Compacto", arena_at: "Compacto", nevado_mt: "Mediano", nevado_at: "Mediano" },
];

const models = [
  { key: "arena_mt", name: "Arena MT" },
  { key: "arena_at", name: "Arena AT" },
  { key: "nevado_mt", name: "Nevado MT" },
  { key: "nevado_at", name: "Nevado AT" },
];

const ComparisonSection = () => (
  <section className="py-20 md:py-28 bg-secondary/30">
    <div className="container">
      <div className="text-center">
        <h2 className="section-title">¿Cuál Nevado o Arena es para ti?</h2>
        <p className="section-subtitle">Los modelos más consultados, lado a lado</p>
        <div className="teal-underline mx-auto" />
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="p-3 text-left rounded-tl-lg" />
              {models.map((m, i) => (
                <th key={m.key} className={`p-3 text-center font-heading font-bold text-base ${i === models.length - 1 ? "rounded-tr-lg" : ""}`}>
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-card" : "bg-secondary/50"}>
                <td className="p-3 font-semibold text-muted-foreground">{row.label}</td>
                {models.map((m) => (
                  <td key={m.key} className="p-3 text-center">
                    {(row as Record<string, string>)[m.key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-card">
              <td className="p-3 font-semibold text-muted-foreground">Consultar</td>
              {models.map((m) => (
                <td key={m.key} className="p-3 text-center">
                  <a
                    href={waLink(waModelMessage(m.name))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/80 transition-colors"
                  >
                    <MessageCircle size={16} />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-center text-muted-foreground text-xs mt-4">
        * Cuotas referenciales del catálogo Feb 2026. Sujetas a cambios.
      </p>
    </div>
  </section>
);

export default ComparisonSection;
