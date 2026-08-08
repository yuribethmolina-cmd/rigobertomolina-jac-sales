import { CarModel, waLink, waModelMessage } from "@/lib/constants";
import { trackContact } from "@/lib/track";
import { Cog, Compass, ArrowRight } from "lucide-react";

interface Props {
  model: CarModel;
}

const ModelCard = ({ model }: Props) => {
  return (
    <div className="card-glow p-0 flex flex-col overflow-hidden border-t-2 border-primary hover:scale-[1.02] transition-transform duration-200">
      {/* Image */}
      <div className="relative h-52 bg-muted/30 flex items-center justify-center text-muted-foreground text-sm overflow-hidden">
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
        {model.referentialImage && (
          <span className="absolute bottom-2 left-2 z-10 text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
            📷 Imagen referencial · Consultar disponibilidad
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-y-2">
        <h3 className="font-heading text-2xl font-bold mt-3">{model.name}</h3>
        <p className="text-muted-foreground text-sm">{model.tagline}</p>

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
                <p className="text-lg">
                  <span className="text-muted-foreground text-sm">💳 Compra Directa:</span>{" "}
                  <span className="font-heading font-bold text-foreground">{model.priceDirecta}</span>
                </p>
              )}
              {model.priceFacil && (
                <p className="text-sm">
                  <span className="text-muted-foreground">📅 Pago Fácil:</span>{" "}
                  <span className="font-heading font-bold text-primary">{model.priceFacil}</span>
                </p>
              )}
              <p className="text-xs text-amber-500/80 font-medium mt-1">⚠ Montos referenciales Agosto 2026 · Sujetos a cambio</p>
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
          onClick={() => trackContact("whatsapp", { model: model.name, source: "tarjeta-modelo" })}
          className="mt-auto pt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Consultar este modelo <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default ModelCard;
