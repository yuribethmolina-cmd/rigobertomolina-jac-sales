import { useState } from "react";
import { commercialModels, truckModels, pickupModels, suvModels } from "@/lib/constants";
import ModelCard from "./ModelCard";

const tabs = ["SUVs", "Pickups", "Comerciales", "Camiones"] as const;
type Tab = (typeof tabs)[number];

const tabData: Record<Tab, typeof suvModels> = {
  Comerciales: commercialModels,
  Camiones: truckModels,
  Pickups: pickupModels,
  SUVs: suvModels,
};

const ModelsSection = () => {
  const [active, setActive] = useState<Tab>("SUVs");

  return (
    <section id="modelos" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Modelos disponibles</h2>
          <p className="section-subtitle">Encuentra el JAC que va contigo — haz clic para consultar</p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mt-10 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-6 py-2.5 rounded-lg font-heading font-bold text-sm transition-colors ${
                active === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-10">
          <div className="grid md:grid-cols-2 gap-6">
            {tabData[active].map((m) => (
              <ModelCard key={m.name} model={m} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelsSection;
