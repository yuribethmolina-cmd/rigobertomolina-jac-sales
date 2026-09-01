import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { allCatalogModels, catalogCategoryOf, type CatalogModel } from "@/components/ModelsSection";
import { morePlans } from "@/components/MorePlansSection";
import catalogSpecs from "@/lib/catalogSpecs";
import {
  planModels,
  fmtMoney,
  buildDirectaSchedule,
  buildFacilSchedule,
  type ScheduleRow,
} from "@/lib/paymentPlans";
import { slugify, normalizeName, modelPath, SITE_URL } from "@/lib/modelLinks";
import { waLink } from "@/lib/constants";
import WhatsAppButton from "@/components/WhatsAppButton";
import ShareModelButton from "@/components/ShareModelButton";
import FooterSection from "@/components/FooterSection";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const DISCLAIMER = "* Montos referenciales Agosto 2026. Sujetos a variación.";

const findCatalogModel = (slug?: string): CatalogModel | undefined =>
  allCatalogModels.find((m) => slugify(m.name) === slug);

const findPlanModel = (name: string) => {
  const n = normalizeName(name);
  return planModels.find((p) => {
    const pn = normalizeName(p.modelo);
    return pn === n || n.startsWith(pn) || pn.startsWith(n);
  });
};

const findExtraQuotas = (name: string) => {
  const n = normalizeName(name);
  return morePlans
    .map((plan) => {
      const match = plan.models.find((m) => {
        const mn = normalizeName(m.model);
        return mn === n || n.startsWith(mn) || mn.startsWith(n);
      });
      return match ? { plan, quota: match } : null;
    })
    .filter((x): x is { plan: (typeof morePlans)[number]; quota: { model: string; cuota: number; cuota2?: number } } => !!x);
};

