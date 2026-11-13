/**
 * Bandeja privada de documentos enviados por clientes (solo administradores).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download } from "lucide-react";

type Doc = { label: string; path: string; name: string };
type App = {
  id: string; full_name: string; id_number: string; phone: string; email: string | null;
  vehicle_name: string | null; plan_name: string; message: string | null;
  documents: Doc[]; status: string; created_at: string;
};

const AdminDocumentos = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Documentos de clientes | Rigoberto Molina";
    supabase.from("credit_applications").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("No se pudieron cargar las solicitudes");
        setApps((data ?? []) as unknown as App[]);
        setLoading(false);
      });
  }, []);

  const descargar = async (doc: Doc) => {
    setBusy(doc.path);
    const { data, error } = await supabase.storage
      .from("credit-documents")
      .createSignedUrl(doc.path, 60, { download: doc.name });
    setBusy(null);
    if (error || !data) return toast.error("No se pudo descargar el archivo");
    window.location.href = data.signedUrl;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">Documentos de clientes</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/admin/catalogos">Catálogos</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/estadisticas">Estadísticas</Link></Button>
          </div>
        </div>
        {loading ? <p className="text-muted-foreground">Cargando...</p> :
          apps.length === 0 ? <p className="text-muted-foreground">Todavía no hay solicitudes con documentos.</p> :
          apps.map((a) => (
            <div key={a.id} className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{a.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    C.I. {a.id_number} · {a.phone}{a.email ? ` · ${a.email}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.plan_name}{a.vehicle_name ? ` · ${a.vehicle_name}` : ""}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary">{a.status}</Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
              {a.message && <p className="text-sm text-foreground">{a.message}</p>}
              <div className="flex flex-wrap gap-2">
                {(a.documents ?? []).map((d) => (
                  <Button key={d.path} size="sm" variant="outline" disabled={busy === d.path} onClick={() => descargar(d)}>
                    <Download className="h-4 w-4" /> {d.label}: {d.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminDocumentos;
