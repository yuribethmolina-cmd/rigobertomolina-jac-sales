/**
 * Revisión de un catálogo: tabla comparativa, corrección manual y publicación.
 * Nada se publica sin confirmación explícita.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { financingPlans, fmtUsd } from "@/data/financingPlans";
import { vehicles } from "@/data/vehicles";
import type { CatalogEntry, CatalogVersion, ChangeType } from "@/data/catalogStore";
import { loadActiveCatalogs } from "@/data/catalogStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
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

const cambioLabel: Record<ChangeType, string> = {
  UPDATED: "Actualizado",
  UNCHANGED: "Sin cambios",
  NEW: "Nuevo",
  REMOVED: "Retirado",
  NEEDS_REVIEW: "Requiere revisión",
};

const cambioClase: Record<ChangeType, string> = {
  UPDATED: "bg-primary/15 text-primary",
  UNCHANGED: "bg-muted text-muted-foreground",
  NEW: "bg-emerald-500/15 text-emerald-400",
  REMOVED: "bg-destructive/15 text-destructive",
  NEEDS_REVIEW: "bg-amber-500/20 text-amber-400",
};

const money = (v: number | null | undefined) => (v == null ? "—" : fmtUsd(Number(v)));

const AdminCatalogReview = () => {
  const { versionId } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState<CatalogVersion | null>(null);
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CatalogEntry | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const load = useCallback(async () => {
    if (!versionId) return;
    setLoading(true);
    const [{ data: v }, { data: e }] = await Promise.all([
      supabase.from("catalog_versions").select("*").eq("id", versionId).maybeSingle(),
      supabase
        .from("catalog_entries")
        .select("*")
        .eq("version_id", versionId)
        .order("position", { ascending: true }),
    ]);
    setVersion((v ?? null) as unknown as CatalogVersion | null);
    setEntries((e ?? []) as unknown as CatalogEntry[]);
    setLoading(false);
  }, [versionId]);

  useEffect(() => {
    document.title = "Revisar catálogo | Rigoberto Molina";
    load();
  }, [load]);

  const plan = financingPlans.find((p) => p.id === version?.plan_id);
  const pendientes = useMemo(
    () => entries.filter((e) => e.change_type === "NEEDS_REVIEW").length,
    [entries]
  );

  const guardarEdicion = async (
    entry: CatalogEntry,
    cambios: Partial<CatalogEntry>,
    campos: string[]
  ) => {
    const { error } = await supabase
      .from("catalog_entries")
      .update({
        ...(cambios as Record<string, unknown>),
        edited_fields: Array.from(new Set([...(entry.edited_fields ?? []), ...campos])),
      } as never)
      .eq("id", entry.id);
    if (error) {
      toast.error("No se pudo guardar el cambio");
      return;
    }
    toast.success("Registro corregido");
    setEditing(null);
    await load();
  };

  const publicar = async () => {
    if (!versionId) return;
    setConfirmPublish(false);
    const { error } = await supabase.rpc("publish_catalog_version", { _version_id: versionId });
    if (error) {
      toast.error(
        error.message?.includes("requieren revision")
          ? "Hay registros marcados como Requiere revisión. Corrígelos antes de publicar."
          : "No se pudo publicar el catálogo"
      );
      return;
    }
    await loadActiveCatalogs();
    toast.success("Catálogo publicado. El sitio y el Asesor JAC ya usan estos montos.");
    navigate("/admin/catalogos");
  };

  if (loading) return <p className="p-10 text-muted-foreground">Cargando…</p>;
  if (!version) return <p className="p-10 text-muted-foreground">Catálogo no encontrado.</p>;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <Link to="/admin/catalogos" className="text-sm text-primary underline">
            Volver al panel de catálogos
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {plan?.name ?? version.plan_id} — {version.catalog_date}
          </h1>
          <p className="text-muted-foreground">
            Estado:{" "}
            {version.status === "ACTIVE"
              ? "Activo"
              : version.status === "DRAFT"
                ? "Borrador"
                : "Archivado"}{" "}
            · {entries.length} modelos · Fuente: {version.source}
          </p>
          {pendientes > 0 && (
            <p className="rounded-md bg-amber-500/15 px-3 py-2 text-sm text-amber-400">
              {pendientes} registro(s) marcados como Requiere revisión. Corrígelos para poder
              publicar.
            </p>
          )}
        </header>

        {version.status === "DRAFT" && (
          <div className="flex justify-end">
            <Button onClick={() => setConfirmPublish(true)} disabled={pendientes > 0}>
              Aprobar y publicar
            </Button>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Modelo / versión</th>
                <th className="p-3">Dato actual</th>
                <th className="p-3">Dato nuevo</th>
                <th className="p-3">Tipo de cambio</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const previo = (entry.extra as any)?.previous as
                  | Record<string, number | string | null>
                  | null;
                return (
                  <tr key={entry.id} className="border-t border-border align-top">
                    <td className="p-3">
                      <div className="font-medium text-foreground">{entry.model_name}</div>
                      {entry.version_label && (
                        <div className="text-muted-foreground">{entry.version_label}</div>
                      )}
                      {entry.edited_fields?.length > 0 && (
                        <div className="mt-1 text-xs text-primary">Editado manualmente</div>
                      )}
                      {(entry.extra as any)?.review_reason && (
                        <div className="mt-1 text-xs text-amber-400">
                          {String((entry.extra as any).review_reason)}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {previo ? (
                        <>
                          Firma {money(previo.signature_amount as number)} ·{" "}
                          {previo.installments_count ?? "—"} x{" "}
                          {money(previo.installment_amount as number)} · Previo{" "}
                          {money(previo.pre_delivery_amount as number)}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      {entry.change_type === "REMOVED" ? (
                        "—"
                      ) : (
                        <>
                          Firma {money(entry.signature_amount)} ·{" "}
                          {entry.installments_count ?? "—"} x {money(entry.installment_amount)} ·
                          Previo {money(entry.pre_delivery_amount)}
                          {entry.promo && (
                            <div className="text-muted-foreground">Ñapa: {entry.promo}</div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${cambioClase[entry.change_type]}`}
                      >
                        {cambioLabel[entry.change_type]}
                      </span>
                    </td>
                    <td className="p-3">
                      {version.status === "DRAFT" && (
                        <Button size="sm" variant="outline" onClick={() => setEditing(entry)}>
                          Corregir
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <EditEntryDialog
          entry={editing}
          onClose={() => setEditing(null)}
          onSave={guardarEdicion}
        />
      )}

      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Publicar este catálogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Este catálogo pasará a ser el activo de {plan?.name ?? version.plan_id} y el anterior
              quedará archivado. El sitio y el Asesor JAC usarán estos montos de inmediato. Los
              demás planes no cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={publicar}>Aprobar y publicar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const EditEntryDialog = ({
  entry,
  onClose,
  onSave,
}: {
  entry: CatalogEntry;
  onClose: () => void;
  onSave: (e: CatalogEntry, cambios: Partial<CatalogEntry>, campos: string[]) => void;
}) => {
  const [form, setForm] = useState({
    model_name: entry.model_name ?? "",
    version_label: entry.version_label ?? "",
    vehicle_id: entry.vehicle_id ?? "",
    signature_amount: entry.signature_amount?.toString() ?? "",
    installments_count: entry.installments_count?.toString() ?? "",
    installment_amount: entry.installment_amount?.toString() ?? "",
    pre_delivery_amount: entry.pre_delivery_amount?.toString() ?? "",
    promo: entry.promo ?? "",
    conditions: entry.conditions ?? "",
  });

  const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

  const guardar = () => {
    const cambios: Partial<CatalogEntry> = {
      model_name: form.model_name.trim(),
      version_label: form.version_label.trim() || null,
      vehicle_id: form.vehicle_id.trim() || null,
      signature_amount: num(form.signature_amount),
      installments_count: num(form.installments_count),
      installment_amount: num(form.installment_amount),
      pre_delivery_amount: num(form.pre_delivery_amount),
      promo: form.promo.trim() || null,
      conditions: form.conditions.trim() || null,
      change_type: entry.change_type === "NEEDS_REVIEW" ? "UPDATED" : entry.change_type,
      extra: { ...entry.extra, schedule: undefined },
    };
    onSave(entry, cambios, Object.keys(form));
  };

  const campo = (key: keyof typeof form, label: string, list?: boolean) => (
    <div className="space-y-1">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        list={list ? "vehiculos" : undefined}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Corregir registro</DialogTitle>
        </DialogHeader>
        <datalist id="vehiculos">
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.displayName}
            </option>
          ))}
        </datalist>
        <div className="grid gap-3 sm:grid-cols-2">
          {campo("model_name", "Nombre del modelo")}
          {campo("version_label", "Versión")}
          {campo("vehicle_id", "Ficha del sitio", true)}
          {campo("signature_amount", "Monto a la firma")}
          {campo("installments_count", "Número de cuotas")}
          {campo("installment_amount", "Valor de cada cuota")}
          {campo("pre_delivery_amount", "Monto previo a la entrega")}
          {campo("promo", "Promoción o ñapa")}
          {campo("conditions", "Condiciones")}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={guardar}>Guardar corrección</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCatalogReview;
