/**
 * CRM privado (solo administradores): una sola bandeja con los contactos que
 * llegan por el Asesor JAC, las cotizaciones, las solicitudes de crédito y los
 * mensajes de contacto. Permite cambiar el estado de cada contacto, guardar
 * notas privadas y exportar la lista.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  CRM_SOURCES,
  CRM_STATUSES,
  SOURCE_LABEL,
  countByStatus,
  crmToCsv,
  crmWhatsAppMessage,
  filterCrmRecords,
  toCrmRecords,
  type CrmFilters,
  type CrmRecord,
  type CrmSource,
  type CrmStatus,
} from "@/lib/crm";
import { waLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileText,
  Home,
  MessageCircle,
  NotebookPen,
  StickyNote,
} from "lucide-react";

interface Note {
  id: string;
  source_table: string;
  source_id: string;
  note: string;
  created_by_email: string | null;
  created_at: string;
}

const noteKey = (source: string, id: string) => `${source}:${id}`;

const STATUS_BADGE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  nuevo: "default",
  contactado: "secondary",
  vendido: "outline",
  descartado: "destructive",
};

const applyStatus = (source: CrmSource, id: string, status: string) => {
  switch (source) {
    case "advisor_leads":
      return supabase.from("advisor_leads").update({ status }).eq("id", id);
    case "quote_requests":
      return supabase.from("quote_requests").update({ status }).eq("id", id);
    case "credit_applications":
      return supabase.from("credit_applications").update({ status }).eq("id", id);
    case "contact_messages":
      return supabase.from("contact_messages").update({ status }).eq("id", id);
  }
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" });
};

const AdminCRM = () => {
  const [records, setRecords] = useState<CrmRecord[]>([]);
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CrmFilters>({
    source: "todos",
    status: "todos",
    query: "",
  });
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [leads, quotes, credits, messages, notesResult] = await Promise.all([
      supabase.from("advisor_leads").select("*").order("created_at", { ascending: false }),
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("credit_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("crm_notes").select("*").order("created_at", { ascending: false }),
    ]);

    if (leads.error || quotes.error || credits.error || messages.error) {
      toast.error("No se pudieron cargar los contactos");
    }

    setRecords(
      toCrmRecords({
        advisor_leads: leads.data ?? [],
        quote_requests: quotes.data ?? [],
        credit_applications: credits.data ?? [],
        contact_messages: messages.data ?? [],
      }),
    );

    const grouped: Record<string, Note[]> = {};
    for (const note of (notesResult.data ?? []) as Note[]) {
      const key = noteKey(note.source_table, note.source_id);
      grouped[key] = [...(grouped[key] ?? []), note];
    }
    setNotes(grouped);
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = "CRM de contactos | Rigoberto Molina";
    load();
  }, [load]);

  const visible = useMemo(() => filterCrmRecords(records, filters), [records, filters]);
  const counts = useMemo(() => countByStatus(records), [records]);

  const changeStatus = async (record: CrmRecord, status: string) => {
    setSavingStatus(record.id);
    const { error } = await applyStatus(record.source, record.id, status);
    setSavingStatus(null);
    if (error) {
      toast.error("No se pudo guardar el estado");
      return;
    }
    setRecords((current) =>
      current.map((item) => (item.id === record.id ? { ...item, status } : item)),
    );
    toast.success(`${record.name}: ${status}`);
  };

  const saveNote = async (record: CrmRecord) => {
    const text = draft.trim();
    if (!text) return;
    setSavingNote(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user?.email ?? null;
    const { data, error } = await supabase
      .from("crm_notes")
      .insert({
        source_table: record.source,
        source_id: record.id,
        note: text,
        created_by_email: email,
      })
      .select()
      .single();
    setSavingNote(false);
    if (error || !data) {
      toast.error("No se pudo guardar la nota");
      return;
    }
    const key = noteKey(record.source, record.id);
    setNotes((current) => ({
      ...current,
      [key]: [data as Note, ...(current[key] ?? [])],
    }));
    setDraft("");
    toast.success("Nota guardada");
  };

  const exportCsv = () => {
    const csv = crmToCsv(visible);
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crm-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM de contactos</h1>
            <p className="text-sm text-muted-foreground">
              Asesor, cotizaciones, solicitudes de crédito y mensajes de contacto en una sola lista.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin"><ArrowLeft className="h-4 w-4" /> Volver al admin</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/"><Home className="h-4 w-4" /> Inicio</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/catalogos">Catálogos</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/documentos">Documentos</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/estadisticas">Estadísticas</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CRM_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={chip(filters.status === status)}
              onClick={() =>
                setFilters((f) => ({ ...f, status: f.status === status ? "todos" : status }))
              }
            >
              {status} ({counts[status] ?? 0})
            </button>
          ))}
          <button
            type="button"
            className={chip(filters.status === "todos")}
            onClick={() => setFilters((f) => ({ ...f, status: "todos" }))}
          >
            todos ({records.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CRM_SOURCES.map((source) => (
            <button
              key={source}
              type="button"
              className={chip(filters.source === source)}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  source: f.source === source ? "todos" : (source as CrmSource),
                }))
              }
            >
              {SOURCE_LABEL[source]}
            </button>
          ))}
          <button
            type="button"
            className={chip(filters.source === "todos")}
            onClick={() => setFilters((f) => ({ ...f, source: "todos" }))}
          >
            todas las fuentes
          </button>
          <Input
            value={filters.query}
            onChange={(event) => setFilters((f) => ({ ...f, query: event.target.value }))}
            placeholder="Buscar por nombre, teléfono, modelo..."
            className="w-full md:w-72"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Cargando contactos...</p>
        ) : visible.length === 0 ? (
          <p className="text-muted-foreground">
            No hay contactos con ese filtro. Los mensajes que abre la gente por WhatsApp no se
            guardan aquí hasta que dejen sus datos o el asesor los registre.
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((record) => {
              const key = noteKey(record.source, record.id);
              const recordNotes = notes[key] ?? [];
              const isOpen = open === key;
              return (
                <div key={key} className="rounded-lg border border-border bg-card p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{record.name}</p>
                        <Badge variant="secondary">{record.sourceLabel}</Badge>
                        <Badge variant={STATUS_BADGE[record.status] ?? "outline"}>
                          {record.status}
                        </Badge>
                        {record.score ? <Badge variant="outline">{record.score}</Badge> : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {[record.phone, record.email, record.city].filter(Boolean).join(" · ") ||
                          "Sin teléfono ni correo"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {[record.model, record.plan].filter(Boolean).join(" · ") ||
                          "Sin modelo indicado"}
                      </p>
                      {record.extra ? (
                        <p className="text-sm text-muted-foreground">{record.extra}</p>
                      ) : null}
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.created_at)}
                      </p>
                      {record.documents > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {record.documents} archivo(s)
                        </p>
                      ) : null}
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={waLink(crmWhatsAppMessage(record))}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" /> WhatsApp
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOpen(isOpen ? null : key);
                            setDraft("");
                          }}
                        >
                          <StickyNote className="h-4 w-4" />
                          Notas ({recordNotes.length})
                        </Button>
                      </div>
                      <div className="flex justify-end">
                        <Select
                          value={record.status}
                          onValueChange={(value) => changeStatus(record, value as CrmStatus)}
                          disabled={savingStatus === record.id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {CRM_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {record.detail ? (
                    <p className="text-sm text-foreground">{record.detail}</p>
                  ) : null}

                  {isOpen ? (
                    <div className="rounded-md border border-border bg-background p-4 space-y-3">
                      {recordNotes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Todavía no hay notas en este contacto.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {recordNotes.map((note) => (
                            <li key={note.id} className="text-sm text-foreground">
                              <span className="font-medium">{note.note}</span>
                              <span className="text-xs text-muted-foreground">
                                {" "}
                                — {note.created_by_email ?? "admin"} ·{" "}
                                {formatDate(note.created_at)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          placeholder="Nota privada: qué se habló, cuándo llamar, lo que haga falta"
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            disabled={savingNote || draft.trim().length === 0}
                            onClick={() => saveNote(record)}
                          >
                            <NotebookPen className="h-4 w-4" /> Guardar nota
                          </Button>
                        </div>
                      </div>
                      {record.source === "credit_applications" ? (
                        <Button asChild size="sm" variant="outline">
                          <Link to="/admin/documentos">
                            <FileText className="h-4 w-4" /> Ver documentos del cliente
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCRM;
