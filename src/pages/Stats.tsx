import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Copy, FileDown, BarChart3, Download, History, Star, Link2, Trash2, ClipboardList, Inbox } from "lucide-react";


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

interface ReviewRow {
  id: string;
  customer_name: string;
  vehicle_name: string | null;
  rating: number;
  message: string;
  photo_url: string | null;
  approved: boolean;
  created_at: string;
}

interface QuoteRow {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  vehicle_name: string;
  plan_name: string;
  message: string | null;
  status: "nuevo" | "contactado" | "cerrado";
  created_at: string;
}

interface ContactRow {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: "nuevo" | "contactado" | "cerrado";
  created_at: string;
}

const QUOTE_STATUS_LABEL: Record<QuoteRow["status"], string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cerrado: "Cerrado",
};

const QUOTE_STATUS_ORDER: QuoteRow["status"][] = ["nuevo", "contactado", "cerrado"];

import ReviewInviteGenerator from "@/components/ReviewInviteGenerator";

const REVIEW_URL = "https://rigobertomolina.com/resena";

const Stats = () => {
  const [days, setDays] = useState<number>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);

  const loadContacts = useCallback(async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, full_name, phone, email, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("contact_messages read failed:", error.message);
      return;
    }
    setContacts((data ?? []) as unknown as ContactRow[]);
  }, []);

  const setContactStatus = async (row: ContactRow) => {
    const next = QUOTE_STATUS_ORDER[(QUOTE_STATUS_ORDER.indexOf(row.status) + 1) % QUOTE_STATUS_ORDER.length];
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: next })
      .eq("id", row.id);
    if (error) {
      toast.error("No se pudo actualizar el estado.");
      return;
    }
    loadContacts();
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar el mensaje.");
      return;
    }
    toast.success("Mensaje eliminado.");
    loadContacts();
  };

  const loadQuotes = useCallback(async () => {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("id, full_name, phone, email, city, vehicle_name, plan_name, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("quote_requests read failed:", error.message);
      return;
    }
    setQuotes((data ?? []) as unknown as QuoteRow[]);
  }, []);

  const setQuoteStatus = async (row: QuoteRow) => {
    const next = QUOTE_STATUS_ORDER[(QUOTE_STATUS_ORDER.indexOf(row.status) + 1) % QUOTE_STATUS_ORDER.length];
    const { error } = await supabase
      .from("quote_requests")
      .update({ status: next })
      .eq("id", row.id);
    if (error) {
      toast.error("No se pudo actualizar el estado.");
      return;
    }
    loadQuotes();
  };

  const deleteQuote = async (id: string) => {
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar la solicitud.");
      return;
    }
    toast.success("Solicitud eliminada.");
    loadQuotes();
  };

  const loadReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, vehicle_name, rating, message, photo_url, approved, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("reviews read failed:", error.message);
      return;
    }
    setReviews((data ?? []) as unknown as ReviewRow[]);
  }, []);

  useEffect(() => {
    loadReviews();
    loadQuotes();
    loadContacts();
  }, [loadReviews, loadQuotes, loadContacts]);

  const copyReviewLink = async () => {
    try {
      await navigator.clipboard.writeText(REVIEW_URL);
      toast.success("Link de reseñas copiado. Envíalo a tu cliente después de la compra.");
    } catch {
      toast.error(`No se pudo copiar. Copia manualmente: ${REVIEW_URL}`);
    }
  };

  const toggleReviewApproved = async (row: ReviewRow) => {
    const { error } = await supabase
      .from("reviews")
      .update({ approved: !row.approved })
      .eq("id", row.id);
    if (error) {
      toast.error("No se pudo actualizar la reseña.");
      return;
    }
    loadReviews();
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar la reseña.");
      return;
    }
    toast.success("Reseña eliminada.");
    loadReviews();
  };

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
            <Inbox size={18} className="text-primary" /> Mensajes de contacto
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Consultas recibidas desde la página de contacto. Toca el estado para moverlo: Nuevo → Contactado → Cerrado.
          </p>
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            {contacts.length === 0 && (
              <p className="px-4 py-4 text-sm text-muted-foreground">Aún no hay mensajes recibidos.</p>
            )}
            {contacts.map((c) => (
              <div key={c.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-heading font-bold">{c.full_name}</span>
                  <button
                    type="button"
                    onClick={() => setContactStatus(c)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      c.status === "nuevo"
                        ? "border-primary text-primary"
                        : c.status === "contactado"
                          ? "border-amber-500 text-amber-500"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {QUOTE_STATUS_LABEL[c.status]}
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {c.phone && <a href={`tel:${c.phone}`} className="hover:text-primary font-bold">{c.phone}</a>}
                  {c.email && <a href={`mailto:${c.email}`} className="hover:text-primary">{c.email}</a>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.message}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString("es-VE")}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteContact(c.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold mb-3 flex items-center gap-2">
            <ClipboardList size={18} className="text-primary" /> Solicitudes de cotización
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Formulario de cotización del sitio. Toca el estado para moverlo: Nuevo → Contactado → Cerrado.
          </p>
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            {quotes.length === 0 && (
              <p className="px-4 py-4 text-sm text-muted-foreground">Aún no hay solicitudes recibidas.</p>
            )}
            {quotes.map((q) => (
              <div key={q.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-heading font-bold">
                    {q.full_name}
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      · {q.vehicle_name} · {q.plan_name}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuoteStatus(q)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      q.status === "nuevo"
                        ? "border-primary text-primary"
                        : q.status === "contactado"
                          ? "border-amber-500 text-amber-500"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {QUOTE_STATUS_LABEL[q.status]}
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <a href={`tel:${q.phone}`} className="hover:text-primary font-bold">{q.phone}</a>
                  {q.email && <a href={`mailto:${q.email}`} className="hover:text-primary">{q.email}</a>}
                  {q.city && <span>{q.city}</span>}
                </div>
                {q.message && <p className="mt-1 text-sm text-muted-foreground">{q.message}</p>}
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(q.created_at).toLocaleString("es-VE")}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteQuote(q.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold mb-3 flex items-center gap-2">
            <Star size={18} className="text-primary" /> Reseñas de clientes
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Comparte este link con tus clientes al final de la compra para que dejen su reseña.
          </p>
          <button
            type="button"
            onClick={copyReviewLink}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Link2 size={16} /> Copiar link de reseñas
          </button>
          <ReviewInviteGenerator />
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            {reviews.length === 0 && (
              <p className="px-4 py-4 text-sm text-muted-foreground">Aún no hay reseñas recibidas.</p>
            )}
            {reviews.map((r) => (
              <div key={r.id} className="px-4 py-3">
                {r.photo_url && (
                  <img src={r.photo_url} alt="Foto de la reseña" className="mb-2 h-28 w-auto rounded-md border border-border object-cover" />
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-heading font-bold">
                    {r.customer_name}
                    {r.vehicle_name && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">· {r.vehicle_name}</span>
                    )}
                  </span>
                  <span className="flex items-center gap-0.5" aria-label={`${r.rating} de 5 estrellas`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={13}
                        className={n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("es-VE")}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleReviewApproved(r)}
                    className={`text-xs font-bold ${r.approved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                  >
                    {r.approved ? "Aprobada" : "Marcar como aprobada"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReview(r.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

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

        {!loading && !stats && (
          <p className="mt-10 text-muted-foreground">No se pudieron cargar las estadísticas. Intenta de nuevo.</p>
        )}
      </main>
    </>
  );

};

export default Stats;
