import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AdvisorChat from "@/components/advisor/AdvisorChat";

const Asesor = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Asesor JAC de Rigoberto Molina | Modelos y planes de pago</title>
      <meta
        name="description"
        content="Conversa con el asesor digital de Rigoberto Molina: te recomienda el modelo JAC y el plan de pago según tu presupuesto, con montos referenciales de los catálogos vigentes."
      />
      <link rel="canonical" href="https://rigobertomolina.com/asesor" />
    </Helmet>

    <SiteHeader />

    <main className="mx-auto max-w-3xl px-4 pt-28 md:pt-32">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground md:text-3xl">
        Asesor JAC de Rigoberto
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Respuestas basadas únicamente en los catálogos vigentes de JAC. Si un dato no está
        documentado, te lo digo y lo confirmas con Rigoberto.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <AdvisorChat />
      </div>
    </main>
  </div>
);

export default Asesor;
