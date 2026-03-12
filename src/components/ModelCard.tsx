import { CarModel, waLink, waModelMessage } from "@/lib/constants";
import { Cog, Compass, ArrowRight } from "lucide-react";

interface Props {
  model: CarModel;
}

const ModelCard = ({ model }: Props) => (
  <div className="card-glow p-5 flex flex-col">
    {model.featured && (
      <span className="self-start mb-3 px-3 py-1 text-xs font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
        ⭐ {model.featured}
      </span>
    )}

    {/* Image placeholder */}
    <div className="aspect-video bg-muted/30 rounded-lg mb-4 flex items-center justify-center text-muted-foreground text-sm">
      Foto del modelo
    </div>

    <h3 className="font-heading text-2xl font-bold">{model.name}</h3>
    <p className="text-muted-foreground italic text-sm mt-1">{model.tagline}</p>

    <div className="flex gap-3 mt-4">
      <span className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full">
        <Cog size={13} /> {model.transmission}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full">
        <Compass size={13} /> {model.traction}
      </span>
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

export default ModelCard;
