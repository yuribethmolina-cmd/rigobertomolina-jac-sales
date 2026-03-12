import { useState } from "react";
import { suvModels, pickupModels, commercialModels, waLink } from "@/lib/constants";
import ModelCard from "./ModelCard";
import { ArrowRight } from "lucide-react";

const tabs = ["SUVs", "Camionetas", "Comerciales"] as const;
type Tab = (typeof tabs)[number];

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
        <div className="flex justify-center gap-2 mt-10">
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
          {active === "SUVs" && (
            <div className="grid md:grid-cols-2 gap-6">
              {suvModels.map((m) => (
                <ModelCard key={m.name} model={m} />
              ))}
            </div>
          )}

          {active === "Camionetas" && (
            <div className="grid md:grid-cols-2 gap-6">
              {pickupModels.map((m) => (
                <ModelCard key={m.name} model={m} />
              ))}
            </div>
          )}

          {active === "Comerciales" && (
            <div className="card-glow p-6 md:p-8 max-w-2xl mx-auto">
              <div className="space-y-4">
                {commercialModels.map((m) => (
                  <div key={m.name} className="flex items-center gap-3 text-foreground">
                    <span className="text-2xl">{m.icon}</span>
                    <span className="font-heading font-bold">{m.name}</span>
                    <span className="text-muted-foreground">— {m.desc}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-border pt-6 text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  ¿Buscas un vehículo comercial para tu empresa?
                  <br />
                  Contáctame directamente — tengo opciones de chasis, camiones y vehículos especiales.
                </p>
                <a
                  href={waLink("Hola Rigoberto, me interesa un vehículo comercial. ¿Puedes darme más información?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-heading font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Consultar vehículos comerciales <ArrowRight size={16} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ModelsSection;