const ScheduleTable = ({ rows, title }: { rows: ScheduleRow[]; title: string }) => (
  <div className="rounded-xl border border-primary/20 overflow-hidden">
    <div className="px-4 py-2.5 bg-primary/10 font-heading text-sm font-bold text-primary">{title}</div>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground text-xs uppercase tracking-wider">
          <th className="text-left px-4 py-2 font-medium">Pago</th>
          <th className="text-right px-4 py-2 font-medium">Monto</th>
          <th className="text-right px-4 py-2 font-medium">Acumulado</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-t border-primary/10">
            <td className="px-4 py-2 text-foreground">{r.label}</td>
            <td className="px-4 py-2 text-right font-bold text-foreground">{fmtMoney(r.amount)}</td>
            <td className="px-4 py-2 text-right text-muted-foreground">{fmtMoney(r.cumulative)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ModelDetail = () => {
  const { slug } = useParams();
  const model = useMemo(() => findCatalogModel(slug), [slug]);
  const [openSchedule, setOpenSchedule] = useState<"directa" | "facil" | null>(null);

  if (!model) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Helmet>
          <title>Modelo no encontrado · Rigoberto Molina</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1 className="font-heading text-3xl font-bold">Modelo no encontrado</h1>
        <p className="text-muted-foreground">Es posible que el enlace esté desactualizado.</p>
        <Link to="/" className="text-primary font-bold underline">
          Ver el catálogo completo
        </Link>
      </main>
    );
  }

  const plan = findPlanModel(model.name);
  const extras = findExtraQuotas(model.name);
  const specs = catalogSpecs[model.name];
  const category = catalogCategoryOf(model.name);
  const canonical = `${SITE_URL}${modelPath(model.name)}`;
  const hasCD = model.priceCD && model.priceCD !== "Consultar";
  const hasPF = model.pricePF && model.pricePF !== "Consultar";

  const description = `${model.name} JAC en Venezuela${
    hasCD ? ` · Compra Directa desde ${model.priceCD}` : ""
  }${hasPF ? ` · Pago Fácil desde ${model.pricePF}` : ""}. Formas de pago y atención personalizada en Caracas.`;

  const waMessage = `Hola Rigoberto, vi la información del ${model.name}${
    hasCD ? ` (Compra Directa ${model.priceCD})` : ""
  } y quiero conocer las formas de pago disponibles.`;

  const directaRows =
    plan?.cuotaDirecta && plan?.totalDirecta
      ? buildDirectaSchedule(plan.cuotaDirecta, plan.totalDirecta)
      : null;
  const facilRows =
    plan?.cuotaFacil && plan?.totalFacil
      ? buildFacilSchedule(plan.cuotaFacil, plan.totalFacil, plan.afiliacionFacil ?? 999.9, plan.finalFacil)
      : null;

  return (
    <>
      <Helmet>
        <title>{`${model.name} · Precios y formas de pago · JAC Venezuela`.slice(0, 60)}</title>
        <meta name="description" content={description.slice(0, 158)} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={`${model.name} · Precios y formas de pago`} />
        <meta property="og:description" content={description.slice(0, 158)} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={model.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: model.name,
            image: model.image,
            description,
            brand: { "@type": "Brand", name: "JAC" },
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: canonical,
              ...(plan?.totalDirecta ? { price: plan.totalDirecta } : {}),
            },
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-5 py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Volver al catálogo
          </Link>

          <div className="mt-5 rounded-2xl overflow-hidden border border-primary/20">
            <img src={model.image} alt={`${model.name} JAC`} className="w-full h-56 md:h-72 object-cover" />
          </div>

          <header className="mt-6">
            {category && (
              <span className="text-xs uppercase tracking-widest text-primary font-bold">{category}</span>
            )}
            <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase mt-1">{model.name}</h1>
            {model.tagline && <p className="text-muted-foreground mt-2">{model.tagline}</p>}
          </header>

          {/* Precios principales */}
          <section className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Compra Directa · 7 pagos</p>
              <p className="font-heading text-2xl font-bold text-foreground mt-1">
                {hasCD ? model.priceCD : "Consultar"}
              </p>
              {plan?.totalDirecta && (
                <p className="text-sm text-muted-foreground mt-1">Total estimado {fmtMoney(plan.totalDirecta)}</p>
              )}
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Pago Fácil · afiliación + 12 cuotas
              </p>
              <p className="font-heading text-2xl font-bold text-primary mt-1">
                {hasPF ? model.pricePF : "Consultar"}
              </p>
              {plan?.totalFacil && (
                <p className="text-sm text-muted-foreground mt-1">Total estimado {fmtMoney(plan.totalFacil)}</p>
              )}
            </div>
          </section>

          {/* Desglose de cuotas */}
          {(directaRows || facilRows) && (
            <section className="mt-6 space-y-3">
              <h2 className="font-heading text-xl font-bold">Desglose de cuotas</h2>
              <div className="flex flex-wrap gap-2">
                {directaRows && (
                  <button
                    type="button"
                    onClick={() => setOpenSchedule(openSchedule === "directa" ? null : "directa")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      openSchedule === "directa"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-primary/40 text-primary hover:bg-primary/10"
                    }`}
                  >
                    Compra Directa
                  </button>
                )}
                {facilRows && (
                  <button
                    type="button"
                    onClick={() => setOpenSchedule(openSchedule === "facil" ? null : "facil")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      openSchedule === "facil"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-primary/40 text-primary hover:bg-primary/10"
                    }`}
                  >
                    Pago Fácil
                  </button>
                )}
              </div>
              {openSchedule === "directa" && directaRows && (
                <ScheduleTable rows={directaRows} title="Compra Directa · 7 pagos" />
              )}
              {openSchedule === "facil" && facilRows && (
                <ScheduleTable rows={facilRows} title="Pago Fácil · afiliación + 12 cuotas + pago previo a la entrega" />
              )}
            </section>
          )}

          {/* Planes adicionales */}
          {extras.length > 0 && (
            <section className="mt-8">
              <h2 className="font-heading text-xl font-bold">Otros planes disponibles</h2>
              <div className="mt-3 space-y-3">
                {extras.map(({ plan: p, quota }) => (
                  <div key={p.id} className="rounded-xl border border-primary/20 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-heading font-bold text-foreground">{p.title}</p>
                        <p className="text-sm text-muted-foreground">{p.tagline}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{p.cuotaLabel}</p>
                        <p className="font-heading text-lg font-bold text-primary">{fmtMoney(quota.cuota)}</p>
                        {quota.cuota2 && (
                          <p className="text-xs text-muted-foreground">Segunda etapa {fmtMoney(quota.cuota2)}</p>
                        )}
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {p.structure.map((s) => (
                        <li key={s}>· {s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ficha */}
          {specs && (
            <section className="mt-8">
              <h2 className="font-heading text-xl font-bold">Ficha resumida</h2>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-primary/20 p-4">
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

          <p className="mt-6 text-xs text-amber-500/90 font-medium">{DISCLAIMER}</p>

          {/* CTA */}
          <section className="mt-6 flex flex-wrap gap-3">
            <WhatsAppButton
              message={waMessage}
              label="Consultar por WhatsApp"
              model={model.name}
              source="pagina-modelo"
            />
            <ShareModelButton model={model.name} label="Compartir este enlace" />
            {model.fichaUrl && (
              <a
                href={model.fichaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-5 py-3 font-heading text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                Ficha oficial <ExternalLink size={15} />
              </a>
            )}
          </section>

          <p className="mt-6 text-sm text-muted-foreground">
            ¿Quieres comparar con otros modelos?{" "}
            <Link to="/" className="text-primary font-bold underline">
              Ver el catálogo completo
            </Link>{" "}
            o{" "}
            <a
              href={waLink(`Hola Rigoberto, quiero comparar el ${model.name} con otros modelos.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold underline"
            >
              escríbeme directamente
            </a>
            .
          </p>
        </div>
        <FooterSection />
        <WhatsAppFloat />
      </main>
    </>
  );
};

export default ModelDetail;
