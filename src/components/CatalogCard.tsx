import { waLink, waModelMessage } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import type { CatalogModel } from "./ModelsSection";

interface Props {
  model: CatalogModel;
}

const CatalogCard = ({ model }: Props) => {
  const hasCD = model.priceCD && model.priceCD !== "Consultar";
  const hasPF = model.pricePF && model.pricePF !== "Consultar";

  return (
    <div className="group rounded-xl overflow-hidden border border-[hsla(186,100%,39%,0.15)] bg-[hsl(212,52%,13%)] hover:border-primary hover:shadow-[0_0_20px_hsla(186,100%,39%,0.2)] transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-[150px] md:h-[180px] bg-[hsl(213,45%,11%)]">
        <img src={model.image} alt={model.name} className="w-full h-full object-cover" loading="lazy" />
        {model.featured && (
          <span className="absolute top-3 left-3 z-10 px-3 py-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
            ⭐ {model.featured}
          </span>
        )}
        <span className="absolute top-3 right-3 text-[10px] text-muted-foreground/40 font-bold tracking-widest select-none">
          JAC | bel
        </span>
        {model.referentialImage && (
          <span className="absolute bottom-2 right-3 text-[9px] text-muted-foreground bg-background/70 px-2 py-0.5 rounded">
            📷 Imagen referencial
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading text-base md:text-lg font-bold uppercase leading-tight text-foreground">
          {model.name}
        </h3>
        {model.tagline && (
          <p className="text-muted-foreground text-[13px] italic mt-1 line-clamp-1">{model.tagline}</p>
        )}

        {/* Price pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {hasCD && (
            <span className="pill">💳 CD ${model.priceCD}</span>
          )}
          {hasPF && (
            <span className="pill">📅 {hasCD ? "PF" : "Pago Fácil"} ${model.pricePF}</span>
          )}
          {!hasCD && !hasPF && (
            <span className="pill">💬 Consultar precio</span>
          )}
        </div>

        {/* CTA */}
        <a
          href={waLink(waModelMessage(model.name))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Consultar por WhatsApp <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default CatalogCard;
