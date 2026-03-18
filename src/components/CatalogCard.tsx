import { waLink, waModelMessage } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import type { CatalogModel } from "./ModelsSection";

interface Props {
  model: CatalogModel;
  showCD?: boolean;
}

const CatalogCard = ({ model, showCD }: Props) => {
  const hasPriceCD = model.priceCD && model.priceCD !== "Consultar";
  const hasPricePF = model.pricePF && model.pricePF !== "Consultar";

  return (
    <a
      href={waLink(waModelMessage(model.name))}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative rounded-2xl overflow-hidden border border-border/50 h-[180px] md:h-[220px] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(213,45%,12%)] hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.35)] transition-all duration-300"
    >
      {/* Featured badge */}
      {model.featured && (
        <span className="absolute top-3 left-3 z-20 px-3 py-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
          ⭐ {model.featured}
        </span>
      )}

      {/* JAC | bel watermark */}
      <span className="absolute top-3 right-4 z-10 text-[10px] text-muted-foreground/40 font-bold tracking-widest select-none">
        JAC | bel
      </span>

      {/* Car image */}
      <div className="absolute inset-y-0 right-0 w-[60%] flex items-center justify-center">
        <img
          src={model.image}
          alt={model.name}
          className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Referential image note */}
      {model.referentialImage && (
        <span className="absolute bottom-2 right-3 z-10 text-[9px] text-muted-foreground bg-background/70 px-2 py-0.5 rounded">
          📷 Imagen referencial
        </span>
      )}

      {/* Text overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(213,45%,8%)] via-[hsl(213,45%,8%)/0.7] to-transparent z-10" />

      <div className="relative z-20 h-full flex flex-col justify-end p-5 max-w-[55%]">
        <h3 className="font-heading text-lg md:text-xl font-bold uppercase leading-tight text-foreground">
          {model.name}
        </h3>

        {model.tagline && (
          <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{model.tagline}</p>
        )}

        {/* Price pills */}
        <div className="flex flex-wrap gap-2 mt-2.5">
          {showCD && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-secondary/80 px-2.5 py-1 rounded-full">
              💳 CD: <strong className="text-foreground">{model.priceCD || "Consultar"}</strong>
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] bg-primary/15 px-2.5 py-1 rounded-full">
            📅 PF: <strong className="text-primary">{hasPricePF ? model.pricePF : "Consultar"}</strong>
          </span>
        </div>
      </div>

      {/* Hover CTA overlay */}
      <div className="absolute inset-x-0 bottom-0 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="bg-primary px-5 py-3 flex items-center justify-center gap-2 font-heading text-sm font-bold text-primary-foreground">
          Consultar por WhatsApp <ArrowRight size={16} />
        </div>
      </div>
    </a>
  );
};

export default CatalogCard;
