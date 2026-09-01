import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Star, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  customer_name: string;
  vehicle_name: string | null;
  rating: number;
  message: string;
  photo_url: string | null;
  approved: boolean;
  created_at: string;
}

const ModerateReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select(
        "id, customer_name, vehicle_name, rating, message, photo_url, approved, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) toast.error("No se pudieron cargar las reseñas");
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setApproved = async (id: string, approved: boolean) => {
    setBusyId(id);
    const { error } = await supabase.from("reviews").update({ approved }).eq("id", id);
    setBusyId(null);
    if (error) {
      toast.error("No se pudo actualizar la reseña");
      return;
    }
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)));
    toast.success(approved ? "Reseña publicada en la web" : "Reseña retirada de la web");
  };

  const remove = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    setBusyId(null);
    if (error) {
      toast.error("No se pudo eliminar la reseña");
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reseña eliminada");
  };

  const pending = reviews.filter((r) => !r.approved);
  const published = reviews.filter((r) => r.approved);

  const Card = ({ r }: { r: Review }) => (
    <article className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      {r.photo_url && (
        <img
          src={r.photo_url}
          alt={`Foto enviada por ${r.customer_name}`}
          className="h-40 w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}
      <div className="flex gap-1" aria-label={`Calificación: ${r.rating} de 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
      <p className="text-foreground leading-relaxed flex-1">"{r.message}"</p>
      <footer className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{r.customer_name}</span>
        {r.vehicle_name ? ` · ${r.vehicle_name}` : ""}
        {" · "}
        {new Date(r.created_at).toLocaleDateString("es-VE")}
      </footer>
      <div className="flex flex-wrap gap-2 pt-1">
        {r.approved ? (
          <button
            type="button"
            disabled={busyId === r.id}
            onClick={() => setApproved(r.id, false)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-heading font-bold disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" /> Retirar de la web
          </button>
        ) : (
          <button
            type="button"
            disabled={busyId === r.id}
            onClick={() => setApproved(r.id, true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-heading font-bold disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Aprobar y publicar
          </button>
        )}
        <button
          type="button"
          disabled={busyId === r.id}
          onClick={() => remove(r.id)}
          className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 text-destructive px-4 py-2 text-sm font-heading font-bold disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Eliminar
        </button>
      </div>
    </article>
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Moderación de reseñas
          </h1>
          <p className="text-muted-foreground">
            Aprueba las reseñas para que aparezcan en la web pública, o retíralas cuando quieras.
          </p>
          <div className="flex gap-3 text-sm">
            <Link to="/estadisticas" className="text-primary hover:underline">
              Panel de estadísticas
            </Link>
            <Link to="/resena" className="text-primary hover:underline">
              Formulario de reseña
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Cargando reseñas...</p>
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Pendientes por aprobar ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <p className="text-muted-foreground">No hay reseñas pendientes.</p>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {pending.map((r) => (
                    <Card key={r.id} r={r} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Publicadas ({published.length})
              </h2>
              {published.length === 0 ? (
                <p className="text-muted-foreground">Aún no hay reseñas publicadas.</p>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {published.map((r) => (
                    <Card key={r.id} r={r} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default ModerateReviews;
