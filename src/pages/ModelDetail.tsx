import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, AlertTriangle, FileText } from "lucide-react";
import { findVehicle } from "@/data/vehicles";
import { pagoFacilMonthly } from "@/data/vehicleFinancing";
import { FINANCING_DISCLAIMER, NOT_VERIFIED_LABEL, fmtUsd0 } from "@/data/financingPlans";
import FinancingOptions from "@/components/FinancingOptions";
import ShareModelButton from "@/components/ShareModelButton";
import FooterSection from "@/components/FooterSection";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import catalogSpecs from "@/lib/catalogSpecs";
import { SITE_URL } from "@/lib/modelLinks";

const ModelDetail = () => {
  const { slug } = useParams();
  const vehicle = findVehicle(slug);

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-heading text-2xl font-bold">Modelo no encontrado</h1>
        <p className="text-muted-foreground">Es posible que el enlace haya cambiado.</p>
        <Link to="/" className="text-primary font-bold underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const cuota = pagoFacilMonthly(vehicle.id);
  const specs = catalogSpecs[vehicle.canonicalName] ?? catalogSpecs[vehicle.displayName];
  const url = `${SITE_URL}/modelo/${vehicle.id}`;
  const description = cuota
    ? `${vehicle.displayName}: cuota Pago Fácil desde ${fmtUsd0(cuota)} al mes. Planes de financiamiento JAC en Caracas con Rigoberto Molina.`
    : `${vehicle.displayName}: planes de financiamiento JAC en Caracas con Rigoberto Molina. Consulta condiciones actualizadas.`;

  return (
    <>
      <Helmet>
        <title>{`${vehicle.displayName} · Precios y formas de pago`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={`${vehicle.displayName} · Planes de pago JAC`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main className="min-h-screen pb-16">
        <div className="section-container pt-8">
          <Link to="/#modelos" className="inline-flex items-center gap-2 text-sm text-primary font-bold">
            <ArrowLeft size={16} /> Volver al catálogo
          </Link>

          <div className="mt-6 rounded-2xl overflow-hidden border border-primary/20">
            <img
              src={vehicle.image}
              alt={`${vehicle.displayName} — JAC Venezuela`}
              className="w-full h-[220px] md:h-[340px] object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{vehicle.category}</p>
              <h1 className="font-heading text-2xl md:text-4xl font-bold uppercase mt-1">
                {vehicle.displayName}
              </h1>
              {vehicle.tagline && <p className="text-muted-foreground mt-2">{vehicle.tagline}</p>}
            </div>
            <div className="flex gap-2">
              <ShareModelButton model={vehicle.displayName} slug={vehicle.id} />
              {vehicle.fichaUrl && (
                <a
                  href={vehicle.fichaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-5 py-3 font-heading text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  <FileText size={15} /> Ver ficha
                </a>
              )}
            </div>
          </div>

          {/* Cuota destacada */}
          <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pago Fácil · cuota mensual</p>
            <p className="font-heading text-2xl font-bold text-primary mt-1">
              {cuota ? `${fmtUsd0(cuota)} / mes` : NOT_VERIFIED_LABEL}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Corresponde a cada una de las 12 cuotas mensuales, no al precio total del vehículo.
            </p>
          </div>

          {vehicle.sourceStatus === "REVIEW_NOT_VERIFIED" && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Esta configuración no aparece en los catálogos del 17 de agosto. Consulta disponibilidad y
                condiciones vigentes por WhatsApp.
              </p>
            </div>
          )}

          {/* Especificaciones */}
          {specs && (
            <section className="mt-8">
              <h2 className="font-heading text-xl font-bold">Especificaciones</h2>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-xl border border-primary/15 p-5">
                {specs.map((s) => (
                  <div key={s.label}>
                    <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </span>
                    <span className="block text-sm font-bold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Planes */}
          <FinancingOptions vehicle={vehicle} source="detalle-modelo" />

          <p className="mt-8 text-xs text-muted-foreground leading-relaxed">{FINANCING_DISCLAIMER}</p>
        </div>
      </main>

      <FooterSection />
      <WhatsAppFloat />
    </>
  );
};

export default ModelDetail;
