import { useState } from "react";
import CatalogCard from "./CatalogCard";
import { vehicleCategories, vehiclesByCategory, type VehicleCategory } from "@/data/vehicles";

const ModelsSection = () => {
  const [active, setActive] = useState<VehicleCategory>("SUV");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedModel((prev) => (prev === id ? null : id));
  };

  const handleTabChange = (tab: VehicleCategory) => {
    setActive(tab);
    setExpandedModel(null);
  };

  return (
    <section id="modelos" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">Modelos disponibles</h2>
          <p className="section-subtitle">Encuentra el JAC que va contigo — haz clic para consultar</p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Tabs — scroll horizontal en mobile */}
        <div className="mt-10 overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max mx-auto px-1 justify-start md:justify-center">
            {vehicleCategories.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2.5 rounded-lg font-heading font-bold text-sm tracking-wide transition-all duration-200 ${
                  active === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-[hsl(212,52%,13%)] text-muted-foreground hover:text-primary border border-[hsla(186,100%,39%,0.15)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehiclesByCategory(active).map((vehicle) => (
            <CatalogCard
              key={vehicle.id}
              vehicle={vehicle}
              isExpanded={expandedModel === vehicle.id}
              onToggle={() => handleToggle(vehicle.id)}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Los montos mostrados corresponden a una etapa concreta de un plan de pago, no al precio total del
          vehículo. Consulta el cronograma completo en cada modelo.
        </p>
      </div>
    </section>
  );
};

export default ModelsSection;
