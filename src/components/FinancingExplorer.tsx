import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import FinancingOptions from "@/components/FinancingOptions";

/* Explorador de financiamiento: elige configuración → plan → cronograma.
   Todos los datos provienen de src/data (fuente única). No se estima nada. */
const FinancingExplorer = () => {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(vehicles[0]?.id ?? "");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles.slice(0, 8);
    return vehicles
      .filter((v) => v.displayName.toLowerCase().includes(q) || v.category.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query]);

  const selected = vehicles.find((v) => v.id === selectedId);

  return (
    <section id="simulador" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">Simulador de pagos</h2>
          <p className="section-subtitle">Elige la configuración y el plan para ver su cronograma oficial</p>
          <div className="teal-underline mx-auto" />
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          <label className="relative block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar modelo o configuración"
              className="w-full rounded-xl border border-primary/25 bg-card pl-9 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {results.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(v.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  selectedId === v.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-primary/25 text-muted-foreground hover:text-primary hover:border-primary/50"
                }`}
              >
                {v.displayName}
              </button>
            ))}
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin resultados para esa búsqueda.</p>
            )}
          </div>

          {selected && <FinancingOptions vehicle={selected} source="simulador" />}
        </div>
      </div>
    </section>
  );
};

export default FinancingExplorer;
