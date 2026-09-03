import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
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

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select(
        "id, customer_name, vehicle_name, rating, message, photo_url, approved, created_at",
      )
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(9);
    setReviews((data as Review[]) ?? []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded) return null;
  if (reviews.length === 0) return null;

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3"
            >
              {r.photo_url && (
                <img
                  src={r.photo_url}
                  alt={`Foto del vehículo de ${r.customer_name}`}
                  className="h-40 w-full rounded-lg object-cover"
                  loading="lazy"
                />
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
