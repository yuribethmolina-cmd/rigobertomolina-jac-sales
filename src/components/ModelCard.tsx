import { CarModel, waLink, waModelMessage } from "@/lib/constants";
import { Cog, Compass, ArrowRight } from "lucide-react";

interface Props {
  model: CarModel;
}

const ModelCard = ({ model }: Props) => {
  return (
    <div className="card-glow p-0 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[16/10] bg-muted/30 flex items-center justify-center text-muted-foreground text-sm overflow-hidden">
        {model.featured && (
          <span className="absolute top-3 left-3 z-10 px-3 py-1 text-xs font-bold rounded-full bg-primary/90 text-primary-foreground">
            ⭐ {model.featured}
          </span>
        )}
        {model.image ? (
          <img
            src={model.image}
            alt={model.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          "Foto del modelo"
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-2xl font-bold">{model.name}</h3>
        <p className="text-muted-foreground italic text-sm mt-1">{model.tagline}</p>

        <div className="flex gap-3 mt-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full">
            <Cog size={13} /> {model.transmission}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full">
            <Compass size={13} /> {model.traction}
          </span>
        </div>

        {/* Dual pricing */}
        <div className="mt-4 space-y-1">
          {model.priceDirecta || model.priceFacil ? (
            <>
              {model.priceDirecta && (
                <p className="text-sm">
                  <span className="text-muted-foreground">💳 Compra Directa:</span>{" "}
                  <span className="font-heading font-bold text-primary">{model.priceDirecta}</span>
                </p>
              )}
              {model.priceFacil && (
                <p className="text-sm">
                  <span className="text-muted-foreground">📅 Pago Fácil:</span>{" "}
                  <span className="font-heading font-bold text-amber-400">{model.priceFacil}</span>
                </p>
              )}
            </>
          ) : (
            <p className="font-heading text-lg font-bold text-primary">
              {model.price ? `Cuota desde ${model.price} *` : "Consultar precio"}
            </p>
          )}
        </div>

        <a
          href={waLink(waModelMessage(model.name))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Consultar este modelo <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default ModelCard;
