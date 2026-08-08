import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Copy, FileDown, BarChart3, Download, History } from "lucide-react";


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

interface AuditRow {
  id: string;
  event: string;
  user_email: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const EVENT_LABEL: Record<string, string> = {
  stats_view: "Acceso al panel",
  export_download: "Exportación descargada",
};

const Stats = () => {
  const [days, setDays] = useState<number>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AuditRow[]>([]);

  const loadAudit = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_audit_log")
      .select("id, event, user_email, details, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("audit log read failed:", error.message);
      return;
    }
    setAudit((data ?? []) as unknown as AuditRow[]);
  }, []);

  // Registra el acceso al panel una sola vez por sesión de página
  useEffect(() => {
    logAudit("stats_view", { range_days: days }).then(loadAudit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleExport = async () => {
    if (!stats) return;
    const rows: string[][] = [["seccion", "clave", "valor"]];
    rows.push(["resumen", "contactos_totales", String(stats.total)]);
    rows.push(["resumen", "whatsapp", String(stats.whatsapp)]);
    stats.by_action.forEach((r) => rows.push(["accion", r.action ?? "", String(r.count)]));
    stats.by_model.forEach((r) => rows.push(["modelo", r.model ?? "", String(r.count)]));
    stats.by_plan.forEach((r) => rows.push(["plan", r.plan ?? "", String(r.count)]));
    stats.by_day.forEach((r) => rows.push(["dia", r.day ?? "", String(r.count)]));

    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estadisticas-${days}dias-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    await logAudit("export_download", { format: "csv", range_days: days, rows: rows.length - 1 });
    await loadAudit();
    toast.success("Exportación descargada y registrada en la auditoría.");
  };

  const maxDay = Math.max(1, ...(stats?.by_day ?? []).map((d) => d.count));


  return (
    <>
      <Helmet>
        <title>Estadísticas de contacto · Rigoberto Molina</title>
        <meta name="description" content="Panel de estadísticas de contactos generados desde el sitio." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="section-container py-16">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-heading font-bold text-muted-foreground hover:text-primary"
          >
            Cerrar sesión
          </button>
        </div>


        <h1 className="font-heading text-3xl md:text-4xl font-bold mt-6 flex items-center gap-3">
          <BarChart3 className="text-primary" /> Estadísticas de contacto
        </h1>
        <p className="text-muted-foreground mt-2">
          Personas que iniciaron contacto desde la página (WhatsApp, mensajes copiados y cotizaciones descargadas).
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-6">
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
          <button
            type="button"
            onClick={handleExport}
            disabled={!stats}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-bold bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Download size={16} /> Exportar CSV
          </button>
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

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold mb-3 flex items-center gap-2">
            <History size={18} className="text-primary" /> Registro de auditoría
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Últimos 50 accesos al panel y descargas de exportaciones, con fecha y hora.
          </p>
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            {audit.length === 0 && (
              <p className="px-4 py-4 text-sm text-muted-foreground">Sin registros todavía.</p>
            )}
            {audit.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="text-sm font-heading font-bold">
                  {EVENT_LABEL[row.event] ?? row.event}
                </span>
                <span className="text-xs text-muted-foreground">{row.user_email ?? "Cuenta sin correo"}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString("es-VE")}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );


        {!loading && !stats && (
          <p className="mt-10 text-muted-foreground">No se pudieron cargar las estadísticas. Intenta de nuevo.</p>
        )}
      </main>
    </>
  );
};

export default Stats;
