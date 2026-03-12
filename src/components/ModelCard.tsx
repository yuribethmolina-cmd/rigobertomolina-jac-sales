import { useState } from "react";
import { CarModel, waLink, waModelMessage } from "@/lib/constants";
import { Cog, Compass, ArrowRight, ChevronDown, Fuel, Gauge, Shield, Cpu, Wrench, Ruler } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Props {
  model: CarModel;
}

const SpecRow = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  ) : null;

const SpecList = ({ icon: Icon, title, items }: { icon: React.ElementType; title: string; items?: string[] }) =>
  items && items.length > 0 ? (
    <div className="mt-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1">
        <Icon size={14} /> {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground pl-5">• {item}</li>
        ))}
      </ul>
    </div>
  ) : null;

const ModelCard = ({ model }: Props) => {
  const [open, setOpen] = useState(false);
  const specs = model.specs;

  return (
    <div className="card-glow p-5 flex flex-col">
      {model.featured && (
        <span className="self-start mb-3 px-3 py-1 text-xs font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
          ⭐ {model.featured}
        </span>
      )}

      {/* Image */}
      <div className="aspect-video bg-muted/30 rounded-lg mb-4 flex items-center justify-center text-muted-foreground text-sm overflow-hidden">
        {model.image ? (
          <img
            src={`/src/assets/${model.image}.jpeg`}
            alt={model.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          "Foto del modelo"
        )}
      </div>

      <h3 className="font-heading text-2xl font-bold">{model.name}</h3>
      <p className="text-muted-foreground italic text-sm mt-1">{model.tagline}</p>

      <div className="flex gap-3 mt-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full">
          <Cog size={13} /> {model.transmission}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full">
          <Compass size={13} /> {model.traction}
        </span>
        {specs?.combustible && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full">
            <Fuel size={13} /> {specs.combustible}
          </span>
        )}
      </div>

      {model.colors && (
        <div className="flex gap-2 mt-4">
          {model.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="w-5 h-5 rounded-full border border-border"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      )}

      <p className="mt-4 font-heading text-lg font-bold text-primary">
        {model.price ? `Cuota desde ${model.price} *` : "Precio: Consultar"}
      </p>

      {/* Expandable specs */}
      {specs && (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
          <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-semibold text-primary hover:text-primary/80 transition-colors py-2 border-t border-border/50">
            <span>{open ? "Ocultar especificaciones" : "Ver especificaciones"}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-1">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-1">
              {/* Motor section */}
              {(specs.motor || specs.potencia || specs.torque) && (
                <div className="mb-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1">
                    <Gauge size={14} /> Motor
                  </p>
                  <SpecRow label="Motor" value={specs.motor} />
                  <SpecRow label="Potencia" value={specs.potencia} />
                  <SpecRow label="Torque" value={specs.torque} />
                  <SpecRow label="Transmisión" value={specs.transmisionDetalle} />
                  <SpecRow label="Tanque" value={specs.tanque} />
                </div>
              )}

              {/* Dimensions */}
              {(specs.dimensiones || specs.capacidadCarga || specs.pesoNeto) && (
                <div className="mb-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1">
                    <Ruler size={14} /> Dimensiones
                  </p>
                  <SpecRow label="Dimensiones" value={specs.dimensiones} />
                  <SpecRow label="Capacidad de carga" value={specs.capacidadCarga} />
                  <SpecRow label="Peso neto" value={specs.pesoNeto} />
                </div>
              )}

              {/* Suspension / Brakes */}
              {(specs.suspension || specs.frenos) && (
                <div className="mb-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1">
                    <Wrench size={14} /> Suspensión y frenos
                  </p>
                  {specs.suspension?.map((s, i) => (
                    <p key={i} className="text-sm text-muted-foreground pl-5">• {s}</p>
                  ))}
                  <SpecRow label="Frenos" value={specs.frenos} />
                </div>
              )}

              <SpecList icon={Shield} title="Seguridad" items={specs.seguridad} />
              <SpecList icon={Cpu} title="Tecnología" items={specs.tecnologia} />
              <SpecList icon={Wrench} title="Equipamiento" items={specs.equipamiento} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <a
        href={waLink(waModelMessage(model.name))}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        Consultar este modelo <ArrowRight size={16} />
      </a>
    </div>
  );
};

export default ModelCard;
