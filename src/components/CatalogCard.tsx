import { Link } from "react-router-dom";
import { waLink, waModelMessage } from "@/lib/constants";
import { modelPath } from "@/lib/modelLinks";
import ShareModelButton from "@/components/ShareModelButton";
import catalogSpecs from "@/lib/catalogSpecs";
import { ChevronDown } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { pagoFacilMonthly, compraDirectaMonthly, financingOptionsFor } from "@/data/vehicleFinancing";
import { fmtUsd0, NOT_VERIFIED_LABEL } from "@/data/financingPlans";
import { Plus } from "lucide-react";

interface Props {
  vehicle: Vehicle;
  isExpanded: boolean;
  onToggle: () => void;
}

const CatalogCard = ({ vehicle, isExpanded, onToggle }: Props) => {
  const specs = catalogSpecs[vehicle.canonicalName] ?? catalogSpecs[vehicle.aliases[0] ?? ""];
  const pagoFacil = pagoFacilMonthly(vehicle.id);
  const compraDirecta = compraDirectaMonthly(vehicle.id);
  const totalPlans = financingOptionsFor(vehicle.id).length;

  return (
    <div className="group rounded-xl overflow-hidden border border-[hsla(186,100%,39%,0.15)] bg-[hsl(212,52%,13%)] hover:border-primary hover:shadow-[0_0_20px_hsla(186,100%,39%,0.2)] transition-all duration-300 flex flex-col">
      {/* Image — clickable */}
      <div
        className="relative h-[150px] md:h-[180px] bg-[hsl(213,45%,11%)] cursor-pointer"
        onClick={onToggle}
      >
        <img src={vehicle.image} alt={vehicle.displayName} className="w-full h-full object-cover" loading="lazy" />
        {vehicle.featured && (
          <span className="absolute top-3 left-3 z-10 px-3 py-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
            ⭐ {vehicle.featured}
          </span>
        )}
        <span className="absolute top-3 right-3 text-[10px] text-muted-foreground/40 font-bold tracking-widest select-none">
          JAC | bel
        </span>
        {vehicle.referentialImage && (
          <span className="absolute bottom-8 right-3 text-[9px] text-muted-foreground bg-background/70 px-2 py-0.5 rounded">
            📷 Imagen referencial
          </span>
        )}
        {/* Chevron indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <ChevronDown
            size={18}
            className={`text-primary/70 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading text-base md:text-lg font-bold uppercase leading-tight text-foreground">
          {vehicle.displayName}
        </h3>
        {vehicle.tagline && (
          <p className="text-muted-foreground text-[13px] mt-1 line-clamp-1">{vehicle.tagline}</p>
        )}

        {/* Discoverable specs button */}
        {specs && (
          <button
            onClick={onToggle}
            className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 border ${
              isExpanded
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-primary/5 border-primary/20 text-primary/80 hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
            }`}
          >
            Ver especificaciones
            <ChevronDown size={13} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
          </button>
        )}

        {/* Expandable specs panel */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isExpanded && specs ? `${specs.length * 40 + 32}px` : "0px",
            opacity: isExpanded && specs ? 1 : 0,
          }}
        >
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3"
            style={{
              background: "rgba(0, 181, 200, 0.05)",
              borderTop: "1px solid rgba(0, 181, 200, 0.2)",
              borderBottom: "1px solid rgba(0, 181, 200, 0.2)",
              padding: "12px 16px",
            }}
          >
            {specs?.map((s) => (
              <div key={s.label}>
                <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <span className="block text-[13px] font-bold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referencia de financiamiento — Compra Directa primero, Pago Fácil segundo */}
        <div className="mt-3 mb-4 flex flex-wrap items-center gap-1.5">
          {compraDirecta && (
            <span className="pill">💳 Compra Directa {fmtUsd0(compraDirecta)}/mes</span>
          )}
          {pagoFacil && (
            <span className="pill">📅 Pago Fácil {fmtUsd0(pagoFacil)}/mes</span>
          )}
          {!compraDirecta && !pagoFacil && (
            <span className="pill">{NOT_VERIFIED_LABEL}</span>
          )}
          {totalPlans > 0 && (
            <Link
              to={modelPath(vehicle.id)}
              className="inline-flex items-center gap-0.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors"
              title="Ver todos los métodos de pago"
            >
              <Plus size={11} />
              {totalPlans} métodos de pago
            </Link>
          )}
        </div>

        {/* CTA buttons */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            to={modelPath(vehicle.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary h-10 px-3 font-heading text-sm font-bold hover:bg-primary/20 transition-colors"
          >
            Ver opciones de financiamiento
          </Link>
          <div className="flex gap-2">
            <a
              href={waLink(waModelMessage(vehicle.displayName))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[3] inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary h-10 px-3 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              WhatsApp
            </a>
            <ShareModelButton model={vehicle.displayName} slug={vehicle.id} compact />
            {vehicle.fichaUrl && (
              <a
                href={vehicle.fichaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[2] inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary text-primary h-10 px-3 font-heading text-sm font-bold hover:bg-primary/10 transition-colors"
              >
                Ver ficha
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CatalogCard;
