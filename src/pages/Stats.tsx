import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MessageCircle, Copy, FileDown, BarChart3 } from "lucide-react";

interface Row {
  count: number;
  action?: string;
  model?: string;
  plan?: string;
  day?: string;
}

interface Stats {
  total: number;
  whatsapp: number;
  by_action: Row[];
  by_model: Row[];
  by_plan: Row[];
  by_day: Row[];
}

const ACTION_LABEL: Record<string, string> = {
  whatsapp: "Mensajes de WhatsApp abiertos",
  copy: "Mensajes copiados",
  pdf: "Cotizaciones descargadas",
  email: "Correos",
  call: "Llamadas",
};

const ACTION_ICON: Record<string, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  copy: Copy,
  pdf: FileDown,
};

const RANGES = [7, 30, 90] as const;

const Stats = () => {
  const [days, setDays] = useState<number>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .rpc("contact_stats", { days })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("contact_stats failed:", error.message);
          setStats(null);
        } else {
          setStats(data as unknown as Stats);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [days]);

  const maxDay = Math.max(1, ...(stats?.by_day ?? []).map((d) => d.count));

  return (
    <>
      <Helmet>
        <title>Estadísticas de contacto · Rigoberto Molina</title>
        <meta name="description" content="Panel de estadísticas de contactos generados desde el sitio." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="section-container py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl font-bold mt-6 flex items-center gap-3">
          <BarChart3 className="text-primary" /> Estadísticas de contacto
        </h1>
        <p className="text-muted-foreground mt-2">
          Personas que iniciaron contacto desde la página (WhatsApp, mensajes copiados y cotizaciones descargadas).
        </p>

        <div className="flex gap-2 mt-6">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              className={`px-4 py-2 rounded-lg text-sm font-heading font-bold border-2 transition-colors ${
                days === r ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-foreground"
              }`}
            >
              {r} días
            </button>
          ))}
        </div>

        {loading && <p className="mt-10 text-muted-foreground">Cargando datos...</p>}

        {!loading && stats && (
          <div className="mt-8 space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card-glow p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Contactos totales</p>
                <p className="font-heading text-4xl font-bold text-primary mt-2">{stats.total}</p>
              </div>
              <div className="card-glow p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Por WhatsApp</p>
                <p className="font-heading text-4xl font-bold text-primary mt-2">{stats.whatsapp}</p>
              </div>
            </div>

            <section>
              <h2 className="font-heading text-xl font-bold mb-3">Por tipo de acción</h2>
              <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {stats.by_action.length === 0 && (
                  <p className="px-4 py-4 text-sm text-muted-foreground">Aún no hay contactos registrados.</p>
                )}
                {stats.by_action.map((r) => {
                  const Icon = ACTION_ICON[r.action ?? ""] ?? BarChart3;
                  return (
                    <div key={r.action} className="flex items-center justify-between px-4 py-3">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon size={16} /> {ACTION_LABEL[r.action ?? ""] ?? r.action}
                      </span>
                      <span className="font-heading font-bold">{r.count}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold mb-3">Modelos más consultados</h2>
              <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {stats.by_model.length === 0 && (
                  <p className="px-4 py-4 text-sm text-muted-foreground">Sin datos todavía.</p>
                )}
                {stats.by_model.map((r) => (
                  <div key={r.model} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">{r.model}</span>
                    <span className="font-heading font-bold">{r.count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold mb-3">Planes más solicitados</h2>
              <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {stats.by_plan.length === 0 && (
                  <p className="px-4 py-4 text-sm text-muted-foreground">Sin datos todavía.</p>
                )}
                {stats.by_plan.map((r) => (
                  <div key={r.plan} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">{r.plan}</span>
                    <span className="font-heading font-bold">{r.count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold mb-3">Contactos por día</h2>
              <div className="space-y-2">
                {stats.by_day.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
                )}
                {stats.by_day.map((d) => (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">{d.day}</span>
                    <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(d.count / maxDay) * 100}%` }} />
                    </div>
                    <span className="text-xs font-heading font-bold w-8 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {!loading && !stats && (
          <p className="mt-10 text-muted-foreground">No se pudieron cargar las estadísticas. Intenta de nuevo.</p>
        )}
      </main>
    </>
  );
};

export default Stats;
