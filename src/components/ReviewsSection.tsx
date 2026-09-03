import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Star, Undo2 } from "lucide-react";
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

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (admin: boolean) => {
    let query = supabase
      .from("reviews")
      .select(
        "id, customer_name, vehicle_name, rating, message, photo_url, approved, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(admin ? 30 : 9);
    if (!admin) query = query.eq("approved", true);
    const { data } = await query;
    setReviews((data as Review[]) ?? []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      let admin = false;
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        admin = !!data;
      }
      if (!active) return;
      setIsAdmin(admin);
      load(admin);
    };

    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    check();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
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

  if (!loaded) return null;
  if (reviews.length === 0 && !isAdmin) return null;

  const pendingCount = reviews.filter((r) => !r.approved).length;

  return (
    <section id="resenas" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-muted-foreground">
            Reseñas reales de compradores que estrenaron su JAC con nosotros.
          </p>
          <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full" />
        </div>

        {isAdmin && pendingCount > 0 && (
          <div className="max-w-6xl mx-auto mb-8 rounded-xl border border-primary/40 bg-primary/5 p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-foreground">
              Tienes {pendingCount} reseña{pendingCount === 1 ? "" : "s"} pendiente{pendingCount === 1 ? "" : "s"} por aprobar.
            </p>
            <Link
              to="/resenas/moderar"
              className="rounded-lg bg-primary text-primary-foreground font-heading font-bold px-4 py-2 text-sm"
            >
              Abrir moderación completa
            </Link>
          </div>
        )}


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {reviews.map((r) => (
            <article
              key={r.id}
              className={`rounded-xl border bg-card p-6 flex flex-col gap-3 ${
                r.approved ? "border-border" : "border-primary/50"
              }`}
            >
              {r.photo_url && (
                <img
                  src={r.photo_url}
                  alt={`Foto del vehículo de ${r.customer_name}`}
                  className="h-40 w-full rounded-lg object-cover"
                  loading="lazy"
                />
              )}
              {isAdmin && !r.approved && (
                <span className="self-start rounded-full bg-primary/15 text-primary text-xs font-heading font-bold px-3 py-1">
                  Pendiente por aprobar
                </span>
              )}
              <div
                className="flex gap-1"
                aria-label={`Calificación: ${r.rating} de 5 estrellas`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < r.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-foreground leading-relaxed flex-1">
                "{r.message}"
              </p>
              <footer className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {r.customer_name}
                </span>
                {r.vehicle_name ? ` · ${r.vehicle_name}` : ""}
              </footer>
              {isAdmin && (
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => setApproved(r.id, !r.approved)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-heading font-bold disabled:opacity-50 ${
                    r.approved
                      ? "border border-border text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {r.approved ? (
                    <>
                      <Undo2 className="w-4 h-4" /> Retirar de la web
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Aprobar y publicar
                    </>
                  )}
                </button>
              )}
            </article>
          ))}
        </div>

        <p className="text-center mt-10">
          <Link to="/resena" className="text-primary hover:underline">
            ¿Ya compraste con nosotros? Deja tu reseña
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ReviewsSection;
