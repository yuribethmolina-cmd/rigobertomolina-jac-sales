/**
 * Panel privado de catálogos — listado por plan, carga de PDF e historial.
 * Solo accesible para administradores (protegido en App.tsx).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { financingPlans } from "@/data/financingPlans";
import type { CatalogVersion } from "@/data/catalogStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const estadoLabel: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  ARCHIVED: "Archivado",
};

const estadoVariant = (status: string) =>
  status === "ACTIVE" ? "default" : status === "DRAFT" ? "secondary" : "outline";

const AdminCatalogs = () => {
  const [versions, setVersions] = useState<CatalogVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadPlan, setUploadPlan] = useState<string | null>(null);
  const [catalogDate, setCatalogDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [working, setWorking] = useState(false);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [historyPlan, setHistoryPlan] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("catalog_versions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("No se pudo cargar el historial de catálogos");
    setVersions((data ?? []) as unknown as CatalogVersion[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = "Panel de catálogos | Rigoberto Molina";
    load();
  }, [load]);

  const byPlan = useMemo(() => {
    const map: Record<string, CatalogVersion[]> = {};
    for (const v of versions) (map[v.plan_id] ??= []).push(v);
    return map;
  }, [versions]);

  const procesar = async () => {
    if (!uploadPlan || !file || !catalogDate.trim()) {
      toast.error("Indica la fecha del catálogo y elige el PDF");
      return;
    }
    setWorking(true);
    try {
      const path = `${uploadPlan}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("catalog-pdfs")
        .upload(path, file, { contentType: "application/pdf" });
      if (uploadError) throw new Error("No se pudo subir el PDF");

      const { data, error } = await supabase.functions.invoke("extraer-catalogo", {
        body: { planId: uploadPlan, catalogDate: catalogDate.trim(), pdfPath: path },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error ?? "No se pudo procesar el PDF");
      }
      toast.success("Catálogo procesado. Revisa los cambios antes de publicar.");
      setUploadPlan(null);
      setFile(null);
      setCatalogDate("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo procesar el catálogo");
    } finally {
      setWorking(false);
    }
  };

  const restaurar = async () => {
    if (!restoreId) return;
    const { error } = await supabase.rpc("rollback_catalog_version", { _version_id: restoreId });
    setRestoreId(null);
    if (error) {
      toast.error("No se pudo restaurar el catálogo");
      return;
    }
    toast.success("Catálogo restaurado");
    await load();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Panel de catálogos</h1>
          <p className="text-muted-foreground">
            Actualiza los montos de cada plan subiendo su catálogo en PDF. Nada se publica sin tu
            aprobación.
          </p>
          <Link to="/" className="text-sm text-primary underline">
            Volver al inicio
          </Link>
        </header>

        {loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : (
          <div className="space-y-4">
            {financingPlans.map((plan) => {
              const all = byPlan[plan.id] ?? [];
              const active = all.find((v) => v.status === "ACTIVE");
              const drafts = all.filter((v) => v.status === "DRAFT");
              const archived = all.filter((v) => v.status === "ARCHIVED");

              return (
                <section
                  key={plan.id}
                  className="rounded-lg border border-border bg-card p-5 text-card-foreground"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">{plan.name}</h2>
                        <Badge variant={active ? "default" : "outline"}>
                          {active ? "Activo" : "Sin catálogo cargado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Catálogo activo: {active?.catalog_date ?? "—"} · Modelos:{" "}
                        {active?.entries_count ?? 0} · Fuente: {active?.source ?? "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Última actualización:{" "}
                        {active?.published_at
                          ? new Date(active.published_at).toLocaleString("es-VE")
                          : "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {active && (
                        <Button variant="outline" asChild>
                          <Link to={`/admin/catalogos/${active.id}`}>Ver datos</Link>
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setUploadPlan(plan.id);
                          setCatalogDate("");
                          setFile(null);
                        }}
                      >
                        Actualizar catálogo
                      </Button>
                      {all.length > 0 && (
                        <Button
                          variant="ghost"
                          onClick={() => setHistoryPlan(historyPlan === plan.id ? null : plan.id)}
                        >
                          {historyPlan === plan.id ? "Ocultar historial" : "Historial"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {drafts.length > 0 && (
                    <div className="mt-4 rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
                      <p className="font-medium">
                        {drafts.length === 1
                          ? "Hay un catálogo en borrador pendiente de revisión."
                          : `Hay ${drafts.length} catálogos en borrador pendientes de revisión.`}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {drafts.map((d) => (
                          <Button key={d.id} size="sm" asChild>
                            <Link to={`/admin/catalogos/${d.id}`}>
                              Revisar cambios ({d.catalog_date})
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {historyPlan === plan.id && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-muted-foreground">
                          <tr>
                            <th className="py-2 pr-4">Fecha del catálogo</th>
                            <th className="py-2 pr-4">Fecha de carga</th>
                            <th className="py-2 pr-4">Estado</th>
                            <th className="py-2 pr-4">Fuente</th>
                            <th className="py-2">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {all.map((v) => (
                            <tr key={v.id} className="border-t border-border">
                              <td className="py-2 pr-4">{v.catalog_date}</td>
                              <td className="py-2 pr-4">
                                {new Date(v.created_at).toLocaleDateString("es-VE")}
                              </td>
                              <td className="py-2 pr-4">
                                <Badge variant={estadoVariant(v.status)}>
                                  {estadoLabel[v.status]}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4">{v.source}</td>
                              <td className="py-2">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={`/admin/catalogos/${v.id}`}>Ver</Link>
                                  </Button>
                                  {v.status === "ARCHIVED" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setRestoreId(v.id)}
                                    >
                                      Restaurar
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {archived.length === 0 && all.length === 0 && (
                            <tr>
                              <td className="py-2 text-muted-foreground" colSpan={5}>
                                Todavía no hay catálogos cargados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!uploadPlan} onOpenChange={(open) => !open && !working && setUploadPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar catálogo</DialogTitle>
            <DialogDescription>
              Sube el PDF y escribe la fecha del catálogo. Se creará un borrador para que revises
              los cambios antes de publicar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catalog-date">Fecha del catálogo</Label>
              <Input
                id="catalog-date"
                placeholder="16 de septiembre"
                value={catalogDate}
                onChange={(e) => setCatalogDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catalog-pdf">Archivo PDF</Label>
              <Input
                id="catalog-pdf"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadPlan(null)} disabled={working}>
              Cancelar
            </Button>
            <Button onClick={procesar} disabled={working}>
              {working ? "Procesando…" : "Procesar documento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!restoreId} onOpenChange={(open) => !open && setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar este catálogo?</AlertDialogTitle>
            <AlertDialogDescription>
              El catálogo seleccionado volverá a ser el activo de este plan y el actual quedará
              archivado. Los demás planes no cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={restaurar}>Restaurar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCatalogs;
